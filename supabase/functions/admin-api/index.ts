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

async function linkUserToPractice(supabase: any, adminUserId: string, user_id: string, practice_id: string, role?: string) {
  if (!user_id || !practice_id) {
    return new Response(JSON.stringify({ error: 'user_id and practice_id are required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  // Check if already exists
  const { data: existing, error: checkError } = await supabase
    .from('practice_users')
    .select('*')
    .eq('user_id', user_id)
    .maybeSingle();

  if (checkError) throw checkError;

  if (existing) {
    if (existing.practice_id === practice_id) {
      return new Response(JSON.stringify({ message: 'User already linked to this practice', data: existing }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    } else {
      return new Response(JSON.stringify({ error: 'User is already linked to a different practice' }), { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
  }

  // Validate practice exists
  const { data: practice, error: practiceError } = await supabase
    .from('practices')
    .select('id')
    .eq('id', practice_id)
    .single();

  if (practiceError || !practice) {
    return new Response(JSON.stringify({ error: 'Practice not found' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  // Insert
  const { data: inserted, error: insertError } = await supabase
    .from('practice_users')
    .insert({
      user_id,
      practice_id,
      role: role || 'practice_user'
    })
    .select()
    .single();

  if (insertError) throw insertError;

  // Audit log
  await supabase.from('audit_log').insert({
    entity_type: 'practice_user',
    entity_id: user_id,
    action: 'link_user',
    performed_by: adminUserId,
    metadata: { practice_id, role: role || 'practice_user' }
  });

  return new Response(JSON.stringify({ data: inserted }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const url = new URL(req.url)
  const path = url.pathname

  try {
    // 1. Initialize Service Role Client
    // We use service role here because admin and public booking routes 
    // need cross-practice access and access to protected tables.
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 2. ROUTING & SECURITY
    // Public routes starting with /public/ bypass admin auth
    if (path.includes('/public/')) {
      // 2a. PUBLIC ROUTE: POST /public/appointments/create
      // Protected by shared secret, not admin auth
      if (req.method === 'POST' && path.endsWith('/public/appointments/create')) {
        const websiteBookingKey = Deno.env.get('WEBSITE_BOOKING_KEY');
        if (!websiteBookingKey) {
          return new Response(JSON.stringify({ error: 'Server not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const clientKey = req.headers.get('x-sd-website-key');
        if (!clientKey || clientKey !== websiteBookingKey) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const { practice_id, lead_id, start_at, end_at, notes } = await req.json();

        if (!practice_id || !lead_id || !start_at || !end_at) {
          return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const { data, error } = await supabase.rpc('admin_create_appointment', {
          p_practice_id: practice_id,
          p_lead_id: lead_id,
          p_start_time: start_at,
          p_end_time: end_at,
          p_source: 'website',
          p_created_by: 'website'
        });

        if (error) {
          // Check for slot unavailable (P0001 is Postgres RAISE EXCEPTION)
          if (error.code === 'P0001' && error.message?.includes('Time slot unavailable')) {
            return new Response(JSON.stringify({ 
              error: 'time_slot_unavailable',
              message: 'Time slot unavailable'
            }), { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }

          // Check for slot outside availability
          if (error.code === 'P0001' && error.message?.includes('Time slot outside availability')) {
            return new Response(JSON.stringify({ 
              error: 'outside_availability',
              message: 'Time slot outside availability'
            }), { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }

          return new Response(JSON.stringify({ 
            error: error.message,
            details: error
          }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        return new Response(JSON.stringify({ appointment: data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // 2b. PUBLIC ROUTE: GET /public/availability
      if (req.method === 'GET' && path.endsWith('/public/availability')) {
        const websiteBookingKey = Deno.env.get('WEBSITE_BOOKING_KEY');
        if (!websiteBookingKey) {
          return new Response(JSON.stringify({ error: 'Server not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const clientKey = req.headers.get('x-sd-website-key');
        if (!clientKey || clientKey !== websiteBookingKey) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const practiceId = url.searchParams.get('practice_id');
        if (!practiceId) {
          return new Response(JSON.stringify({ error: 'practice_id is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const { data, error } = await supabase
          .from('availability_blocks')
          .select('id, day_of_week, start_time, end_time, type')
          .eq('practice_id', practiceId)
          .order('day_of_week', { ascending: true })
          .order('start_time', { ascending: true });

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        return new Response(JSON.stringify({ 
          practice_id: practiceId,
          availability: data 
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // 2c. PUBLIC ROUTE: POST /public/appointments/hold
      if (req.method === 'POST' && path.endsWith('/public/appointments/hold')) {
        const websiteBookingKey = Deno.env.get('WEBSITE_BOOKING_KEY');
        if (!websiteBookingKey) {
          return new Response(JSON.stringify({ error: 'Server not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const clientKey = req.headers.get('x-sd-website-key');
        if (!clientKey || clientKey !== websiteBookingKey) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const { practice_id, lead_id, start_at, end_at, hold_minutes } = await req.json();

        if (!practice_id || !lead_id || !start_at || !end_at) {
          return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const { data, error } = await supabase.rpc('admin_create_appointment_hold', {
          p_practice_id: practice_id,
          p_lead_id: lead_id,
          p_start_time: start_at,
          p_end_time: end_at,
          p_source: 'website',
          p_created_by: 'website',
          p_hold_minutes: hold_minutes ?? 10
        });

        if (error) {
          if (error.code === 'P0001') {
            if (error.message?.includes('Time slot unavailable (overlap)')) {
              return new Response(JSON.stringify({ error: 'time_slot_unavailable', message: 'Time slot unavailable' }), { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }
            if (error.message?.includes('Time slot outside availability')) {
              return new Response(JSON.stringify({ error: 'outside_availability', message: 'Time slot outside availability' }), { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }
          }
          return new Response(JSON.stringify({ error: error.message, details: error }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        return new Response(JSON.stringify({ hold: data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // 2d. PUBLIC ROUTE: POST /public/appointments/confirm
      if (req.method === 'POST' && path.endsWith('/public/appointments/confirm')) {
        const websiteBookingKey = Deno.env.get('WEBSITE_BOOKING_KEY');
        if (!websiteBookingKey) {
          return new Response(JSON.stringify({ error: 'Server not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const clientKey = req.headers.get('x-sd-website-key');
        if (!clientKey || clientKey !== websiteBookingKey) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const { appointment_id } = await req.json();

        if (!appointment_id) {
          return new Response(JSON.stringify({ error: 'appointment_id is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const { data, error } = await supabase.rpc('admin_confirm_appointment_hold', {
          p_appointment_id: appointment_id
        });

        if (error) {
          if (error.code === 'P0001') {
            if (error.message?.includes('Hold not found')) {
              return new Response(JSON.stringify({ error: 'hold_not_found', message: 'Hold not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }
            if (error.message?.includes('Hold expired')) {
              return new Response(JSON.stringify({ error: 'hold_expired', message: 'Hold expired' }), { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }
            if (error.message?.includes('Appointment is not a hold')) {
              return new Response(JSON.stringify({ error: 'not_a_hold', message: 'Appointment is not a hold' }), { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }
            if (error.message?.includes('Time slot unavailable (overlap)')) {
              return new Response(JSON.stringify({ error: 'time_slot_unavailable', message: 'Time slot unavailable' }), { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }
          }
          return new Response(JSON.stringify({ error: error.message, details: error }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        return new Response(JSON.stringify({ appointment: data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // 2e. PUBLIC ROUTE: GET /public/slots
      if (req.method === 'GET' && path.endsWith('/public/slots')) {
        const websiteBookingKey = Deno.env.get('WEBSITE_BOOKING_KEY');
        if (!websiteBookingKey) {
          return new Response(JSON.stringify({ error: 'Server not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const clientKey = req.headers.get('x-sd-website-key');
        if (!clientKey || clientKey !== websiteBookingKey) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const zip = url.searchParams.get('zip');
        const date = url.searchParams.get('date');
        const slotMinutesStr = url.searchParams.get('slot_minutes');
        const slotMinutes = slotMinutesStr ? parseInt(slotMinutesStr, 10) : 30;

        if (!zip || !date) {
          return new Response(JSON.stringify({ 
            error: "missing_required_fields", 
            message: "zip and date are required" 
          }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        if (isNaN(slotMinutes) || slotMinutes <= 0) {
          return new Response(JSON.stringify({ 
            error: "invalid_slot_minutes", 
            message: "slot_minutes must be a positive integer" 
          }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const { data, error } = await supabase.rpc('public_get_slots_by_zip', { 
          p_zip: zip, 
          p_date: date, 
          p_slot_minutes: slotMinutes 
        });

        if (error) {
          if (error.code === 'P0001' && error.message?.includes('No practice available for ZIP')) {
            return new Response(JSON.stringify({ 
              error: "no_practice_for_zip", 
              message: "No practice available for ZIP" 
            }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }
          return new Response(JSON.stringify({ error: error.message, details: error }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        return new Response(JSON.stringify({ 
          zip, 
          date, 
          slot_minutes: slotMinutes, 
          slots: data 
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // If it's a /public/ path but no route matched
      return new Response(JSON.stringify({ error: 'Public route not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 3. SECURITY: Enforce Admin Auth for all other routes
    // This throws if unauthorized (401) or forbidden (403)
    let adminUserId: string;
    try {
      adminUserId = await requireAdminAuth(req);
    } catch (err) {
      const status = err.message.startsWith('Forbidden') ? 403 : 401;
      return new Response(JSON.stringify({ error: err.message }), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

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

      const overlaps: any[] = [];

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

      const { data: updatedLead, error: rpcError } = await supabase.rpc('admin_reassign_lead', {
        p_lead_id: leadId,
        p_practice_id: practice_id,
        p_admin_user_id: adminUserId
      }).single();

      if (rpcError) {
        return new Response(JSON.stringify({ error: rpcError.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      if (!updatedLead) {
        return new Response(JSON.stringify({ error: 'Lead not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // Re-fetch with join for consistency with detail view
      const { data: leadWithPractice } = await supabase
        .from('leads')
        .select('*, practices(name)')
        .eq('id', leadId)
        .single();

      const ENABLE_GHL_SYNC = (Deno.env.get('ENABLE_GHL_SYNC') ?? 'false').toLowerCase() === 'true';
      const ghl_sync_status = ENABLE_GHL_SYNC ? 'enabled_stub' : 'disabled';
      const ghl_would_sync = !!leadWithPractice.practice_id;
      const lead_status = leadWithPractice.practice_id ? 'Assigned' :
        leadWithPractice.routing_outcome === 'designation' ? 'Needs Review' :
        ((leadWithPractice.routing_outcome === 'no_provider_in_radius' || leadWithPractice.designation_reason === 'zip_not_found') ? 'No Coverage' : 'New');
      const practice_name = (leadWithPractice as any).practices?.name ?? null;

      const response = { ...leadWithPractice, practice_name, ghl_sync_status, ghl_would_sync, lead_status };

      return new Response(JSON.stringify({ data: response }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // POST /admin/leads/:id/unassign
    const unassignMatch = path.match(/\/admin\/leads\/([^\/]+)\/unassign$/);
    if (req.method === 'POST' && unassignMatch) {
      const leadId = unassignMatch[1];

      const { data: updatedLead, error: rpcError } = await supabase.rpc('admin_unassign_lead', {
        p_lead_id: leadId,
        p_admin_user_id: adminUserId
      }).single();

      if (rpcError) {
        return new Response(JSON.stringify({ error: rpcError.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      if (!updatedLead) {
        return new Response(JSON.stringify({ error: 'Lead not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const ENABLE_GHL_SYNC = (Deno.env.get('ENABLE_GHL_SYNC') ?? 'false').toLowerCase() === 'true';
      const ghl_sync_status = ENABLE_GHL_SYNC ? 'enabled_stub' : 'disabled';
      const ghl_would_sync = !!updatedLead.practice_id;
      const lead_status = updatedLead.practice_id ? 'Assigned' :
        updatedLead.routing_outcome === 'designation' ? 'Needs Review' :
        ((updatedLead.routing_outcome === 'no_provider_in_radius' || updatedLead.designation_reason === 'zip_not_found') ? 'No Coverage' : 'New');
      const practice_name = null;

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

    // POST /admin/users/link-practice (Existing, keeping for compat)
    if (req.method === 'POST' && path.endsWith('/admin/users/link-practice')) {
      const { user_id, practice_id, role } = await req.json();
      return await linkUserToPractice(supabase, adminUserId, user_id, practice_id, role);
    }

    // GET /admin/practices/:id/users
    const practiceUsersMatch = path.match(/\/admin\/practices\/([^\/]+)\/users$/);
    if (req.method === 'GET' && practiceUsersMatch) {
      const practiceId = practiceUsersMatch[1];
      
      const { data: practiceUsers, error: puError } = await supabase
        .from('practice_users')
        .select('*')
        .eq('practice_id', practiceId);

      if (puError) throw puError;

      // Fetch emails from auth.users (requires service role / admin client)
      const usersWithEmails = await Promise.all((practiceUsers || []).map(async (pu: any) => {
        const { data: { user }, error: authError } = await supabase.auth.admin.getUserById(pu.user_id);
        return {
          ...pu,
          email: user?.email || 'unknown'
        };
      }));

      return new Response(JSON.stringify({ data: usersWithEmails }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // POST /admin/practices/:id/users
    if (req.method === 'POST' && practiceUsersMatch) {
      const practiceId = practiceUsersMatch[1];
      const { email, user_id, role } = await req.json();

      let targetUserId = user_id;

      if (email && !targetUserId) {
        const normalizedEmail = email.trim().toLowerCase();
        
        // 1. Resolve email to user_id if already exists
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) throw listError;
        
        const found = users.find(u => u.email?.toLowerCase() === normalizedEmail);
        
        if (found) {
          targetUserId = found.id;
        } else {
          // 2. Invite/Create new user
          // inviteUserByEmail is preferred as it sends the link
          const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(normalizedEmail);
          
          if (inviteError) {
            // Fallback to createUser if invite fails or is restricted
            const { data: createData, error: createError } = await supabase.auth.admin.createUser({
              email: normalizedEmail,
              email_confirm: true
            });
            if (createError) throw createError;
            targetUserId = createData.user?.id;
          } else {
            targetUserId = inviteData.user?.id;
          }
        }
      }

      if (!targetUserId) {
        return new Response(JSON.stringify({ error: 'Failed to resolve or create user for this email' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      return await linkUserToPractice(supabase, adminUserId, targetUserId, practiceId, role || 'practice_user');
    }

    // POST /admin/appointments/create
    if (req.method === 'POST' && path.endsWith('/admin/appointments/create')) {
      const { practice_id, lead_id, start_at, end_at, source, notes } = await req.json();

      if (!practice_id || !lead_id || !start_at || !end_at || !source) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const { data, error } = await supabase.rpc('admin_create_appointment', {
        p_practice_id: practice_id,
        p_lead_id: lead_id,
        p_start_time: start_at,
        p_end_time: end_at,
        p_source: source,
        p_created_by: adminUserId ?? 'admin'
      });

      if (error) {
        return new Response(JSON.stringify({ 
          error: error.message,
          details: error
        }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      return new Response(JSON.stringify({ appointment: data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
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
       const { assigned_practice_id } = await req.json() as AssignDesignationRequest;

       if (!assigned_practice_id) {
         return new Response(JSON.stringify({ error: 'assigned_practice_id is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
       }

       const { error: rpcError } = await supabase.rpc('admin_assign_designation_review', {
         p_review_id: reviewId,
         p_assigned_practice_id: assigned_practice_id,
         p_admin_user_id: adminUserId
       });

       if (rpcError) {
         return new Response(JSON.stringify({ error: rpcError.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
       }

       // Fetch updated lead for GHL stub
       const { data: review } = await supabase
         .from('designation_review')
         .select('lead_id')
         .eq('id', reviewId)
         .single();

       if (review) {
         const { data: updatedLead } = await supabase
           .from('leads')
           .select('*')
           .eq('id', review.lead_id)
           .single();
         
         if (updatedLead) {
           await maybeSyncLeadToGHL({ 
             id: updatedLead.id, 
             practice_id: updatedLead.practice_id, 
             routing_outcome: updatedLead.routing_outcome, 
             designation_reason: updatedLead.designation_reason 
           }, 'designation_assignment');
         }
       }

       return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
