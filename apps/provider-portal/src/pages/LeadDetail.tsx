import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useSession } from '../hooks/useSession';

export function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useSession();
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session || !id) return;
    fetchLead(id);
  }, [session, id]);

  const fetchLead = async (leadId: string) => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('leads')
      .select('id, created_at, first_name, last_name, email, phone, zip, source, practice_id, routing_outcome')
      .eq('id', leadId)
      .single();
    if (error || !data) {
      setError('Not found / Unauthorized');
      setLead(null);
    } else {
      setLead(data);
    }
    setLoading(false);
  };

  const statusFor = (lead: any) => {
    if (lead.practice_id) return <span className="status-pill status-assigned">Assigned</span>;
    if (lead.routing_outcome === 'designation') return <span className="status-pill status-review">Needs Review</span>;
    if (lead.routing_outcome === 'no_provider_in_radius') return <span className="status-pill status-no-coverage">No Coverage</span>;
    return <span className="status-pill status-new">New</span>;
  };

  if (!session) return <div className="main-content">Loading session...</div>;
  if (loading) return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading lead details...</div>;
  if (error) return <div className="card" style={{ color: '#991b1b', backgroundColor: '#fef2f2' }}>{error}</div>;
  if (!lead) return <div className="card">No lead found.</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => navigate(-1)} className="btn btn-outline">
          &larr; Back to Leads
        </button>
        <h2 style={{ marginBottom: 0 }}>Lead Detail</h2>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1.5rem' }}>
          <div>
            <h3 style={{ marginBottom: '0.25rem' }}>
              {(lead.first_name || lead.last_name) ? `${lead.first_name ?? ''} ${lead.last_name ?? ''}`.trim() : 'Unnamed Lead'}
            </h3>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>ID: {lead.id}</span>
          </div>
          <div>
            {statusFor(lead)}
          </div>
        </div>

        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">Email Address</span>
            <span className="detail-value">{lead.email ?? 'N/A'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Phone Number</span>
            <span className="detail-value">{lead.phone ?? 'N/A'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">ZIP Code</span>
            <span className="detail-value">{lead.zip ?? 'N/A'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Source</span>
            <span className="detail-value">{lead.source ?? 'N/A'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Submission Date</span>
            <span className="detail-value">{new Date(lead.created_at).toLocaleString()}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Routing Outcome</span>
            <span className="detail-value" style={{ textTransform: 'capitalize' }}>
              {lead.routing_outcome?.replace(/_/g, ' ') ?? 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

