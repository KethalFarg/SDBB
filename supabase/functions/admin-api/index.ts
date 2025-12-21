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
  if (path.includes('/admin/')) {
    console.log('[admin-api] HIT', path)
  }

  const normalizedPath = path
    .replace(/^\/functions\/v1\/admin-api/, '')
    .replace(/^\/admin-api/, '');
  const p = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;

  console.info('[admin-api] method=', req.method, 'path=', path, 'normalized=', p);

  try {
    // 1. Initialize Service Role Client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 2. ROUTING & SECURITY
    // Public routes starting with /public/ bypass admin auth
    if (p.startsWith('/public/')) {
      // 2a. PUBLIC ROUTE: POST /public/appointments/create
      if (req.method === 'POST' && p === '/public/appointments/create') {
        const websiteBookingKey = Deno.env.get('WEBSITE_BOOKING_KEY');
        if (!websiteBookingKey) {
          return new Response(JSON.stringify({ error: 'Server not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const clientKey = req.headers.get('x-sd-website-key');
        if (!clientKey || clientKey !== websiteBookingKey) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const { practice_id, lead_id, start_at, end_at } = await req.json();
        const { data, error } = await supabase.rpc('admin_create_appointment', {
          p_practice_id: practice_id,
          p_lead_id: lead_id,
          p_start_time: start_at,
          p_end_time: end_at,
          p_source: 'website',
          p_created_by: 'website'
        });

        if (error) {
          if (error.code === 'P0001' && error.message?.includes('Time slot unavailable')) {
            return new Response(JSON.stringify({ error: 'time_slot_unavailable', message: 'Time slot unavailable' }), { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }
          if (error.code === 'P0001' && error.message?.includes('Time slot outside availability')) {
            return new Response(JSON.stringify({ error: 'outside_availability', message: 'Time slot outside availability' }), { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }
          return new Response(JSON.stringify({ error: error.message, details: error }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        return new Response(JSON.stringify({ appointment: data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // 2b. PUBLIC ROUTE: GET /public/availability
      if (req.method === 'GET' && p === '/public/availability') {
        const websiteBookingKey = Deno.env.get('WEBSITE_BOOKING_KEY');
        const clientKey = req.headers.get('x-sd-website-key');
        if (!clientKey || clientKey !== websiteBookingKey) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const practiceId = url.searchParams.get('practice_id');
        const { data, error } = await supabase.from('availability_blocks').select('id, day_of_week, start_time, end_time, type').eq('practice_id', practiceId).order('day_of_week', { ascending: true }).order('start_time', { ascending: true });
        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        return new Response(JSON.stringify({ practice_id: practiceId, availability: data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // 2c. PUBLIC ROUTE: POST /public/appointments/hold
      if (req.method === 'POST' && p === '/public/appointments/hold') {
        const websiteBookingKey = Deno.env.get('WEBSITE_BOOKING_KEY');
        const clientKey = req.headers.get('x-sd-website-key');
        if (!clientKey || clientKey !== websiteBookingKey) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const { practice_id, lead_id, start_at, end_at, hold_minutes } = await req.json();
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
          return new Response(JSON.stringify({ error: error.message, details: error }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        return new Response(JSON.stringify({ hold: data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // 2d. PUBLIC ROUTE: POST /public/appointments/confirm
      if (req.method === 'POST' && p === '/public/appointments/confirm') {
        const websiteBookingKey = Deno.env.get('WEBSITE_BOOKING_KEY');
        const clientKey = req.headers.get('x-sd-website-key');
        if (!clientKey || clientKey !== websiteBookingKey) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const { appointment_id } = await req.json();
        const { data, error } = await supabase.rpc('admin_confirm_appointment_hold', { p_appointment_id: appointment_id });
        if (error) return new Response(JSON.stringify({ error: error.message, details: error }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        return new Response(JSON.stringify({ appointment: data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // 2e. PUBLIC ROUTE: GET /public/slots
      if (req.method === 'GET' && p === '/public/slots') {
        const websiteBookingKey = Deno.env.get('WEBSITE_BOOKING_KEY');
        const clientKey = req.headers.get('x-sd-website-key');
        if (!clientKey || clientKey !== websiteBookingKey) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const zip = url.searchParams.get('zip');
        const date = url.searchParams.get('date');
        const slotMinutes = parseInt(url.searchParams.get('slot_minutes') ?? '30', 10);

        const { data, error } = await supabase.rpc('public_get_slots_by_zip', { p_zip: zip, p_date: date, p_slot_minutes: slotMinutes });
        if (error) return new Response(JSON.stringify({ error: error.message, details: error }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        return new Response(JSON.stringify({ zip, date, slot_minutes: slotMinutes, slots: data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      return new Response(JSON.stringify({ error: 'Public route not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 3. SECURITY: Enforce Admin Auth
    let adminUserId: string;
    try {
      adminUserId = await requireAdminAuth(req);
    } catch (err) {
      const status = err.message.startsWith('Forbidden') ? 403 : 401;
      return new Response(JSON.stringify({ error: err.message }), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // --- ADMIN ROUTES (EXACT MATCHES FIRST) ---

    // GET /admin/leads/search
    if (req.method === 'GET' && path.includes('/admin/leads/search')) {
      console.log('[admin-api] ROUTE', 'admin/leads/search')
      const practice_id = url.searchParams.get('practice_id');
      const q = url.searchParams.get('q');
      if (!practice_id) return new Response(JSON.stringify({ error: 'practice_id is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      let query = supabase.from('leads').select('*').eq('practice_id', practice_id).order('created_at', { ascending: false }).limit(25);
      if (q) {
        const pattern = `%${q.trim()}%`;
        query = query.or(`first_name.ilike.${pattern},last_name.ilike.${pattern},email.ilike.${pattern},phone.ilike.${pattern}`);
      }
      const { data, error } = await query;
      if (error) throw error;
      return new Response(JSON.stringify({ data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // POST /admin/leads/cleanup-test
    if (req.method === 'POST' && path.includes('/admin/leads/cleanup-test')) {
      console.log('[admin-api] ROUTE', 'admin/leads/cleanup-test')
      const { data, error } = await supabase.from('leads').delete().eq('zip', '99999');
      if (error) throw error;
      return new Response(JSON.stringify({ deleted_count: data?.length ?? 0 }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // GET /admin/practices
    if (req.method === 'GET' && path.includes('/admin/practices')) {
      console.log('[admin-api] ROUTE', 'admin/practices (GET)')
      const { data, error } = await supabase.from('practices').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return new Response(JSON.stringify({ data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // POST /admin/practices
    if (req.method === 'POST' && path.includes('/admin/practices')) {
      console.log('[admin-api] ROUTE', 'admin/practices (POST)')
      const payload = await req.json();
      const { data, error } = await supabase.from('practices').insert(payload).select().single();
      if (error) throw error;
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 });
    }

    // GET /admin/map/practices
    if (req.method === 'GET' && path.includes('/admin/map/practices')) {
      console.log('[admin-api] ROUTE', 'admin/map/practices')
      const { data, error } = await supabase.from('practices').select('id, name, status, lat, lng, radius_miles');
      if (error) throw error;
      return new Response(JSON.stringify({ data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // POST /admin/map/preview
    if (req.method === 'POST' && path.includes('/admin/map/preview')) {
      console.log('[admin-api] ROUTE', 'admin/map/preview')
      const { lat, lng, radius_miles } = await req.json();
      const { data: practices, error } = await supabase.from('practices').select('id, name, status, lat, lng, radius_miles').eq('status', 'active').not('lat', 'is', null).not('lng', 'is', null);
      if (error) throw error;
      const overlaps = (practices as Practice[]).filter(p => calculateDistance(lat, lng, p.lat!, p.lng!) <= (radius_miles + Number(p.radius_miles)));
      return new Response(JSON.stringify({ input: { lat, lng, radius_miles }, overlaps }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // POST /admin/impersonate
    if (req.method === 'POST' && path.includes('/admin/impersonate')) {
      console.log('[admin-api] ROUTE', 'admin/impersonate')
      return new Response(JSON.stringify({ token: 'stub' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // GET /admin/leads (list)
    if (req.method === 'GET' && path.includes('/admin/leads')) {
      console.log('[admin-api] ROUTE', 'admin/leads (GET list)')
      const q = url.searchParams.get('q');
      const limit = Math.min(Number(url.searchParams.get('limit') ?? '25'), 100);
      const offset = Number(url.searchParams.get('offset') ?? '0');
      let query = supabase.from('leads').select('*, practices(name)').order('created_at', { ascending: false }).range(offset, offset + limit - 1);
      if (q) {
        const pattern = `%${q.trim()}%`;
        query = query.or(`zip.ilike.${pattern},email.ilike.${pattern},phone.ilike.${pattern},id.eq.${q.trim()}`);
      }
      const { data, error } = await query;
      if (error) throw error;
      const mapped = (data || []).map((row: any) => ({
        ...row,
        practice_name: row.practices?.name ?? null,
        lead_status: row.practice_id ? 'Assigned' : row.routing_outcome === 'designation' ? 'Needs Review' : 'New'
      }));
      return new Response(JSON.stringify({ data: mapped }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // POST /admin/users/link-practice
    if (req.method === 'POST' && path.includes('/admin/users/link-practice')) {
      console.log('[admin-api] ROUTE', 'admin/users/link-practice')
      const { user_id, practice_id, role } = await req.json();
      return await linkUserToPractice(supabase, adminUserId, user_id, practice_id, role);
    }

    // POST /admin/appointments/create
    if (req.method === 'POST' && path.includes('/admin/appointments/create')) {
      console.log('[admin-api] ROUTE', 'admin/appointments/create')
      const { practice_id, lead_id, start_at, end_at, source } = await req.json();
      const { data, error } = await supabase.rpc('admin_create_appointment', {
        p_practice_id: practice_id,
        p_lead_id: lead_id,
        p_start_time: start_at,
        p_end_time: end_at,
        p_source: source,
        p_created_by: adminUserId
      });
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      return new Response(JSON.stringify({ appointment: data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // GET /designation_review
    if (req.method === 'GET' && path.includes('/designation_review')) {
      console.log('[admin-api] ROUTE', 'designation_review (GET)')
      const { data, error } = await supabase.from('designation_review').select('*, leads!inner(*)').is('resolved_at', null).order('created_at', { ascending: false });
      if (error) throw error;
      const mapped = (data || []).map((row: any) => ({
        ...row,
        lead_zip: row.leads?.zip,
        lead_created_at: row.leads?.created_at
      }));
      return new Response(JSON.stringify({ data: mapped }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // --- PARAMETERIZED ROUTES (REGEX) ---

    // PATCH /admin/practices/:id
    const patchPracticeMatch = path.match(/\/admin\/practices\/([^\/]+)$/);
    if (req.method === 'PATCH' && patchPracticeMatch) {
      console.log('[admin-api] ROUTE', 'admin/practices/:id (PATCH)')
      const practiceId = patchPracticeMatch[1];
      const payload = await req.json();
      const { data, error } = await supabase.from('practices').update(payload).eq('id', practiceId).select().single();
      if (error) throw error;
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // GET /admin/leads/:id
    const leadMatch = path.match(/\/admin\/leads\/([^\/]+)$/);
    if (req.method === 'GET' && leadMatch) {
      const leadId = leadMatch[1];
      
      // Defensive guard for reserved keywords
      if (['search', 'cleanup-test'].includes(leadId)) {
        // Skip this handler and let routing continue
      } else {
        console.log('[admin-api] ROUTE', 'admin/leads/:id')
        const { data: lead, error } = await supabase.from('leads').select('*, practices(name)').eq('id', leadId).single();
        if (error || !lead) return new Response(JSON.stringify({ error: 'Lead not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        return new Response(JSON.stringify({ data: { ...lead, practice_name: (lead as any).practices?.name } }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    // POST /admin/leads/:id/reassign
    const reassignMatch = path.match(/\/admin\/leads\/([^\/]+)\/reassign$/);
    if (req.method === 'POST' && reassignMatch) {
      console.log('[admin-api] ROUTE', 'admin/leads/:id/reassign')
      const leadId = reassignMatch[1];
      const { practice_id } = await req.json();
      const { data, error } = await supabase.rpc('admin_reassign_lead', { p_lead_id: leadId, p_practice_id: practice_id, p_admin_user_id: adminUserId });
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      return new Response(JSON.stringify({ data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // POST /admin/leads/:id/unassign
    const unassignMatch = path.match(/\/admin\/leads\/([^\/]+)\/unassign$/);
    if (req.method === 'POST' && unassignMatch) {
      console.log('[admin-api] ROUTE', 'admin/leads/:id/unassign')
      const leadId = unassignMatch[1];
      const { data, error } = await supabase.rpc('admin_unassign_lead', { p_lead_id: leadId, p_admin_user_id: adminUserId });
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      return new Response(JSON.stringify({ data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // GET /admin/practices/:id/users
    const practiceUsersMatch = path.match(/\/admin\/practices\/([^\/]+)\/users$/);
    if (req.method === 'GET' && practiceUsersMatch) {
      console.log('[admin-api] ROUTE', 'admin/practices/:id/users (GET)')
      const practiceId = practiceUsersMatch[1];
      const { data: practiceUsers, error } = await supabase.from('practice_users').select('*').eq('practice_id', practiceId);
      if (error) throw error;
      const usersWithEmails = await Promise.all((practiceUsers || []).map(async (pu: any) => {
        const { data: { user } } = await supabase.auth.admin.getUserById(pu.user_id);
        return { ...pu, email: user?.email || 'unknown' };
      }));
      return new Response(JSON.stringify({ data: usersWithEmails }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // POST /admin/practices/:id/users
    if (req.method === 'POST' && practiceUsersMatch) {
      console.log('[admin-api] ROUTE', 'admin/practices/:id/users (POST)')
      const practiceId = practiceUsersMatch[1];
      const { email, user_id, role } = await req.json();
      let targetUserId = user_id;
      if (email && !targetUserId) {
        const { data: { users } } = await supabase.auth.admin.listUsers();
        const found = users.find(u => u.email?.toLowerCase() === email.trim().toLowerCase());
        if (found) { targetUserId = found.id; }
        else {
          const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email.trim().toLowerCase());
          targetUserId = inviteError ? (await supabase.auth.admin.createUser({ email: email.trim().toLowerCase(), email_confirm: true })).data.user?.id : inviteData.user?.id;
        }
      }
      return await linkUserToPractice(supabase, adminUserId, targetUserId, practiceId, role || 'practice_user');
    }

    // POST /designation_review/:id/assign
    const assignMatch = path.match(/\/designation_review\/([^\/]+)\/assign$/);
    if (req.method === 'POST' && assignMatch) {
      console.log('[admin-api] ROUTE', 'designation_review/:id/assign (POST)')
      const reviewId = assignMatch[1];
      const { assigned_practice_id } = await req.json();
      const { error } = await supabase.rpc('admin_assign_designation_review', { p_review_id: reviewId, p_assigned_practice_id: assigned_practice_id, p_admin_user_id: adminUserId });
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.log('[admin-api] NO_MATCH', path)
    return new Response('Not Found', { status: 404, headers: corsHeaders })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
  }
})
