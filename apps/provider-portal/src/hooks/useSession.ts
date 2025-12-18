import { useEffect, useState } from 'react';
import { supabase, envMissing } from '../supabaseClient';
import type { Session, AuthChangeEvent } from '@supabase/supabase-js';

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    if (envMissing) {
      setSession(null);
      setUser(null);
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      if (!mounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, newSession: Session | null) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { session, user, loading };
}

