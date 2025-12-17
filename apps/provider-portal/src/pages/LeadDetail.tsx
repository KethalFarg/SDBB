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
    if (lead.practice_id) return 'Assigned';
    if (lead.routing_outcome === 'designation') return 'Needs Review';
    if (lead.routing_outcome === 'no_provider_in_radius') return 'No Coverage';
    return 'New';
  };

  if (!session) return <div>Loading session...</div>;
  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!lead) return <div>No lead found.</div>;

  return (
    <div>
      <button onClick={() => navigate(-1)} style={{ marginBottom: '0.75rem' }}>Back</button>
      <h2>Lead Detail</h2>
      <div><strong>Name:</strong> {(lead.first_name || lead.last_name) ? `${lead.first_name ?? ''} ${lead.last_name ?? ''}`.trim() : 'N/A'}</div>
      <div><strong>Email:</strong> {lead.email ?? 'N/A'}</div>
      <div><strong>Phone:</strong> {lead.phone ?? 'N/A'}</div>
      <div><strong>ZIP:</strong> {lead.zip ?? 'N/A'}</div>
      <div><strong>Created:</strong> {lead.created_at}</div>
      <div><strong>Source:</strong> {lead.source ?? 'N/A'}</div>
      <div><strong>Status:</strong> {statusFor(lead)}</div>
    </div>
  );
}

