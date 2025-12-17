import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useSession } from '../hooks/useSession';

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
};

export function Leads() {
  const { session } = useSession();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');

  useEffect(() => {
    if (!session) return;
    fetchLeads();
  }, [session]);

  const fetchLeads = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('leads')
      .select('id, created_at, first_name, last_name, email, phone, zip, routing_outcome, practice_id')
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setLeads(data || []);
    }
    setLoading(false);
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

  const statusFor = (lead: Lead) => {
    if (lead.practice_id) return <span className="status-pill status-assigned">Assigned</span>;
    if (lead.routing_outcome === 'designation') return <span className="status-pill status-review">Needs Review</span>;
    if (lead.routing_outcome === 'no_provider_in_radius') return <span className="status-pill status-no-coverage">No Coverage</span>;
    return <span className="status-pill status-new">New</span>;
  };

  if (!session) return <div className="main-content">Loading session...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Leads</h2>
        <input
          type="text"
          className="input-search"
          placeholder="Search leads..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {error && <div className="card" style={{ color: '#991b1b', backgroundColor: '#fef2f2', border: '1px solid #fee2e2' }}>{error}</div>}
      
      {loading && <div style={{ textAlign: 'center', padding: '3rem' }}>Loading leads...</div>}
      
      {!loading && filtered.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
          No leads found matching your search.
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Created</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>ZIP</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead) => (
                  <tr key={lead.id}>
                    <td>{new Date(lead.created_at).toLocaleDateString()}</td>
                    <td style={{ fontWeight: 600 }}>
                      {(lead.first_name || lead.last_name) ? `${lead.first_name ?? ''} ${lead.last_name ?? ''}`.trim() : 'N/A'}
                    </td>
                    <td>{lead.phone ?? 'N/A'}</td>
                    <td>{lead.email ?? 'N/A'}</td>
                    <td>{lead.zip ?? 'N/A'}</td>
                    <td>{statusFor(lead)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/leads/${lead.id}`} className="btn btn-outline btn-sm">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

