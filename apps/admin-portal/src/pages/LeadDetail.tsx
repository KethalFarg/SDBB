import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const API_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api`;
const PRACTICES_ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api/admin/practices`;

export function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSnapshot, setShowSnapshot] = useState(false);
  const [practices, setPractices] = useState<any[]>([]);
  const [selectedPractice, setSelectedPractice] = useState<string>('');
  const [reassignLoading, setReassignLoading] = useState(false);
  const [unassignLoading, setUnassignLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evt, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      if (!newSession) {
        setLead(null);
      }
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session || !id) return;
    fetchLead(session, id);
    fetchPractices(session);
  }, [session, id]);

  const fetchLead = async (activeSession: any, leadId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/leads/${leadId}`, {
        headers: { Authorization: `Bearer ${activeSession.access_token}` }
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Failed to load lead (${res.status}) for id: ${leadId}`);
      }
      const json = await res.json();
      setLead(json.data);
      if (json.data?.practice_id) {
        setSelectedPractice(json.data.practice_id);
      }
    } catch (err: any) {
      setError(err.message || `Failed to load lead for id: ${leadId}`);
    } finally {
      setLoading(false);
    }
  };

  const unassign = async () => {
    if (!session || !id) return;
    if (!lead?.practice_id) {
      setMessage('Lead is not currently assigned.');
      return;
    }
    const confirmed = window.confirm('This will remove the practice assignment and return the lead to Designation Review. Continue?');
    if (!confirmed) return;
    setUnassignLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE}/admin/leads/${id}/unassign`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Failed to unassign (${res.status})`);
      }
      const json = await res.json();
      setLead(json.data);
      setSelectedPractice('');
      setMessage('Lead unassigned and returned to review.');
    } catch (err: any) {
      setError(err.message || 'Failed to unassign lead');
    } finally {
      setUnassignLoading(false);
    }
  };

  const fetchPractices = async (activeSession: any) => {
    try {
      const res = await fetch(PRACTICES_ENDPOINT, {
        headers: { Authorization: `Bearer ${activeSession.access_token}` }
      });
      if (!res.ok) return;
      const json = await res.json();
      setPractices(json.data || []);
    } catch (e) {
      // ignore
    }
  };

  const reassign = async () => {
    if (!session || !id) return;
    if (!selectedPractice) {
      setMessage('Please select a practice to reassign.');
      return;
    }
    const confirmed = window.confirm('This will move the lead to a different practice. Continue?');
    if (!confirmed) return;
    setReassignLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE}/admin/leads/${id}/reassign`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ practice_id: selectedPractice })
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Failed to reassign (${res.status})`);
      }
      const json = await res.json();
      setLead(json.data);
      setMessage('Lead reassigned successfully.');
    } catch (err: any) {
      setError(err.message || 'Failed to reassign lead');
    } finally {
      setReassignLoading(false);
    }
  };

  if (!session) return <div>Loading session...</div>;
  if (loading) return <div>Loading lead...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!lead) return <div>No lead found.</div>;

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Lead Detail</h2>
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => navigate(-1)}>Back</button>
      </div>
      <div><strong>ID:</strong> {lead.id}</div>
      <div><strong>Created:</strong> {lead.created_at}</div>
      <div><strong>Name:</strong> {lead.first_name} {lead.last_name}</div>
      <div><strong>Email:</strong> {lead.email}</div>
      <div><strong>Phone:</strong> {lead.phone}</div>
      <div><strong>ZIP:</strong> {lead.zip}</div>
      <div><strong>Source:</strong> {lead.source}</div>
      <div><strong>Assigned Practice:</strong> {lead.practice_name ? `${lead.practice_name} (${lead.practice_id})` : lead.practice_id ? lead.practice_id : 'Unassigned'}</div>
      <div><strong>Lead Status:</strong> {lead.lead_status}</div>
      <div><strong>Routing Outcome:</strong> {lead.routing_outcome}</div>
      <div><strong>Designation Reason:</strong> {lead.designation_reason ?? 'None'}</div>
      <div><strong>GHL Sync Status:</strong> {lead.ghl_sync_status === 'enabled_stub' ? 'Enabled (Stub)' : 'Disabled'}</div>
      <div><strong>Would Sync:</strong> {lead.ghl_would_sync ? 'Yes' : 'No'}</div>
      <div style={{ marginTop: '1rem', borderTop: '1px solid #ddd', paddingTop: '0.75rem' }}>
        <h3>Reassign Lead</h3>
        <div style={{ marginBottom: '0.5rem' }}>
          <select
            value={selectedPractice}
            onChange={(e) => setSelectedPractice(e.target.value)}
            style={{ width: '260px', marginRight: '0.5rem' }}
          >
            <option value="">Select practice</option>
            {practices.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button onClick={reassign} disabled={reassignLoading}>
            {reassignLoading ? 'Reassigning...' : 'Reassign'}
          </button>
          {lead.practice_id && (
            <button onClick={unassign} disabled={unassignLoading} style={{ marginLeft: '0.5rem' }}>
              {unassignLoading ? 'Unassigning...' : 'Unassign (Return to Review)'}
            </button>
          )}
        </div>
        {message && <div style={{ color: 'green', marginTop: '0.25rem' }}>{message}</div>}
      </div>
      <div style={{ marginTop: '0.5rem' }}>
        <button onClick={() => setShowSnapshot(!showSnapshot)}>
          {showSnapshot ? 'Hide' : 'Show'} Routing Snapshot
        </button>
      </div>
      {showSnapshot && (
        <pre style={{ background: '#f6f6f6', padding: '0.75rem', marginTop: '0.5rem', maxHeight: '400px', overflow: 'auto' }}>
          {JSON.stringify(lead.routing_snapshot, null, 2)}
        </pre>
      )}
    </div>
  );
}

