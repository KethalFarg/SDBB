import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const envMissing = !supabaseUrl || !supabaseAnonKey

// Provide a safe stub if env vars are missing so the app does not crash.
const stubAuth = {
  getSession: async () => ({ data: { session: null }, error: new Error('Supabase env not configured') }),
  onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  signInWithPassword: async () => ({ data: null, error: new Error('Supabase env not configured') }),
  signOut: async () => ({ error: new Error('Supabase env not configured') })
};

export const supabase = envMissing
  ? ({ auth: stubAuth } as any)
  : createClient(supabaseUrl!, supabaseAnonKey!)

