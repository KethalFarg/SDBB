import { useEffect, useState } from 'react';
import { PageShell } from '../components/PageShell';
import { EmptyState } from '../components/EmptyState';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { supabase } from '../supabaseClient';
import { usePracticeId } from '../hooks/usePracticeId';

export function Settings() {
  const { practiceId, loading: loadingPractice } = usePracticeId();
  const [practice, setPractice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!practiceId) return;
    fetchPractice();
  }, [practiceId]);

  const fetchPractice = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('practices')
        .select('*')
        .eq('id', practiceId)
        .single();

      if (error) throw error;
      setPractice(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingPractice || loading) return <LoadingState />;
  if (error) return <ErrorState message={error} retry={fetchPractice} />;

  if (!practiceId) {
    return (
      <PageShell title="Settings">
        <EmptyState 
          title="No Practice Assigned" 
          description="No practice assigned to this account. Contact support." 
        />
      </PageShell>
    );
  }

  return (
    <PageShell 
      title="Settings" 
      subtitle="Manage your practice profile and portal preferences"
    >
      <div className="settings-container">
        <section className="settings-section card">
          <h3 className="section-title">Practice Profile</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Practice Name</label>
              <div>{practice.name}</div>
            </div>
            <div className="detail-item">
              <label>Status</label>
              <div style={{ textTransform: 'capitalize' }}>{practice.status}</div>
            </div>
            <div className="detail-item">
              <label>Address</label>
              <div>{practice.address || 'N/A'}</div>
            </div>
            <div className="detail-item">
              <label>Service Radius</label>
              <div>{practice.radius_miles} miles</div>
            </div>
          </div>
        </section>

        <section className="settings-section card" style={{ marginTop: '2rem' }}>
          <h3 className="section-title">Booking Configuration</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Timezone</label>
              <div>{practice.booking_settings?.timezone || 'UTC'}</div>
            </div>
            <div className="detail-item">
              <label>Lead Source</label>
              <div>{practice.profile_payload?.source_id || 'System Default'}</div>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}

