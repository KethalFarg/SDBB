import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { decode } from "https://deno.land/x/djwt@v2.8/mod.ts"
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
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-practice-id',
}

function getPracticeIdFromRequest(req: Request): string | null {
  return (
    req.headers.get('x-practice-id') ||
    new URL(req.url).searchParams.get('practice_id')
  );
}

serve(async (req) => {
  console.log("BOOKING-API HIT", {
    url: req.url,
    method: req.method,
    auth: req.headers.get("authorization")?.slice(0, 30) ?? null
  });

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const url = new URL(req.url)
  const path = url.pathname.split('/booking-api')[1] || '/'
  console.log('booking-api path:', path)

  try {
    if (!supabaseAdmin) {
      throw new Error('Server not configured (admin client missing)');
    }

    // Helper: Decode JWT and get userId (sub)
    const getDecodedUser = (req: Request): { sub: string } => {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) throw new Error('Unauthorized');
      
      const token = authHeader.replace('Bearer ', '');
      try {
        const [, payload] = decode(token);
        const sub = (payload as any)?.sub;
        if (!sub) throw new Error('Unauthorized');
        return { sub };
      } catch (e) {
        throw new Error('Unauthorized');
      }
    }

    const authorizePracticeAccess = async (sub: string, practiceId?: string | null) => {
      if (!practiceId) {
        console.error('[AUTH ERROR] No practiceId provided to authorizePracticeAccess');
        throw new Error('practice_id required');
      }

      // 1. Check admin_users
      console.log('[AUTH DEBUG] Checking admin status for sub:', sub);
      
      const { data: adminRecord, error: adminError } = await supabaseAdmin
        .from('admin_users')
        .select('user_id')
        .eq('user_id', sub)
        .limit(1)
        .maybeSingle();
      
      if (adminError) {
        console.error('[AUTH ERROR] admin_users query failed:', adminError);
        throw new Error(`Database error checking admin status: ${adminError.message}`);
      }

      const isAdmin = !!adminRecord;

      if (isAdmin) {
        console.log(`[AUTH] Admin bypass active | sub=${sub} route_practice=${practiceId}`);
        return { isAdmin: true, practiceId };
      }

      // 2. Check practice_users
      console.log('[AUTH DEBUG] Not an admin, checking practice mapping for practiceId:', practiceId);
      const { data: practiceMapping, error: mapError } = await supabaseAdmin
        .from('practice_users')
        .select('practice_id')
        .eq('user_id', sub)
        .eq('practice_id', practiceId)
        .limit(1)
        .maybeSingle();
      
      if (mapError) {
        console.error('[AUTH ERROR] practice_users query failed:', mapError);
        throw new Error(`Database error checking practice mapping: ${mapError.message}`);
      }
      
      if (!practiceMapping) {
        console.log(`[AUTH] Forbidden | sub=${sub} route_practice=${practiceId}`);
        throw new Error('Forbidden');
      }

      return { isAdmin: false, practiceId: practiceMapping.practice_id };
    }

    // --- Practice & Timezone Helpers ---
    const getPracticeRecord = async (practiceId: string) => {
      const { data, error } = await supabaseAdmin.from('practices').select('*').eq('id', practiceId).single();
      if (error || !data) {
        console.warn(`[DB] Practice not found: id=${practiceId}`);
        return null;
      }
      console.log(`[DB] Resolved practice record: id=${data.id} name=${data.name} tz=${data.timezone}`);
      return data;
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

    // GET /appointments (Standard list view)
    if (req.method === 'GET' && (path === '/appointments' && !url.searchParams.has('date'))) {
       console.log('[booking-api] portal /appointments list handler', path)
       try { 
         const user = getDecodedUser(req); 
         const requestedPracticeId = getPracticeIdFromRequest(req);
         if (!requestedPracticeId) {
           throw new Error('practice_id required');
         }

         const { practiceId, isAdmin } = await authorizePracticeAccess(user.sub, requestedPracticeId);
         await getPracticeRecord(practiceId);

         const status = url.searchParams.get('status');
         const from = url.searchParams.get('from');
         const to = url.searchParams.get('to');
         const limit = parseInt(url.searchParams.get('limit') || '20');
         const offset = parseInt(url.searchParams.get('offset') || '0');

         let query = supabaseAdmin.from('appointments').select('*, lead:leads(*)', { count: 'exact' }).eq('practice_id', practiceId);

         if (status) query = query.eq('status', status);
         if (from) query = query.gte('start_time', from);
         if (to) query = query.lte('start_time', to);

         query = query.range(offset, offset + limit - 1).order('start_time', { ascending: true });

         const { data, error, count } = await query;

         if (error) {
           console.error(`[ERROR] GET /appointments failed: ${error.message}`);
           return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
         }

         return new Response(JSON.stringify({ data: data || [], total: count || 0 }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
       } catch (err) {
         const status = err.message === 'Unauthorized' ? 401 : err.message === 'Forbidden' ? 403 : 400;
         return new Response(JSON.stringify({ error: err.message }), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
       }
    }

    // POST /appointments
    if (req.method === 'POST' && path === '/appointments') {
      try {
        const user = getDecodedUser(req); 
        const body = await req.json();
        const { lead_id, start_time, end_time, source, practice_id: bodyPracticeId } = body;

        if (!lead_id || !start_time || !end_time) {
           console.error('[ERROR] POST /appointments: Missing required fields');
           return new Response(JSON.stringify({ error: 'Missing required fields: lead_id, start_time, end_time' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        if (!bodyPracticeId) throw new Error('practice_id required');
        const { practiceId, isAdmin } = await authorizePracticeAccess(user.sub, bodyPracticeId);
        await getPracticeRecord(practiceId);

        // 2. Validate Lead Ownership
        const { data: lead, error: leadError } = await supabaseAdmin
          .from('leads')
          .select('id, practice_id')
          .eq('id', lead_id)
          .single();
        
        if (leadError || !lead) {
          return new Response(JSON.stringify({ error: 'Lead not found or not accessible' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // Admin bypass for lead practice scoping
        if (!isAdmin && lead.practice_id !== practiceId) {
           return new Response(JSON.stringify({ error: 'Lead belongs to another practice' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // 3. Overlap Check
        const { data: overlaps, error: overlapError } = await supabaseAdmin
            .from('appointments')
            .select('id')
            .eq('practice_id', practiceId)
            .neq('status', 'canceled')
            .lt('start_time', end_time)
            .gt('end_time', start_time);

        if (overlapError) {
           console.error(`[ERROR] POST /appointments overlap check failed: ${overlapError.message}`);
           return new Response(JSON.stringify({ error: overlapError.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        if (overlaps && overlaps.length > 0) {
           console.error('[ERROR] POST /appointments: Appointment overlaps');
           return new Response(JSON.stringify({ error: 'Appointment overlaps with existing booking' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // 4. Insert Appointment
        const { data: appointment, error: insertError } = await supabaseAdmin
          .from('appointments')
          .insert({
            lead_id,
            practice_id: practiceId,
            start_time,
            end_time,
            status: 'scheduled',
            sales_outcome: 'pending',
            source: source || 'call_center',
            created_by: user.sub
          })
          .select()
          .single();

        if (insertError) {
          console.error(`[ERROR] POST /appointments insert failed: ${insertError.message}`);
          return new Response(JSON.stringify({ error: insertError.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // GOAL B: Trigger GHL Sync
        await triggerGhlSync('appointment', appointment.id);

        return new Response(JSON.stringify(appointment), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 });
      } catch (err) {
        const status = err.message === 'Unauthorized' ? 401 : err.message === 'Forbidden' ? 403 : 400;
        return new Response(JSON.stringify({ error: err.message }), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    // GET /availability?date=YYYY-MM-DD
    if (req.method === 'GET' && path === '/availability') {
      console.log('[booking-api] availability handler', path)
      try {
        const user = getDecodedUser(req); 
        const requestedPracticeId = getPracticeIdFromRequest(req);
        if (!requestedPracticeId) {
          throw new Error('practice_id required');
        }

        const date = url.searchParams.get('date');
        if (!date) {
          console.error('[ERROR] GET availability: Missing date parameter');
          return new Response(JSON.stringify({ error: 'Missing date parameter' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const { practiceId, isAdmin } = await authorizePracticeAccess(user.sub, requestedPracticeId);
        const practice = await getPracticeRecord(practiceId);
        const timezone = practice?.timezone || 'America/New_York';
        const dayOfWeek = dayOfWeekInTz(date, timezone);

        const [blocksRes, exceptionsRes] = await Promise.all([
          supabaseAdmin.from('availability_blocks').select('*').eq('practice_id', practiceId).eq('day_of_week', dayOfWeek).order('start_time'),
          supabaseAdmin.from('availability_exceptions').select('*').eq('practice_id', practiceId).eq('exception_date', date).order('start_time', { nullsFirst: true })
        ]);

        if (blocksRes.error) throw blocksRes.error;
        if (exceptionsRes.error) throw exceptionsRes.error;

        return new Response(JSON.stringify({
          data: {
            practice_id: practiceId,
            date,
            timezone,
            day_of_week: dayOfWeek,
            blocks: blocksRes.data || [],
            exceptions: exceptionsRes.data || []
          }
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      } catch (err) {
        const status = err.message === 'Unauthorized' ? 401 : err.message === 'Forbidden' ? 403 : 400;
        return new Response(JSON.stringify({ error: err.message }), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    // GET /appointments?date=YYYY-MM-DD
    if (req.method === 'GET' && path === '/appointments' && url.searchParams.has('date')) {
      console.log('[booking-api] appointments handler (grid)', path)
      try { 
        const user = getDecodedUser(req); 
        const requestedPracticeId = getPracticeIdFromRequest(req);
        if (!requestedPracticeId) {
          throw new Error('practice_id required');
        }

        const date = url.searchParams.get('date');
        if (!date) {
          console.error('[ERROR] GET appointments: Missing date parameter');
          return new Response(JSON.stringify({ error: 'Missing date parameter' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const { practiceId, isAdmin } = await authorizePracticeAccess(user.sub, requestedPracticeId);
        const practice = await getPracticeRecord(practiceId);
        const timezone = practice?.timezone || 'America/New_York';
        
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
            appointments: appointmentsWithLeads || []
          }
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      } catch (err) {
        const status = err.message === 'Unauthorized' ? 401 : err.message === 'Forbidden' ? 403 : 400;
        return new Response(JSON.stringify({ error: err.message }), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    // POST /provider/leads
    if (req.method === 'POST' && path === '/provider/leads') {
      console.log('[booking-api] provider lead creation handler', path);
      try { 
        const user = getDecodedUser(req); 
        const body = await req.json();
        const { first_name, last_name, phone, email, practice_id: bodyPracticeId } = body;

        if (!bodyPracticeId) throw new Error('practice_id required');
        const { practiceId } = await authorizePracticeAccess(user.sub, bodyPracticeId);
        await getPracticeRecord(practiceId);

        if (!first_name || !last_name || !phone) {
          console.error('[ERROR] POST /provider/leads: Missing required fields');
          return new Response(JSON.stringify({ error: 'First name, last name, and phone are required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

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

        if (insertErr) {
          console.error(`[ERROR] POST /provider/leads insert failed: ${insertErr.message}`);
          throw insertErr;
        }

        return new Response(JSON.stringify({ data: newLead }), { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      } catch (err) {
        const status = err.message === 'Unauthorized' ? 401 : err.message === 'Forbidden' ? 403 : 400;
        return new Response(JSON.stringify({ error: err.message }), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    // POST /appointments/confirm
    if (req.method === 'POST' && path === '/appointments/confirm') {
      try { 
        const user = getDecodedUser(req); 
        const requestedPracticeId = getPracticeIdFromRequest(req);
        const { practiceId, isAdmin } = await authorizePracticeAccess(user.sub, requestedPracticeId);
        await getPracticeRecord(practiceId);

        const body = await req.json();
        const { lead_id, start_time, end_time, source, notes } = body;

        if (!lead_id || !start_time || !end_time) {
          console.error('[ERROR] POST /appointments/confirm: Missing required fields');
          return new Response(JSON.stringify({ error: 'Missing required fields: lead_id, start_time, end_time' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        if (new Date(start_time) >= new Date(end_time)) {
          console.error('[ERROR] POST /appointments/confirm: start_time >= end_time');
          return new Response(JSON.stringify({ error: 'start_time must be before end_time' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // Enforce no overlap
        const { data: overlaps, error: overlapError } = await supabaseAdmin
          .from('appointments')
          .select('id')
          .eq('practice_id', practiceId)
          .neq('status', 'canceled')
          .lt('start_time', end_time)
          .gt('end_time', start_time);

        if (overlapError) throw overlapError;
        if (overlaps && overlaps.length > 0) {
          console.error('[ERROR] POST /appointments/confirm: Slot already booked');
          return new Response(JSON.stringify({ error: 'Slot already booked' }), { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const { data, error } = await supabaseAdmin
          .from('appointments')
          .insert({
            practice_id: practiceId,
            lead_id,
            start_time,
            end_time,
            status: 'scheduled',
            source: source || 'call_center',
            created_by: isAdmin ? 'admin_portal' : user.sub,
            notes: notes || null
          })
          .select()
          .single();

        if (error) {
          console.error(`[ERROR] POST /appointments/confirm insert failed: ${error.message}`);
          throw error;
        }

        // Trigger GHL Sync
        await triggerGhlSync('appointment', data.id);

        return new Response(JSON.stringify({ data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      } catch (err) {
        const status = err.message === 'Unauthorized' ? 401 : err.message === 'Forbidden' ? 403 : 400;
        return new Response(JSON.stringify({ error: err.message }), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    // GET /availability_blocks
    if (req.method === 'GET' && path === '/availability_blocks') {
      try { 
        const user = getDecodedUser(req); 
        const requestedPracticeId = getPracticeIdFromRequest(req);
        if (!requestedPracticeId) throw new Error('practice_id required');

        const { practiceId } = await authorizePracticeAccess(user.sub, requestedPracticeId);
        await getPracticeRecord(practiceId);

        const day = url.searchParams.get('day_of_week');
        const type = url.searchParams.get('type');
        
        let query = supabaseAdmin.from('availability_blocks').select('*').eq('practice_id', practiceId);
        
        if (day !== null) {
          const dayInt = Number.parseInt(day, 10);
          if (!Number.isNaN(dayInt)) {
            query = query.eq('day_of_week', dayInt);
          }
        }
        if (type) query = query.eq('type', type);

        const { data, error } = await query;
        
        if (error) {
          console.error(`[ERROR] GET /availability_blocks failed: ${error.message}`);
          return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        
        return new Response(JSON.stringify({ data: data || [] }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      } catch (err) {
        const status = err.message === 'Unauthorized' ? 401 : err.message === 'Forbidden' ? 403 : 400;
        return new Response(JSON.stringify({ error: err.message }), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    // POST /availability_blocks
    if (req.method === 'POST' && path === '/availability_blocks') {
      try { 
        const user = getDecodedUser(req); 
        const body = await req.json();
        const { day_of_week, start_time, end_time, type, practice_id: bodyPracticeId } = body as Omit<CreateAvailabilityBlockRequest, 'practice_id'> & { practice_id?: string };

        if (!bodyPracticeId) throw new Error('practice_id required');
        const { practiceId } = await authorizePracticeAccess(user.sub, bodyPracticeId);
        await getPracticeRecord(practiceId);

        if (day_of_week === undefined || day_of_week < 0 || day_of_week > 6) {
          console.error('[ERROR] POST /availability_blocks: Invalid day_of_week');
          return new Response(JSON.stringify({ error: 'Invalid day_of_week (0-6)' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        if (start_time >= end_time) {
          console.error('[ERROR] POST /availability_blocks: start_time >= end_time');
          return new Response(JSON.stringify({ error: 'start_time must be before end_time' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const { data: overlaps, error: overlapError } = await supabaseAdmin
          .from('availability_blocks')
          .select('id')
          .eq('practice_id', practiceId)
          .eq('day_of_week', day_of_week)
          .lt('start_time', end_time)
          .gt('end_time', start_time);

        if (overlapError) throw overlapError;
        if (overlaps && overlaps.length > 0) {
           console.error('[ERROR] POST /availability_blocks: Overlaps existing block');
           return new Response(JSON.stringify({ error: 'Overlaps with existing availability block' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const { data: newBlock, error: insertError } = await supabaseAdmin
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

        if (insertError) {
          console.error(`[ERROR] POST /availability_blocks insert failed: ${insertError.message}`);
          throw insertError;
        }

        return new Response(JSON.stringify(newBlock), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 })
      } catch (err) {
        const status = err.message === 'Unauthorized' ? 401 : err.message === 'Forbidden' ? 403 : 400;
        return new Response(JSON.stringify({ error: err.message }), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    // DELETE /availability_blocks/:id
    const deleteMatch = path.match(/\/availability_blocks\/([^\/]+)$/);
    if (req.method === 'DELETE' && deleteMatch) {
      try { 
        const user = getDecodedUser(req); 
        const id = deleteMatch[1];
        
        // Fetch the block to find its practice_id
        const { data: block, error: blockErr } = await supabaseAdmin
          .from('availability_blocks')
          .select('practice_id')
          .eq('id', id)
          .single();
        
        if (blockErr || !block) throw new Error('Block not found');

        const { practiceId } = await authorizePracticeAccess(user.sub, block.practice_id);
        await getPracticeRecord(practiceId);

        const { error } = await supabaseAdmin
          .from('availability_blocks')
          .delete()
          .eq('id', id);

        if (error) {
           console.error(`[ERROR] DELETE /availability_blocks/:id failed: ${error.message}`);
           return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
      } catch (err) {
        const status = err.message === 'Unauthorized' ? 401 : err.message === 'Forbidden' ? 403 : 400;
        return new Response(JSON.stringify({ error: err.message }), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    // PATCH /appointments/:id
    const patchApptMatch = path.match(/\/appointments\/([^\/]+)$/);
    if (req.method === 'PATCH' && patchApptMatch) {
       try { 
         const user = getDecodedUser(req); 
         const appointmentId = patchApptMatch[1];
         
         const body = await req.json();
         const { status, sales_outcome, objection } = body as UpdateAppointmentRequest;
         const allowedStatuses = ['show', 'no_show', 'pending', 'canceled', 'scheduled'];
         const allowedOutcomes = ['won', 'lost', 'pending'];

         if (status && !allowedStatuses.includes(status)) {
           console.error('[ERROR] PATCH /appointments/:id: Invalid status');
           return new Response(JSON.stringify({ error: 'Invalid status' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
         }
         if (sales_outcome && !allowedOutcomes.includes(sales_outcome)) {
           console.error('[ERROR] PATCH /appointments/:id: Invalid sales_outcome');
           return new Response(JSON.stringify({ error: 'Invalid sales_outcome' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
         }
         if (sales_outcome === 'lost' && !objection) {
           console.error('[ERROR] PATCH /appointments/:id: Objection missing for lost outcome');
           return new Response(JSON.stringify({ error: 'Objection required when sales_outcome is lost' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
         }

         // 1. Fetch Existing
         const { data: appt, error: fetchError } = await supabaseAdmin
           .from('appointments')
           .select('*')
           .eq('id', appointmentId)
           .single();

         if (fetchError || !appt) {
           return new Response(JSON.stringify({ error: 'Appointment not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
         }

         const { practiceId } = await authorizePracticeAccess(user.sub, appt.practice_id);
         await getPracticeRecord(practiceId);

         // 3. Update
         const updates: any = {};
         if (status) updates.status = status;
         if (sales_outcome) updates.sales_outcome = sales_outcome;
         if (objection !== undefined) updates.objection = objection;

         const { data: updatedAppt, error: updateError } = await supabaseAdmin
           .from('appointments')
           .update(updates)
           .eq('id', appointmentId)
           .select()
           .single();

         if (updateError) {
           console.error(`[ERROR] PATCH /appointments/:id update failed: ${updateError.message}`);
           return new Response(JSON.stringify({ error: updateError.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
         }

         // 4. Audit Log
         const { error: auditError } = await supabaseAdmin
           .from('audit_log')
           .insert({
             entity_type: 'appointment',
             entity_id: appointmentId,
             action: 'status_update',
             performed_by: user.sub,
             metadata: {
               before: { status: appt.status, sales_outcome: appt.sales_outcome },
               after: { status: updatedAppt.status, sales_outcome: updatedAppt.sales_outcome }
             }
           });
         
         if (auditError) console.error('Audit log failed', auditError);

         // GOAL B: Trigger GHL Sync
         await triggerGhlSync('appointment', appointmentId);

         return new Response(JSON.stringify({ success: true, appointment: updatedAppt }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
       } catch (err) {
         const status = err.message === 'Unauthorized' ? 401 : err.message === 'Forbidden' ? 403 : 400;
         return new Response(JSON.stringify({ error: err.message }), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
       }
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
