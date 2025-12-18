import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useSession } from './useSession';

export function usePracticeId() {
  const { session, loading: sessionLoading } = useSession();
  const [practiceId, setPracticeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionLoading) return;
    
    if (!session) {
      setLoading(false);
      return;
    }

    async function fetchPracticeId() {
      try {
        const { data, error: userError } = await supabase
          .from('practice_users')
          .select('practice_id')
          .eq('user_id', session.user.id)
          .limit(1);

        if (userError) throw userError;

        const pId = data?.[0]?.practice_id;
        setPracticeId(pId || null);
      } catch (err: any) {
        console.error('Error fetching practice_id:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPracticeId();
  }, [session, sessionLoading]);

  return { practiceId, loading: loading || sessionLoading, error };
}

