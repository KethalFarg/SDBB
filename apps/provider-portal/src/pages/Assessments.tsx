import { useEffect, useState } from 'react';
import { PageShell } from '../components/PageShell';
import { EmptyState } from '../components/EmptyState';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { DataTable } from '../components/DataTable';
import { supabase } from '../supabaseClient';
import { usePracticeId } from '../hooks/usePracticeId';
import { Link } from 'react-router-dom';

export function Assessments() {
  const { practiceId, loading: loadingPractice } = usePracticeId();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!practiceId) return;
    fetchAssessments();
  }, [practiceId]);

  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('assessments')
        .select(`
          id,
          created_at,
          lead_id,
          leads (
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .eq('practice_id', practiceId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssessments(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingPractice || loading) return <LoadingState />;
  if (error) return <ErrorState message={error} retry={fetchAssessments} />;

  if (!practiceId) {
    return (
      <PageShell title="Assessments">
        <EmptyState 
          title="No Practice Assigned" 
          description="No practice assigned to this account. Contact support." 
        />
      </PageShell>
    );
  }

  return (
    <PageShell 
      title="Assessments" 
      subtitle="Patients who have completed their initial assessment"
      actions={
        <button onClick={fetchAssessments} className="btn btn-outline btn-sm">Refresh</button>
      }
    >
      <DataTable 
        headers={['Date', 'Patient', 'Contact', '']} 
        empty={assessments.length === 0}
        onEmpty={
          <EmptyState 
            title="No assessments yet" 
            description="Assessments appear here once a lead completes the diagnostic quiz."
          />
        }
      >
        {assessments.map((a) => (
          <tr key={a.id}>
            <td>{new Date(a.created_at).toLocaleDateString()}</td>
            <td style={{ fontWeight: 600 }}>
              {a.leads ? `${a.leads.first_name ?? ''} ${a.leads.last_name ?? ''}`.trim() : 'N/A'}
            </td>
            <td style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
              {a.leads?.email}<br/>{a.leads?.phone}
            </td>
            <td style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary btn-sm">View Report</button>
                <Link to={`/leads/${a.lead_id}`} className="btn btn-outline btn-sm">View Lead</Link>
              </div>
            </td>
          </tr>
        ))}
      </DataTable>
    </PageShell>
  );
}

