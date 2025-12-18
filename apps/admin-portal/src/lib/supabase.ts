import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("[ADMIN_PORTAL] VITE_SUPABASE_URL =", supabaseUrl);
console.log("[ADMIN_PORTAL] anon key present =", !!supabaseAnonKey);

let supabase: ReturnType<typeof createClient>;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables; using no-op client for UI preview only');
  supabase = {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: async () => ({ data: null, error: new Error('Supabase env vars missing') }),
      signOut: async () => ({ error: new Error('Supabase env vars missing') }),
    },
  } as unknown as ReturnType<typeof createClient>;
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "sd_admin_portal_auth",
    },
  });
}

export { supabase };

