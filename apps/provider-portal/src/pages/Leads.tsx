import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useSession } from '../hooks/useSession';
import { usePracticeId } from '../hooks/usePracticeId';
import { PageShell } from '../components/PageShell';
import { EmptyState } from '../components/EmptyState';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { DataTable } from '../components/DataTable';
import { StatusPill } from '../components/StatusPill';

type Lead = {
  id: string;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  zip: string | null;
  routing_outcome: string | null;
  practice_id: string | null;
  assessments?: { id: string }[];
};

export function Leads() {
  const { session } = useSession();
  const { practiceId, loading: loadingPractice, error: practiceError } = usePracticeId();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');

  useEffect(() => {
    if (!practiceId) return;
    fetchLeads();
  }, [practiceId]);

  const fetchLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetching leads and checking for assessments in one go
      const { data, error: fetchError } = await supabase
        .from('leads')
        .select(`
          id, 
          created_at, 
          first_name, 
          last_name, 
          email, 
          phone, 
          zip, 
          routing_outcome, 
          practice_id,
          assessments(id)
        `)
        .eq('practice_id', practiceId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setLeads((data as any) || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return leads;
    return leads.filter((l) => {
      return (
        l.id?.toLowerCase().includes(term) ||
        (l.email ?? '').toLowerCase().includes(term) ||
        (l.phone ?? '').toLowerCase().includes(term) ||
        (l.zip ?? '').toLowerCase().includes(term) ||
        `${l.first_name ?? ''} ${l.last_name ?? ''}`.toLowerCase().includes(term)
      );
    });
  }, [q, leads]);

  if (!session) return <LoadingState />;
  if (loadingPractice || loading) return <LoadingState />;
  if (error || practiceError) return <ErrorState message={error || practiceError || ''} retry={fetchLeads} />;

  if (!practiceId) {
    return (
      <PageShell title="Leads">
        <EmptyState 
          title="No Practice Assigned" 
          description="No practice assigned to this account. Contact support." 
        />
      </PageShell>
    );
  }

  return (
    <PageShell 
      title="Leads" 
      subtitle="Patients who have expressed interest in spinal decompression"
      actions={
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input
            type="text"
            className="input-search input-sm"
            placeholder="Search leads..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button onClick={fetchLeads} className="btn btn-outline btn-sm">Refresh</button>
        </div>
      }
    >
      <DataTable 
        headers={['Created', 'Name', 'Phone', 'Email', 'Status', '']} 
        empty={filtered.length === 0}
        onEmpty={
          <EmptyState 
            title={leads.length === 0 ? "No leads yet" : "No results"} 
            description={leads.length === 0 ? "Leads assigned to your practice will appear here." : "Try a different search term."} 
          />
        }
      >
        {filtered.map((lead) => (
          <tr key={lead.id}>
            <td>{new Date(lead.created_at).toLocaleDateString()}</td>
            <td style={{ fontWeight: 600 }}>
              {(lead.first_name || lead.last_name) ? `${lead.first_name ?? ''} ${lead.last_name ?? ''}`.trim() : 'N/A'}
            </td>
            <td>{lead.phone ?? 'N/A'}</td>
            <td>{lead.email ?? 'N/A'}</td>
            <td><StatusPill status={lead.practice_id ? 'assigned' : (lead.routing_outcome || 'new')} /></td>
            <td style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                {lead.assessments && lead.assessments.length > 0 && (
                  <button className="btn btn-primary btn-sm" title="View Assessment Report">Report</button>
                )}
                <Link to={`/leads/${lead.id}`} className="btn btn-outline btn-sm">
                  View
                </Link>
              </div>
            </td>
          </tr>
        ))}
      </DataTable>
    </PageShell>
  );
}
