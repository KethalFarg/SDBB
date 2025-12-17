import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2"

export async function requireAdminAuth(req: Request): Promise<string> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    throw new Error('Unauthorized: Missing Authorization header');
  }

  // 1. Verify User Session
  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } }
  });

  const { data: { user }, error: authError } = await authClient.auth.getUser();

  if (authError || !user) {
    throw new Error('Unauthorized: Invalid token');
  }

  // 2. Check Admin Status (using Service Role)
  const adminClient = createClient(supabaseUrl, supabaseServiceKey);
  
  const { data: adminRecord, error: adminError } = await adminClient
    .from('admin_users')
    .select('user_id')
    .eq('user_id', user.id)
    .single();

  if (adminError || !adminRecord) {
    throw new Error('Forbidden: Not an admin');
  }

  return user.id;
}

