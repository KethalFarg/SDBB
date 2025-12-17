import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-internal-key',
}

interface GhlSyncRequest {
  entity_type: 'lead' | 'appointment';
  entity_id: string;
}

// Simple MVP mapping
const mapLeadToGhl = (lead: any) => ({
  email: lead.email,
  phone: lead.phone,
  firstName: lead.first_name,
  lastName: lead.last_name,
  postalCode: lead.zip,
  source: lead.source,
  customFields: [
    { key: 'practice_id', value: lead.practice_id },
    { key: 'routing_outcome', value: lead.routing_outcome }
  ]
});

const mapAppointmentToGhl = (appt: any) => ({
  email: appt.lead?.email, // Assuming we join
  phone: appt.lead?.phone,
  calendarId: 'CALENDAR_ID_PLACEHOLDER', // Would be practice specific
  startTime: appt.start_time,
  endTime: appt.end_time,
  status: appt.status,
  title: `Appt with ${appt.lead?.first_name} ${appt.lead?.last_name}`
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const url = new URL(req.url);
  
  if (req.method === 'POST' && url.pathname.endsWith('/ghl/sync')) {
    try {
      // GOAL A: Harden Security
      const expectedKey = Deno.env.get('INTERNAL_SYNC_KEY');
      if (!expectedKey) {
        // Misconfiguration guard
        return new Response(JSON.stringify({ error: "Server misconfigured: INTERNAL_SYNC_KEY not set" }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const internalKey = req.headers.get('x-internal-key');
      if (!internalKey || internalKey !== expectedKey) {
        return new Response(JSON.stringify({ error: 'Unauthorized: Invalid x-internal-key' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      const ghlApiKey = Deno.env.get('GHL_API_KEY') ?? ''
      const ghlLocationId = Deno.env.get('GHL_LOCATION_ID') ?? '' // Default location

      if (!ghlApiKey) {
        throw new Error('GHL_API_KEY not configured');
      }

      // Use service role to fetch data
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { entity_type, entity_id } = await req.json() as GhlSyncRequest;

      let ghlPayload: any = {};
      let ghlEndpoint = '';

      // 1. Fetch Entity
      if (entity_type === 'lead') {
        const { data: lead, error } = await supabase.from('leads').select('*').eq('id', entity_id).single();
        if (error || !lead) throw new Error(`Lead not found: ${error?.message}`);
        
        ghlPayload = { 
          ...mapLeadToGhl(lead),
          locationId: ghlLocationId 
        };
        ghlEndpoint = 'https://rest.gohighlevel.com/v1/contacts/'; // V1 Example
      } else if (entity_type === 'appointment') {
        const { data: appt, error } = await supabase.from('appointments').select('*, lead:leads(*)').eq('id', entity_id).single();
        if (error || !appt) throw new Error(`Appointment not found: ${error?.message}`);

        ghlPayload = {
          ...mapAppointmentToGhl(appt),
          locationId: ghlLocationId
        };
        ghlEndpoint = 'https://rest.gohighlevel.com/v1/appointments/'; 
      } else {
        throw new Error('Invalid entity_type');
      }

      // 2. Send to GHL
      const ghlResponse = await fetch(ghlEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ghlApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ghlPayload)
      });

      const ghlResult = await ghlResponse.json().catch(() => ({}));
      
      // 3. Log Result
      const success = ghlResponse.ok;
      
      await supabase.from('audit_log').insert({
        entity_type,
        entity_id,
        action: 'ghl_sync',
        performed_by: 'system',
        metadata: {
          success,
          status: ghlResponse.status,
          request: ghlPayload,
          response: ghlResult
        }
      });

      if (!success) {
        return new Response(JSON.stringify({ error: 'GHL Sync Failed', detail: ghlResult }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      return new Response(JSON.stringify({ success: true, ghl_id: ghlResult.id }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
  }

  return new Response('Not Found', { status: 404, headers: corsHeaders });
})
