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
    if (lead.practice_id) return 'Assigned';
    if (lead.routing_outcome === 'designation') return 'Needs Review';
    if (lead.routing_outcome === 'no_provider_in_radius') return 'No Coverage';
    return 'New';
  };

  if (!session) return <div>Loading session...</div>;

  return (
    <div>
      <h2>Leads</h2>
      <div style={{ marginBottom: '0.75rem' }}>
        <input
          type="text"
          placeholder="Search by id, email, phone, zip, name"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ width: '320px', padding: '0.5rem' }}
        />
      </div>
      {error && <div style={{ color: 'red', marginBottom: '0.5rem' }}>{error}</div>}
      {loading && <div>Loading...</div>}
      {!loading && filtered.length === 0 && <div>No leads found.</div>}
      {!loading && filtered.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '0.25rem' }}>Created</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '0.25rem' }}>Name</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '0.25rem' }}>Phone</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '0.25rem' }}>Email</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '0.25rem' }}>ZIP</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '0.25rem' }}>Status</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '0.25rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead) => (
              <tr key={lead.id}>
                <td style={{ padding: '0.25rem', borderBottom: '1px solid #eee' }}>{lead.created_at}</td>
                <td style={{ padding: '0.25rem', borderBottom: '1px solid #eee' }}>
                  {(lead.first_name || lead.last_name) ? `${lead.first_name ?? ''} ${lead.last_name ?? ''}`.trim() : 'N/A'}
                </td>
                <td style={{ padding: '0.25rem', borderBottom: '1px solid #eee' }}>{lead.phone ?? 'N/A'}</td>
                <td style={{ padding: '0.25rem', borderBottom: '1px solid #eee' }}>{lead.email ?? 'N/A'}</td>
                <td style={{ padding: '0.25rem', borderBottom: '1px solid #eee' }}>{lead.zip ?? 'N/A'}</td>
                <td style={{ padding: '0.25rem', borderBottom: '1px solid #eee' }}>{statusFor(lead)}</td>
                <td style={{ padding: '0.25rem', borderBottom: '1px solid #eee' }}>
                  <Link to={`/leads/${lead.id}`}>View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

