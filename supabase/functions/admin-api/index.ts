import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { AdminPracticeRequest, AdminImpersonateRequest, AssignDesignationRequest, DesignationItem, Practice } from "../_shared/api-types.ts"
import { calculateDistance } from "../_shared/routing-engine.ts"
import { requireAdminAuth } from "../_shared/admin-auth.ts"
import { maybeSyncLeadToGHL } from "../_shared/ghl.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const url = new URL(req.url)
  const path = url.pathname

  try {
    // SECURITY: Enforce Admin Auth
    // This throws if unauthorized (401) or forbidden (403)
    let adminUserId: string;
    try {
      adminUserId = await requireAdminAuth(req);
    } catch (err) {
      const status = err.message.startsWith('Forbidden') ? 403 : 401;
      return new Response(JSON.stringify({ error: err.message }), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Initialize Service Role Client for Admin Operations
    // We use service role here because admins need cross-practice access and access to protected tables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // GET /admin/practices
    if (req.method === 'GET' && path.endsWith('/admin/practices')) {
      const { data, error } = await supabase
        .from('practices')
        .select('id, name, status, address, lat, lng, radius_miles, booking_settings, profile_payload, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify({ data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // POST /admin/practices
    if (req.method === 'POST' && path.endsWith('/admin/practices')) {
      const payload = await req.json() as AdminPracticeRequest;

      if (!payload.name) {
        return new Response(JSON.stringify({ error: 'Name is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const { data, error } = await supabase
        .from('practices')
        .insert({
          name: payload.name,
          address: payload.address,
          lat: payload.lat,
          lng: payload.lng,
          radius_miles: payload.radius_miles,
          status: payload.status || 'active',
          booking_settings: payload.booking_settings || {},
          profile_payload: payload.profile_payload || {}
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 })
    }

    // PATCH /admin/practices/:id
    const patchPracticeMatch = path.match(/\/admin\/practices\/([^\/]+)$/);
    if (req.method === 'PATCH' && patchPracticeMatch) {
      const practiceId = patchPracticeMatch[1];
      const payload = await req.json() as Partial<AdminPracticeRequest>;

      // 1. Fetch Existing
      const { data: existing, error: fetchError } = await supabase
        .from('practices')
        .select('*')
        .eq('id', practiceId)
        .single();

      if (fetchError || !existing) {
        return new Response(JSON.stringify({ error: 'Practice not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // 2. Update
      const { data: updated, error: updateError } = await supabase
        .from('practices')
        .update(payload)
        .eq('id', practiceId)
        .select()
        .single();

      if (updateError) throw updateError;

      // 3. Audit Log
      const { error: auditError } = await supabase
        .from('audit_log')
        .insert({
          entity_type: 'practice',
          entity_id: practiceId,
          action: 'update',
          performed_by: adminUserId,
          metadata: {
            before: existing,
            after: updated
          }
        });
      
      if (auditError) console.error('Audit log failed', auditError);

      return new Response(JSON.stringify(updated), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // GET /admin/map/practices
    if (req.method === 'GET' && path.endsWith('/admin/map/practices')) {
      const includeMissing = url.searchParams.get('include_missing') === 'true';
      
      let query = supabase
        .from('practices')
        .select('id, name, status, lat, lng, radius_miles');

      if (!includeMissing) {
        query = query.not('lat', 'is', null).not('lng', 'is', null);
      }

      const { data, error } = await query;
      
      if (error) throw error;

      return new Response(JSON.stringify({ data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // POST /admin/map/preview
    if (req.method === 'POST' && path.endsWith('/admin/map/preview')) {
      const { lat, lng, radius_miles } = await req.json();

      if (lat === undefined || lng === undefined || radius_miles === undefined) {
         return new Response(JSON.stringify({ error: 'lat, lng, and radius_miles are required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // Fetch all active practices
      const { data: practices, error } = await supabase
        .from('practices')
        .select('id, name, status, lat, lng, radius_miles')
        .eq('status', 'active')
        .not('lat', 'is', null)
        .not('lng', 'is', null);

      if (error) throw error;

      const overlaps = [];

      for (const p of (practices as Practice[])) {
        if (p.lat == null || p.lng == null) continue;

        const distance = calculateDistance(lat, lng, p.lat, p.lng);
        // Overlap rule: distance <= (input.radius + practice.radius)
        if (distance <= (radius_miles + Number(p.radius_miles))) {
          overlaps.push({
            practice_id: p.id,
            name: p.name,
            status: p.status,
            lat: p.lat,
            lng: p.lng,
            radius_miles: p.radius_miles,
            distance_miles: parseFloat(distance.toFixed(2)),
            overlap: true
          });
        }
      }

      // Audit Log
      await supabase.from('audit_log').insert({
        entity_type: 'map_preview',
        entity_id: 'preview', // No specific entity
        action: 'map_preview',
        performed_by: adminUserId,
        metadata: {
          input: { lat, lng, radius_miles },
          overlap_count: overlaps.length
        }
      });

      return new Response(JSON.stringify({
        input: { lat, lng, radius_miles },
        overlaps
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // POST /admin/impersonate
    if (req.method === 'POST' && path.endsWith('/admin/impersonate')) {
      // Stub
      const payload = await req.json() as AdminImpersonateRequest;
      return new Response(JSON.stringify({ token: 'stub' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // GET /admin/leads/:id
    const leadMatch = path.match(/\/admin\/leads\/([^\/]+)$/);
    if (req.method === 'GET' && leadMatch) {
      const leadId = leadMatch[1];
      const { data: lead, error } = await supabase
        .from('leads')
        .select('id, created_at, first_name, last_name, email, phone, zip, source, practice_id, routing_outcome, designation_reason, routing_snapshot, practices(name)')
        .eq('id', leadId)
        .single();

      if (error || !lead) {
        return new Response(JSON.stringify({ error: 'Lead not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const practice_name = (lead as any).practices?.name ?? null;
      const ENABLE_GHL_SYNC = (Deno.env.get('ENABLE_GHL_SYNC') ?? 'false').toLowerCase() === 'true';
      const ghl_sync_status = ENABLE_GHL_SYNC ? 'enabled_stub' : 'disabled';
      const ghl_would_sync = !!lead.practice_id; // simple MVP: only if assigned
      const lead_status =
        lead.practice_id
          ? 'Assigned'
          : lead.routing_outcome === 'designation'
            ? 'Needs Review'
            : (lead.routing_outcome === 'no_provider_in_radius' || lead.designation_reason === 'zip_not_found')
              ? 'No Coverage'
              : 'New';

      const response = { ...lead, practice_name, ghl_sync_status, ghl_would_sync, lead_status };

      return new Response(JSON.stringify({ data: response }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // POST /admin/leads/:id/reassign
    const reassignMatch = path.match(/\/admin\/leads\/([^\/]+)\/reassign$/);
    if (req.method === 'POST' && reassignMatch) {
      const leadId = reassignMatch[1];
      const { practice_id } = await req.json();

      if (!practice_id) {
        return new Response(JSON.stringify({ error: 'practice_id is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // Validate lead exists
      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .select('id, practice_id, routing_outcome, designation_reason')
        .eq('id', leadId)
        .single();

      if (leadError || !lead) {
        return new Response(JSON.stringify({ error: 'Lead not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // Validate practice exists
      const { data: practice, error: practiceError } = await supabase
        .from('practices')
        .select('id, name')
        .eq('id', practice_id)
        .single();

      if (practiceError || !practice) {
        return new Response(JSON.stringify({ error: 'Practice not found' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const fromPracticeId = lead.practice_id;

      // Update lead
      const { data: updatedLead, error: updateLeadError } = await supabase
        .from('leads')
        .update({
          practice_id,
          routing_outcome: 'assigned'
        })
        .eq('id', leadId)
        .select('id, created_at, first_name, last_name, email, phone, zip, source, practice_id, routing_outcome, designation_reason, routing_snapshot, practices(name)')
        .single();

      if (updateLeadError || !updatedLead) {
        return new Response(JSON.stringify({ error: 'Failed to update lead' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // Audit log
      const { error: auditError } = await supabase
        .from('audit_log')
        .insert({
          entity_type: 'lead',
          entity_id: leadId,
          action: 'reassign_practice',
          performed_by: adminUserId,
          metadata: {
            from_practice_id: fromPracticeId,
            to_practice_id: practice_id
          }
        });

      if (auditError) console.error('Audit log failed', auditError);

      const ENABLE_GHL_SYNC = (Deno.env.get('ENABLE_GHL_SYNC') ?? 'false').toLowerCase() === 'true';
      const ghl_sync_status = ENABLE_GHL_SYNC ? 'enabled_stub' : 'disabled';
      const ghl_would_sync = !!updatedLead.practice_id;
      const lead_status = updatedLead.practice_id ? 'Assigned' :
        updatedLead.routing_outcome === 'designation' ? 'Needs Review' :
        ((updatedLead.routing_outcome === 'no_provider_in_radius' || updatedLead.designation_reason === 'zip_not_found') ? 'No Coverage' : 'New');
      const practice_name = (updatedLead as any).practices?.name ?? null;

      const response = { ...updatedLead, practice_name, ghl_sync_status, ghl_would_sync, lead_status };

      return new Response(JSON.stringify({ data: response }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // POST /admin/leads/:id/unassign
    const unassignMatch = path.match(/\/admin\/leads\/([^\/]+)\/unassign$/);
    if (req.method === 'POST' && unassignMatch) {
      const leadId = unassignMatch[1];

      // Load lead
      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .select('id, practice_id, routing_outcome, designation_reason, routing_snapshot')
        .eq('id', leadId)
        .single();

      if (leadError || !lead) {
        return new Response(JSON.stringify({ error: 'Lead not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const fromPracticeId = lead.practice_id;

      // Update lead: clear practice, set routing_outcome to designation, mark reason
      const newRoutingSnapshot = {
        ...(lead.routing_snapshot || {}),
        manual_reason: 'manual_unassigned'
      };

      const { data: updatedLead, error: updateLeadError } = await supabase
        .from('leads')
        .update({
          practice_id: null,
          routing_outcome: 'designation',
          designation_reason: 'manual_unassigned',
          routing_snapshot: newRoutingSnapshot
        })
        .eq('id', leadId)
        .select('id, created_at, first_name, last_name, email, phone, zip, source, practice_id, routing_outcome, designation_reason, routing_snapshot, practices(name)')
        .single();

      if (updateLeadError || !updatedLead) {
        return new Response(JSON.stringify({ error: 'Failed to unassign lead' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // Ensure designation_review exists (if none open)
      const { data: existingReview, error: reviewCheckError } = await supabase
        .from('designation_review')
        .select('id, resolved_at')
        .eq('lead_id', leadId)
        .is('resolved_at', null)
        .maybeSingle();

      if (!reviewCheckError && !existingReview) {
        // create a new review item
        await supabase.from('designation_review').insert({
          lead_id: leadId,
          reason_code: 'manual_unassigned',
          notes: 'Manually unassigned by admin'
        });
      }

      // Audit log
      const { error: auditError } = await supabase
        .from('audit_log')
        .insert({
          entity_type: 'lead',
          entity_id: leadId,
          action: 'unassign_practice',
          performed_by: adminUserId,
          metadata: {
            from_practice_id: fromPracticeId,
            to_practice_id: null
          }
        });

      if (auditError) console.error('Audit log failed', auditError);

      const ENABLE_GHL_SYNC = (Deno.env.get('ENABLE_GHL_SYNC') ?? 'false').toLowerCase() === 'true';
      const ghl_sync_status = ENABLE_GHL_SYNC ? 'enabled_stub' : 'disabled';
      const ghl_would_sync = !!updatedLead.practice_id;
      const lead_status = updatedLead.practice_id ? 'Assigned' :
        updatedLead.routing_outcome === 'designation' ? 'Needs Review' :
        ((updatedLead.routing_outcome === 'no_provider_in_radius' || updatedLead.designation_reason === 'zip_not_found') ? 'No Coverage' : 'New');
      const practice_name = (updatedLead as any).practices?.name ?? null;

      const response = { ...updatedLead, practice_name, ghl_sync_status, ghl_would_sync, lead_status };

      return new Response(JSON.stringify({ data: response }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // GET /admin/leads (list)
    if (req.method === 'GET' && path.endsWith('/admin/leads')) {
      const q = url.searchParams.get('q');
      const limit = Math.min(Number(url.searchParams.get('limit') ?? '25'), 100);
      const offset = Number(url.searchParams.get('offset') ?? '0');

      let query = supabase
        .from('leads')
        .select('id, created_at, zip, source, routing_outcome, designation_reason, practice_id, practices(name)')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (q && q.trim().length > 0) {
        const pattern = `%${q.trim()}%`;
        query = query.or(`zip.ilike.${pattern},email.ilike.${pattern},phone.ilike.${pattern},id.eq.${q.trim()}`);
      }

      const { data, error } = await query;
      if (error) throw error;

      const mapped = (data || []).map((row: any) => {
        const lead_status =
          row.practice_id
            ? 'Assigned'
            : row.routing_outcome === 'designation'
              ? 'Needs Review'
              : (row.routing_outcome === 'no_provider_in_radius' || row.designation_reason === 'zip_not_found')
                ? 'No Coverage'
                : 'New';
        return {
          id: row.id,
          created_at: row.created_at,
          zip: row.zip,
          source: row.source,
          routing_outcome: row.routing_outcome,
          designation_reason: row.designation_reason,
          practice_id: row.practice_id,
          practice_name: row.practices?.name ?? null,
          lead_status,
        };
      });

      return new Response(JSON.stringify({ data: mapped }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // POST /admin/leads/cleanup-test
    if (req.method === 'POST' && path.endsWith('/admin/leads/cleanup-test')) {
      const targetZip = '99999';
      const { data, error } = await supabase
        .from('leads')
        .delete()
        .eq('zip', targetZip);

      if (error) throw error;

      const deletedCount = (data as any[])?.length ?? 0;
      console.info(`ADMIN_TEST_CLEANUP — deleted ${deletedCount} test leads`);

      return new Response(JSON.stringify({ deleted_count: deletedCount }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // GET /designation_review
    if (req.method === 'GET' && path.endsWith('/designation_review')) {
       // Fetch unresolved reviews with explicit lead_id and lead basics
       const { data, error } = await supabase
         .from('designation_review')
         .select(`
            id,
            lead_id,
            reason_code,
            notes,
            created_at,
            resolved_at,
            leads!inner (
              id,
              zip,
              created_at
            )
         `)
         .is('resolved_at', null)
         .order('created_at', { ascending: false });

       if (error) throw error;

       const mapped = (data || []).map((row: any) => ({
         id: row.id,
         lead_id: row.lead_id ?? row.leads?.id ?? null,
         reason_code: row.reason_code,
         created_at: row.created_at,
         resolved_at: row.resolved_at,
         lead_zip: row.leads?.zip ?? null,
         lead_created_at: row.leads?.created_at ?? null,
         notes: row.notes
       }));
       
       return new Response(JSON.stringify({ data: mapped }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // POST /designation_review/:id/assign
    const assignMatch = path.match(/\/designation_review\/([^\/]+)\/assign$/);
    if (req.method === 'POST' && assignMatch) {
       const reviewId = assignMatch[1];
       const { assigned_practice_id, notes } = await req.json() as AssignDesignationRequest;

       if (!assigned_practice_id) {
         return new Response(JSON.stringify({ error: 'assigned_practice_id is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
       }

       // 1. Validate Review State
       const { data: review, error: reviewError } = await supabase
         .from('designation_review')
         .select('id, lead_id, resolved_at')
         .eq('id', reviewId)
         .single();

       if (reviewError || !review) {
         return new Response(JSON.stringify({ error: 'Review item not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
       }

       if (review.resolved_at) {
         return new Response(JSON.stringify({ error: 'Review already resolved' }), { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
       }

       // 2. Validate Practice State
       const { data: practice, error: practiceError } = await supabase
         .from('practices')
         .select('id, status')
         .eq('id', assigned_practice_id)
         .single();

       if (practiceError || !practice) {
          return new Response(JSON.stringify({ error: 'Practice not found' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
       }

       if (practice.status !== 'active') {
          return new Response(JSON.stringify({ error: 'Practice is not active' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
       }

       const now = new Date().toISOString();

       // 3. Perform Updates
       // Update designation_review
       const { data: updatedReview, error: updateReviewError } = await supabase
         .from('designation_review')
         .update({
           assigned_practice_id,
           notes: notes ? `${review.notes || ''}\n${notes}` : review.notes, // Append notes logic
           resolved_by: adminUserId,
           resolved_at: now
         })
         .eq('id', reviewId)
         .select()
         .single();
        
       if (updateReviewError) throw updateReviewError;

       // Update Lead
       const { data: updatedLead, error: updateLeadError } = await supabase
         .from('leads')
         .update({
           practice_id: assigned_practice_id,
           routing_outcome: 'assigned'
         })
         .eq('id', review.lead_id)
         .select()
         .single();

       if (updateLeadError) {
         console.error('Failed to update lead', updateLeadError);
         throw updateLeadError;
       }

       // 4. Audit Log
       const { error: auditError } = await supabase
         .from('audit_log')
         .insert({
           entity_type: 'designation_review',
           entity_id: reviewId,
           action: 'manual_assignment',
           performed_by: adminUserId,
           metadata: {
             before: { resolved_at: null },
             after: { resolved_at: now, assigned_practice_id },
             notes: 'Manual assignment via Admin API'
           }
         });
         
       if (auditError) console.error('Audit log failed', auditError);

       // GHL Stub: Log or stub-sync
       await maybeSyncLeadToGHL({ id: updatedLead.id, practice_id: updatedLead.practice_id, routing_outcome: updatedLead.routing_outcome, designation_reason: updatedLead.designation_reason }, 'designation_assignment');

       return new Response(JSON.stringify({ success: true, review: updatedReview, lead: updatedLead }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
