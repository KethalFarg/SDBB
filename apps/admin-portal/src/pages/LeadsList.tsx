import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const API_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api`;
const PAGE_SIZE = 25;

type LeadListItem = {
  id: string;
  created_at: string;
  zip: string;
  source: string;
  routing_outcome: string | null;
  designation_reason: string | null;
  practice_id: string | null;
  practice_name: string | null;
  lead_status: string;
};

export function LeadsList() {
  const [session, setSession] = useState<any>(null);
  const [leads, setLeads] = useState<LeadListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }: { data: { session: any } }) => {
      if (!mounted) return;
      setSession(data.session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evt, newSession) => {
      setSession(newSession);
      if (!newSession) {
        setLeads([]);
      }
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) return;
    fetchLeads(session, q, offset);
  }, [session, q, offset]);

  const fetchLeads = async (activeSession: any, query: string, start: number) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('limit', String(PAGE_SIZE));
      params.set('offset', String(start));
      if (query.trim().length > 0) {
        params.set('q', query.trim());
      }
      const res = await fetch(`${API_BASE}/admin/leads?${params.toString()}`, {
        headers: { Authorization: `Bearer ${activeSession.access_token}` }
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Failed to load leads (${res.status})`);
      }
      const json = await res.json();
      setLeads(json.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setOffset(0);
    // q is already bound
  };

  const nextPage = () => setOffset((prev) => prev + PAGE_SIZE);
  const prevPage = () => setOffset((prev) => Math.max(0, prev - PAGE_SIZE));

  const cleanupTestLeads = async () => {
    if (!session) return;
    const confirmed = window.confirm('This will permanently delete test leads with ZIP 99999. Continue?');
    if (!confirmed) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/leads/cleanup-test`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Failed cleanup (${res.status})`);
      }
      const json = await res.json();
      alert(`Deleted ${json.deleted_count ?? 0} test leads`);
      // refresh list
      fetchLeads(session, q, offset);
    } catch (err: any) {
      setError(err.message || 'Failed to delete test leads');
    } finally {
      setLoading(false);
    }
  };

  if (!session) return <div>Loading session...</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0 }}>Leads</h2>
        <button 
          onClick={cleanupTestLeads}
          style={{ padding: '0.5rem 1rem', background: '#fef2f2', color: '#991b1b', border: '1px solid #fee2e2', borderRadius: '4px', cursor: 'pointer' }}
        >
          Delete Test Leads (ZIP 99999)
        </button>
      </div>
      <form onSubmit={onSearch} style={{ marginBottom: '0.75rem' }}>
        <input
          type="text"
          placeholder="Search by id, zip, email, phone"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ width: '300px', marginRight: '0.5rem' }}
        />
        <button type="submit">Search</button>
      </form>
      {error && <div style={{ color: 'red', marginBottom: '0.5rem' }}>{error}</div>}
      {loading && <div>Loading...</div>}
      {!loading && leads.length === 0 && <div>No leads found.</div>}
      {!loading && leads.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '0.25rem' }}>Created</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '0.25rem' }}>ZIP</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '0.25rem' }}>Source</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '0.25rem' }}>Outcome</th>
          <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '0.25rem' }}>Status</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '0.25rem' }}>Practice</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '0.25rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td style={{ padding: '0.25rem', borderBottom: '1px solid #eee' }}>{lead.created_at}</td>
                <td style={{ padding: '0.25rem', borderBottom: '1px solid #eee' }}>{lead.zip}</td>
                <td style={{ padding: '0.25rem', borderBottom: '1px solid #eee' }}>{lead.source}</td>
                <td style={{ padding: '0.25rem', borderBottom: '1px solid #eee' }}>{lead.routing_outcome ?? 'N/A'}</td>
            <td style={{ padding: '0.25rem', borderBottom: '1px solid #eee' }}>{lead.lead_status}</td>
                <td style={{ padding: '0.25rem', borderBottom: '1px solid #eee' }}>{lead.practice_name ?? (lead.practice_id ? lead.practice_id : 'Unassigned')}</td>
                <td style={{ padding: '0.25rem', borderBottom: '1px solid #eee' }}>
                  <Link to={`/admin/leads/${lead.id}`}>View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div style={{ marginTop: '0.75rem' }}>
        <button onClick={prevPage} disabled={offset === 0} style={{ marginRight: '0.5rem' }}>Prev</button>
        <button onClick={nextPage}>Next</button>
      </div>
    </div>
  );
}

