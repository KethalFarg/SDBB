import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { CreateLeadRequest, CreateLeadResponse, CreateAssessmentRequest, AssessmentResponse, GetLeadsRequest } from "../_shared/api-types.ts"
import { resolveRouting } from "../_shared/routing-engine.ts"
import { triggerGhlSync } from "../_shared/ghl-trigger.ts"
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

    // Helper to get auth client
    const getAuthClient = (req: Request) => {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        throw new Error('Unauthorized');
      }
      return createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } }
      });
    }

    // Helper for Service Role client (Ingestion)
    const getAdminClient = () => createClient(supabaseUrl, supabaseServiceKey);

    // POST /leads (Ingestion - Admin/Service context)
    if (req.method === 'POST' && path.endsWith('/leads')) {
      const supabase = getAdminClient();
      const payload = await req.json() as CreateLeadRequest;

      if (!payload.zip) {
        throw new Error('ZIP is required for lead creation');
      }

      const routing = await resolveRouting(supabase, payload.zip);

      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .insert({
          first_name: payload.first_name,
          last_name: payload.last_name,
          email: payload.email,
          phone: payload.phone,
          zip: payload.zip,
          source: payload.source,
          practice_id: routing.practice_id,
          routing_outcome: routing.outcome,
          designation_reason: routing.reason,
          routing_snapshot: routing.routing_snapshot
        })
        .select()
        .single();

      if (leadError) throw leadError;

      if (routing.outcome === 'designation') {
        const { error: reviewError } = await supabase
          .from('designation_review')
          .insert({
            lead_id: lead.id,
            reason_code: routing.reason,
            notes: `Auto-generated via ${payload.source} ingestion.`,
          });
        
        if (reviewError) console.error('Failed to create designation review:', reviewError);
      }

      // GHL Stub: Log or stub-sync
      await maybeSyncLeadToGHL({ id: lead.id, practice_id: lead.practice_id, routing_outcome: lead.routing_outcome, designation_reason: lead.designation_reason }, 'lead_creation');

      // GOAL B: Trigger GHL Sync
      // We await this to ensure execution, but the helper catches errors so it won't fail the request.
      await triggerGhlSync('lead', lead.id);

      const response: CreateLeadResponse = lead;
      return new Response(JSON.stringify(response), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 })
    }

    // GET /leads (Portal - User Auth)
    if (req.method === 'GET' && path.endsWith('/leads')) {
      let supabase;
      try {
        supabase = getAuthClient(req);
      } catch (e) {
         return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      
      const type = url.searchParams.get('type') || 'leads'; // leads | assessments
      const status = url.searchParams.get('status');
      const from = url.searchParams.get('from');
      const to = url.searchParams.get('to');
      const limit = parseInt(url.searchParams.get('limit') || '20');
      const offset = parseInt(url.searchParams.get('offset') || '0');

      let query;
      
      if (type === 'assessments') {
        query = supabase.from('assessments').select('*, lead:leads(*)', { count: 'exact' });
      } else {
        query = supabase.from('leads').select('*', { count: 'exact' });
      }

      // Filters
      if (status) { /* TODO: leads don't have status column in PRD, appointments do. Maybe routing_outcome? Skipping for leads unless needed. */ }
      if (from) query = query.gte('created_at', from);
      if (to) query = query.lte('created_at', to);
      
      query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      return new Response(JSON.stringify({ data, total: count }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // GET /leads/:id (Portal - User Auth)
    const leadIdMatch = path.match(/\/leads\/([^\/]+)$/);
    if (req.method === 'GET' && leadIdMatch) {
       let supabase;
       try {
         supabase = getAuthClient(req);
       } catch (e) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
       }

       const leadId = leadIdMatch[1];
       const { data, error } = await supabase
         .from('leads')
         .select('*')
         .eq('id', leadId)
         .single();

       if (error || !data) {
          return new Response(JSON.stringify({ error: 'Not Found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
       }

       return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // POST /assessments (Ingestion - Admin/Service)
    if (req.method === 'POST' && path.endsWith('/assessments')) {
       // Stub
       const payload = await req.json() as CreateAssessmentRequest;
       const response: Partial<AssessmentResponse> = { id: 'stub', ...payload };
       return new Response(JSON.stringify(response), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 })
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
