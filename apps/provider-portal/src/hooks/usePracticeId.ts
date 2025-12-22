import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useSession } from './useSession';

export function usePracticeId() {
  const { session, loading: sessionLoading } = useSession();
  const [practiceId, setPracticeId] = useState<string | null>(null);
  const [practice, setPractice] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionLoading) return;
    
    if (!session) {
      setLoading(false);
      return;
    }

    async function fetchPracticeInfo() {
      try {
        const { data, error: userError } = await supabase
          .from('practice_users')
          .select('practice_id, practices(id, name, status, booking_settings, timezone)')
          .eq('user_id', session!.user.id)
          .limit(1);

        if (userError) throw userError;

        const pId = data?.[0]?.practice_id;
        const pData = data?.[0]?.practices;
        
        setPracticeId(pId || null);
        setPractice(pData || null);
      } catch (err: any) {
        console.error('Error fetching practice info:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPracticeInfo();
  }, [session, sessionLoading]);

  return { 
    practiceId, 
    practice, 
    loading: loading || sessionLoading, 
    error 
  };
}

