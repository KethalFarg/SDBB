import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useSession } from '../hooks/useSession';
import { PageShell } from '../components/PageShell';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { StatusPill } from '../components/StatusPill';

export function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useSession();
  const [lead, setLead] = useState<any>(null);
  const [hasAssessment, setHasAssessment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session || !id) return;
    fetchLead(id);
    checkAssessment(id);
  }, [session, id]);

  const fetchLead = async (leadId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('id, created_at, first_name, last_name, email, phone, zip, source, practice_id, routing_outcome')
        .eq('id', leadId)
        .single();
      
      if (error || !data) {
        setError('Lead not found or unauthorized access.');
        setLead(null);
      } else {
        setLead(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkAssessment = async (leadId: string) => {
    try {
      const { count } = await supabase
        .from('assessments')
        .select('id', { count: 'exact', head: true })
        .eq('lead_id', leadId);
      setHasAssessment((count || 0) > 0);
    } catch (err) {
      console.error('Error checking assessment:', err);
    }
  };

  if (!session || loading) return <LoadingState />;
  if (error) return <ErrorState message={error} retry={() => id && fetchLead(id)} />;
  if (!lead) return <PageShell title="Lead Details"><ErrorState message="No lead found" /></PageShell>;

  return (
    <PageShell 
      title={(lead.first_name || lead.last_name) ? `${lead.first_name ?? ''} ${lead.last_name ?? ''}`.trim() : 'Unnamed Lead'}
      subtitle={`Lead ID: ${lead.id}`}
      actions={
        <div style={{ display: 'flex', gap: '1rem' }}>
          {hasAssessment && <button className="btn btn-primary btn-sm">View Report</button>}
          <button onClick={() => navigate(-1)} className="btn btn-outline btn-sm">&larr; Back</button>
        </div>
      }
    >
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Patient Information</h3>
          <StatusPill status={lead.practice_id ? 'assigned' : (lead.routing_outcome || 'new')} />
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
            <span className="detail-value" style={{ textTransform: 'capitalize' }}>{lead.source?.replace(/_/g, ' ') ?? 'N/A'}</span>
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
    </PageShell>
  );
}
