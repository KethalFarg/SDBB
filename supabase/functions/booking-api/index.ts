import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { 
  HoldAppointmentRequest, 
  ConfirmAppointmentRequest,
  UpdateAppointmentRequest,
  CreateAvailabilityBlockRequest
} from "../_shared/api-types.ts"
import { triggerGhlSync } from "../_shared/ghl-trigger.ts"

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for booking-api');
}

const supabaseAdmin = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  : null;

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
    const supabaseUrl = 'http://kong:8000'
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

    // --- Timezone Helpers ---
    const getPracticeTimezone = async (client: any, practiceId: string): Promise<string> => {
      const { data } = await client.from('practices').select('timezone').eq('id', practiceId).single();
      return data?.timezone || 'America/New_York';
    };

    const localMidnightUtc = (dateStr: string, tz: string): Date => {
      const [y, m, d] = dateStr.split('-').map(Number);
      let utcDate = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        year: 'numeric', month: 'numeric', day: 'numeric',
        hour: 'numeric', minute: 'numeric', second: 'numeric',
        hour12: false
      });
      const getLocalInstant = (d: Date) => {
        const parts = formatter.formatToParts(d);
        const p: any = {};
        parts.forEach(part => p[part.type] = part.value);
        const h = parseInt(p.hour) % 24;
        return new Date(Date.UTC(parseInt(p.year), parseInt(p.month) - 1, parseInt(p.day), h, parseInt(p.minute), parseInt(p.second)));
      };
      for (let i = 0; i < 2; i++) {
        const local = getLocalInstant(utcDate);
        const diff = utcDate.getTime() - local.getTime();
        utcDate = new Date(utcDate.getTime() + diff);
      }
      return utcDate;
    };

    const dayOfWeekInTz = (dateStr: string, tz: string): number => {
      // Use noon to avoid any midnight boundary issues with weekday names
      const [y, m, d] = dateStr.split('-').map(Number);
      const noon = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
      const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: tz }).format(noon);
      return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(weekday);
    };

    // GET /appointments (Portal - User Auth)
    if (req.method === 'GET' && (path === '/appointments' || path.endsWith('/booking-api/appointments'))) {
       console.log('[booking-api] portal /appointments handler', path)
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

    // GET /practices/:id/availability?date=YYYY-MM-DD
    const availabilityMatch = path.match(/\/practices\/([^\/]+)\/availability$/);
    if (req.method === 'GET' && availabilityMatch) {
      let supabase;
      try { supabase = getAuthClient(req); } catch(e) { return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }); }

      const practiceId = availabilityMatch[1];
      const date = url.searchParams.get('date');

      if (!date) {
        return new Response(JSON.stringify({ error: 'Missing date parameter' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      try {
        if (!supabaseAdmin) {
          return new Response(JSON.stringify({ error: 'Server not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const timezone = await getPracticeTimezone(supabase, practiceId);
        const dayOfWeek = dayOfWeekInTz(date, timezone);

        const [blocksRes, exceptionsRes] = await Promise.all([
          supabaseAdmin.from('availability_blocks').select('*').eq('practice_id', practiceId).eq('day_of_week', dayOfWeek).order('start_time'),
          supabase.from('availability_exceptions').select('*').eq('practice_id', practiceId).eq('exception_date', date).order('start_time', { nullsFirst: true })
        ]);

        if (blocksRes.error) throw blocksRes.error;
        if (exceptionsRes.error) throw exceptionsRes.error;

        return new Response(JSON.stringify({
          data: {
            practice_id: practiceId,
            date,
            timezone,
            day_of_week: dayOfWeek,
            blocks: blocksRes.data,
            exceptions: exceptionsRes.data
          }
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    // GET /practices/:id/appointments?date=YYYY-MM-DD
    const appointmentsMatch = path.match(/\/practices\/([^\/]+)\/appointments$/);
    if (req.method === 'GET' && appointmentsMatch) {
      console.log('[booking-api] practice appointments handler', path)
      let supabase;
      try { supabase = getAuthClient(req); } catch(e) { return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }); }

      const practiceId = appointmentsMatch[1];
      const date = url.searchParams.get('date');

      if (!date) {
        return new Response(JSON.stringify({ error: 'Missing date parameter' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      try {
        if (!supabaseAdmin) {
          throw new Error('Server not configured (admin client missing)');
        }

        const timezone = await getPracticeTimezone(supabase, practiceId);
        
        // Use the new robust RPC for timezone-aware date filtering
        const { data: apptRows, error: rpcError } = await supabaseAdmin.rpc('admin_get_appointments_for_date', {
          p_practice_id: practiceId,
          p_date: date,
          p_tz: timezone
        });

        if (rpcError) throw rpcError;

        // Fetch full appointment details including joined leads using service role
        let appointmentsWithLeads = [];
        const apptIds = (apptRows || []).map((a: any) => a.id);
        
        if (apptIds.length > 0) {
          const { data, error: joinError } = await supabaseAdmin
            .from('appointments')
            .select(`
              *,
              lead:leads!appointments_lead_id_fkey (
                id,
                first_name,
                last_name,
                email,
                phone
              )
            `)
            .in('id', apptIds)
            .order('start_time', { ascending: true });
          
          if (joinError) throw joinError;
          appointmentsWithLeads = data || [];
        }

        console.info(`booking-api appointments fetch | practice=${practiceId} date=${date} tz=${timezone} count=${appointmentsWithLeads.length}`);

        return new Response(JSON.stringify({
          data: {
            practice_id: practiceId,
            date,
            timezone,
            appointments: appointmentsWithLeads
          }
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    // POST /provider/leads (Provider-safe lead creation)
    if (req.method === 'POST' && path.endsWith('/provider/leads')) {
      console.log('[booking-api] provider lead creation handler', path);
      let supabase;
      try { supabase = getAuthClient(req); } catch(e) { return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }); }

      try {
        const { practiceId } = await getMyPracticeId(supabase);
        const { first_name, last_name, phone, email } = await req.json();

        if (!first_name || !last_name || !phone) {
          return new Response(JSON.stringify({ error: 'First name, last name, and phone are required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        if (!supabaseAdmin) throw new Error('Server configuration error (admin client missing)');

        // Duplicate check within SAME practice
        let query = supabaseAdmin.from('leads').select('id').eq('practice_id', practiceId);
        if (email) {
          query = query.or(`phone.eq.${phone},email.eq.${email}`);
        } else {
          query = query.eq('phone', phone);
        }

        const { data: existing, error: checkErr } = await query.limit(1);
        if (checkErr) throw checkErr;

        if (existing && existing.length > 0) {
          return new Response(JSON.stringify({ 
            error: 'lead_exists', 
            message: 'Lead already exists — please select it',
            lead_id: existing[0].id 
          }), { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // Create the lead
        const { data: newLead, error: insertErr } = await supabaseAdmin
          .from('leads')
          .insert({
            first_name,
            last_name,
            phone,
            email,
            practice_id: practiceId,
            source: 'manual'
          })
          .select()
          .single();

        if (insertErr) throw insertErr;

        return new Response(JSON.stringify({ data: newLead }), { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      } catch (err) {
        console.error('[booking-api] provider lead creation error:', err);
        return new Response(JSON.stringify({ error: err.message }), { status: err.message === 'No practice assigned' ? 403 : 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    // POST /practices/:id/appointments/confirm
    const confirmMatch = path.match(/\/practices\/([^\/]+)\/appointments\/confirm$/);
    if (req.method === 'POST' && confirmMatch) {
      let supabase;
      try { supabase = getAuthClient(req); } catch(e) { return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }); }

      const practiceId = confirmMatch[1];
      const body = await req.json();
      const { lead_id, start_time, end_time, source, notes } = body;

      if (!lead_id || !start_time || !end_time) {
        return new Response(JSON.stringify({ error: 'Missing required fields: lead_id, start_time, end_time' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      if (new Date(start_time) >= new Date(end_time)) {
        return new Response(JSON.stringify({ error: 'start_time must be before end_time' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      try {
        // Enforce no overlap
        const { data: overlaps, error: overlapError } = await supabase
          .from('appointments')
          .select('id')
          .eq('practice_id', practiceId)
          .neq('status', 'canceled')
          .lt('start_time', end_time)
          .gt('end_time', start_time);

        if (overlapError) throw overlapError;
        if (overlaps && overlaps.length > 0) {
          return new Response(JSON.stringify({ error: 'Slot already booked' }), { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const { data, error } = await supabase
          .from('appointments')
          .insert({
            practice_id: practiceId,
            lead_id,
            start_time,
            end_time,
            status: 'scheduled',
            source: source || 'call_center',
            created_by: 'admin_portal',
            notes: notes || null
          })
          .select()
          .single();

        if (error) throw error;

        // Trigger GHL Sync
        await triggerGhlSync('appointment', data.id);

        return new Response(JSON.stringify({ data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    // GET /availability_blocks
    if (req.method === 'GET' && path.endsWith('/availability_blocks')) {
      if (!supabaseAdmin) {
        return new Response(JSON.stringify({ error: 'Server not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      let supabase;
      try { supabase = getAuthClient(req); } catch(e) { return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }); }

      const day = url.searchParams.get('day_of_week');
      const type = url.searchParams.get('type');
      
      let query = supabaseAdmin.from('availability_blocks').select('*');
      
      if (day !== null) {
        const dayInt = Number.parseInt(day, 10);
        if (!Number.isNaN(dayInt)) {
          query = query.eq('day_of_week', dayInt);
        }
      }
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
        if (!supabaseAdmin) {
          return new Response(JSON.stringify({ error: 'Server not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const { practiceId } = await getMyPracticeId(supabase);

        const { data: overlaps, error: overlapError } = await supabaseAdmin
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

    return new Response('Not Found', { status: 404, headers: corsHeaders })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
