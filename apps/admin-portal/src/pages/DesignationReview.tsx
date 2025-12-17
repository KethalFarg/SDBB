import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

type ReviewItem = {
  id: string;
  lead_id: string;
  reason_code: string;
  created_at?: string;
  resolved_at?: string | null;
  lead_zip?: string | null;
  lead_created_at?: string | null;
  notes?: string | null;
};

type Practice = { id: string; name: string };

const API_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api`;

export function DesignationReview() {
  const [session, setSession] = useState<any>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [practices, setPractices] = useState<Practice[]>([]);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evt, newSession) => {
      setSession(newSession);
      if (!newSession) {
        setReviews([]);
      }
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) return;
    fetchData(session);
  }, [session]);

  const fetchData = async (activeSession: any) => {
    setLoading(true);
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${activeSession.access_token}` };

      const [reviewsRes, practicesRes] = await Promise.all([
        fetch(`${API_BASE}/designation_review`, { headers }),
        fetch(`${API_BASE}/admin/practices`, { headers })
      ]);

      if (!reviewsRes.ok) throw new Error(`Failed to load designation review (${reviewsRes.status})`);
      if (!practicesRes.ok) throw new Error(`Failed to load practices (${practicesRes.status})`);

      const reviewsJson = await reviewsRes.json();
      const practicesJson = await practicesRes.json();

      setReviews(reviewsJson.data || []);
      setPractices(practicesJson.data || []);
    } catch (err: any) {
      setError(err.message || 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const assign = async (reviewId: string) => {
    if (!session) return;
    const practiceId = selected[reviewId];
    if (!practiceId) {
      alert('Please select a practice');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/designation_review/${reviewId}/assign`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ assigned_practice_id: practiceId })
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Failed with status ${res.status}`);
      }
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (err: any) {
      alert(err.message || 'Failed to assign');
    }
  };

  if (!session) {
    return <div>Loading session...</div>;
  }

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Designation Review</h2>
      {error && <div style={{ color: 'red', marginBottom: '0.5rem' }}>{error}</div>}
      {loading && <div>Loading...</div>}
      {(!loading && reviews.length === 0) && <div>No items to review.</div>}

      {reviews.map((item) => (
        <div key={item.id} style={{ border: '1px solid #ddd', padding: '0.75rem', marginBottom: '0.75rem' }}>
          <div><strong>Lead ID:</strong> {item.lead_id}</div>
          <div><strong>ZIP:</strong> {item.lead_zip ?? 'N/A'}</div>
          <div><strong>Reason:</strong> {item.reason_code}</div>
          <div><strong>Review Created:</strong> {item.created_at ?? 'N/A'}</div>
          <div><strong>Lead Created:</strong> {item.lead_created_at ?? 'N/A'}</div>
          <div style={{ marginTop: '0.25rem' }}>
            <Link to={`/admin/leads/${item.lead_id}`} target="_blank" rel="noreferrer">Open Lead Detail</Link>
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <select
              value={selected[item.id] || ''}
              onChange={(e) => setSelected((prev) => ({ ...prev, [item.id]: e.target.value }))}
              style={{ width: '200px', marginRight: '0.5rem' }}
            >
              <option value="">Select practice</option>
              {practices.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <button onClick={() => assign(item.id)}>Assign</button>
          </div>
        </div>
      ))}
    </div>
  );
}

