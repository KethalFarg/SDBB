import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { 
  HoldAppointmentRequest, 
  ConfirmAppointmentRequest,
  UpdateAppointmentRequest,
  CreateAvailabilityBlockRequest
} from "../_shared/api-types.ts"
import { triggerGhlSync } from "../_shared/ghl-trigger.ts"

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

    // Helper: Get user's practice ID
    const getMyPracticeId = async (client: any) => {
      const { data: user } = await client.auth.getUser();
      if (!user?.user) throw new Error('Unauthorized');
      
      const { data, error } = await client
        .from('practice_users')
        .select('practice_id')
        .eq('user_id', user.user.id)
        .single();
      
      if (error || !data) throw new Error('No practice assigned');
      return { practiceId: data.practice_id, userId: user.user.id };
    }

    // GET /appointments (Portal - User Auth)
    if (req.method === 'GET' && path.endsWith('/appointments')) {
       let supabase;
       try { supabase = getAuthClient(req); } catch(e) { return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }); }

       const status = url.searchParams.get('status');
       const from = url.searchParams.get('from');
       const to = url.searchParams.get('to');
       const limit = parseInt(url.searchParams.get('limit') || '20');
       const offset = parseInt(url.searchParams.get('offset') || '0');

       let query = supabase.from('appointments').select('*, lead:leads(*)', { count: 'exact' });

       if (status) query = query.eq('status', status);
       if (from) query = query.gte('start_time', from);
       if (to) query = query.lte('start_time', to);

       query = query.range(offset, offset + limit - 1).order('start_time', { ascending: true });

       const { data, error, count } = await query;

       if (error) {
         return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
       }

       return new Response(JSON.stringify({ data, total: count }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // POST /appointments (Call Center - User Auth)
    if (req.method === 'POST' && path.endsWith('/appointments')) {
      let supabase;
      try { supabase = getAuthClient(req); } catch(e) { return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }); }

      const body = await req.json();
      const { lead_id, start_time, end_time, source } = body;

      if (!lead_id || !start_time || !end_time) {
         return new Response(JSON.stringify({ error: 'Missing required fields: lead_id, start_time, end_time' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // 1. Get Practice Context
      const { practiceId, userId } = await getMyPracticeId(supabase);

      // 2. Validate Lead Ownership
      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .select('id, practice_id')
        .eq('id', lead_id)
        .single();
      
      if (leadError || !lead) {
        return new Response(JSON.stringify({ error: 'Lead not found or not accessible' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      if (lead.practice_id !== practiceId) {
         return new Response(JSON.stringify({ error: 'Lead belongs to another practice' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // 3. Overlap Check
      const { data: overlaps, error: overlapError } = await supabase
          .from('appointments')
          .select('id')
          .eq('practice_id', practiceId)
          .neq('status', 'canceled')
          .lt('start_time', end_time)
          .gt('end_time', start_time);

      if (overlapError) {
         return new Response(JSON.stringify({ error: overlapError.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      if (overlaps && overlaps.length > 0) {
         return new Response(JSON.stringify({ error: 'Appointment overlaps with existing booking' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // 4. Insert Appointment
      const { data: appointment, error: insertError } = await supabase
        .from('appointments')
        .insert({
          lead_id,
          practice_id: practiceId,
          start_time,
          end_time,
          status: 'scheduled',
          sales_outcome: 'pending',
          source: source || 'call_center',
          created_by: userId
        })
        .select()
        .single();

      if (insertError) {
        return new Response(JSON.stringify({ error: insertError.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // GOAL B: Trigger GHL Sync
      await triggerGhlSync('appointment', appointment.id);

      return new Response(JSON.stringify(appointment), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 });
    }

    // GET /practices/:id/availability
    if (req.method === 'GET' && path.match(/\/practices\/[^\/]+\/availability$/)) {
      const practiceId = path.split('/')[2];
      // TODO: Logic
      return new Response(JSON.stringify({ practice_id: practiceId, slots: [] }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // GET /availability_blocks
    if (req.method === 'GET' && path.endsWith('/availability_blocks')) {
      let supabase;
      try { supabase = getAuthClient(req); } catch(e) { return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }); }

      const day = url.searchParams.get('day_of_week');
      const type = url.searchParams.get('type');
      
      let query = supabase.from('availability_blocks').select('*');
      
      if (day) query = query.eq('day_of_week', day);
      if (type) query = query.eq('type', type);

      const { data, error } = await query;
      
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      
      return new Response(JSON.stringify({ data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // POST /availability_blocks
    if (req.method === 'POST' && path.endsWith('/availability_blocks')) {
      let supabase;
      try { supabase = getAuthClient(req); } catch(e) { return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }); }

      const { day_of_week, start_time, end_time, type } = await req.json() as Omit<CreateAvailabilityBlockRequest, 'practice_id'>;

      if (day_of_week === undefined || day_of_week < 0 || day_of_week > 6) {
        return new Response(JSON.stringify({ error: 'Invalid day_of_week (0-6)' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (start_time >= end_time) {
        return new Response(JSON.stringify({ error: 'start_time must be before end_time' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      try {
        const { practiceId } = await getMyPracticeId(supabase);

        const { data: overlaps, error: overlapError } = await supabase
          .from('availability_blocks')
          .select('id')
          .eq('practice_id', practiceId)
          .eq('day_of_week', day_of_week)
          .lt('start_time', end_time)
          .gt('end_time', start_time);

        if (overlapError) throw overlapError;
        if (overlaps && overlaps.length > 0) {
           return new Response(JSON.stringify({ error: 'Overlaps with existing availability block' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const { data: newBlock, error: insertError } = await supabase
          .from('availability_blocks')
          .insert({
            practice_id: practiceId,
            day_of_week,
            start_time,
            end_time,
            type: type || 'new_patient'
          })
          .select()
          .single();

        if (insertError) throw insertError;

        return new Response(JSON.stringify(newBlock), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 })
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    // DELETE /availability_blocks/:id
    const deleteMatch = path.match(/\/availability_blocks\/([^\/]+)$/);
    if (req.method === 'DELETE' && deleteMatch) {
      let supabase;
      try { supabase = getAuthClient(req); } catch(e) { return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }); }

      const id = deleteMatch[1];
      
      const { error } = await supabase
        .from('availability_blocks')
        .delete()
        .eq('id', id);

      if (error) {
         return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
    }

    // PATCH /appointments/:id
    const patchApptMatch = path.match(/\/appointments\/([^\/]+)$/);
    if (req.method === 'PATCH' && patchApptMatch) {
       let supabase;
       try { supabase = getAuthClient(req); } catch(e) { return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }); }

       const appointmentId = patchApptMatch[1];
       const { status, sales_outcome, objection } = await req.json() as UpdateAppointmentRequest;
       const allowedStatuses = ['show', 'no_show', 'pending', 'canceled', 'scheduled'];
       const allowedOutcomes = ['won', 'lost', 'pending'];

       if (status && !allowedStatuses.includes(status)) {
         return new Response(JSON.stringify({ error: 'Invalid status' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
       }
       if (sales_outcome && !allowedOutcomes.includes(sales_outcome)) {
         return new Response(JSON.stringify({ error: 'Invalid sales_outcome' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
       }
       if (sales_outcome === 'lost' && !objection) {
         return new Response(JSON.stringify({ error: 'Objection required when sales_outcome is lost' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
       }

       const { practiceId, userId } = await getMyPracticeId(supabase);

       // 1. Fetch Existing
       const { data: appt, error: fetchError } = await supabase
         .from('appointments')
         .select('*')
         .eq('id', appointmentId)
         .single();

       if (fetchError || !appt) {
         return new Response(JSON.stringify({ error: 'Appointment not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
       }

       // 2. Access Check
       if (appt.practice_id !== practiceId) {
         return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
       }

       // 3. Update
       const updates: any = {};
       if (status) updates.status = status;
       if (sales_outcome) updates.sales_outcome = sales_outcome;
       if (objection !== undefined) updates.objection = objection;

       const { data: updatedAppt, error: updateError } = await supabase
         .from('appointments')
         .update(updates)
         .eq('id', appointmentId)
         .select()
         .single();

       if (updateError) {
         return new Response(JSON.stringify({ error: updateError.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
       }

       // 4. Audit Log
       const { error: auditError } = await supabase
         .from('audit_log')
         .insert({
           entity_type: 'appointment',
           entity_id: appointmentId,
           action: 'status_update',
           performed_by: userId,
           metadata: {
             before: { status: appt.status, sales_outcome: appt.sales_outcome },
             after: { status: updatedAppt.status, sales_outcome: updatedAppt.sales_outcome }
           }
         });
       
       if (auditError) console.error('Audit log failed', auditError);

       // GOAL B: Trigger GHL Sync
       await triggerGhlSync('appointment', appointmentId);

       return new Response(JSON.stringify({ success: true, appointment: updatedAppt }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // POST /appointments/hold
    if (req.method === 'POST' && path.endsWith('/appointments/hold')) {
      const payload = await req.json() as HoldAppointmentRequest;
      return new Response(JSON.stringify({ hold_id: 'stub', status: 'held' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // POST /appointments/confirm
    if (req.method === 'POST' && path.endsWith('/appointments/confirm')) {
      const payload = await req.json() as ConfirmAppointmentRequest;
      return new Response(JSON.stringify({ status: 'scheduled', id: 'new-id' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
