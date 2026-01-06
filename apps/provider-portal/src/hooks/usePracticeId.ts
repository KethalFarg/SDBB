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
          .maybeSingle();

        if (userError) throw userError;

        let pId = data?.practice_id;
        let pData = data?.practices;

        // Admin Preview Mode fallback
        if (!pId) {
          let isAdmin = false;
          // Try user_id column first
          const { data: adminUser, error: adminErr } = await supabase
            .from('admin_users')
            .select('id')
            .eq('user_id', session!.user.id)
            .maybeSingle();
          
          if (!adminErr && adminUser) {
            isAdmin = true;
          } else {
            // Try id column
            const { data: adminUserById } = await supabase
              .from('admin_users')
              .select('id')
              .eq('id', session!.user.id)
              .maybeSingle();
            if (adminUserById) isAdmin = true;
          }

          if (isAdmin) {
            const params = new URLSearchParams(window.location.search);
            const previewId = params.get('practice_id');
            if (previewId) {
              const { data: pPreview, error: pError } = await supabase
                .from('practices')
                .select('id, name, status, booking_settings, timezone, lat, lng, radius_miles')
                .eq('id', previewId)
                .single();
              
              if (!pError && pPreview) {
                pId = previewId;
                pData = pPreview;
                console.log('[usePracticeId] Admin Preview Mode active:', pId);
              }
            }
          }
        }
        
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

