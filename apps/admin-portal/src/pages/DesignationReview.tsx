import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

type ReviewItem = {
  id: string;
  lead_id: string;
  assigned_practice_id?: string | null;
  reason_code?: string;
  reason?: string;
  created_at?: string;
  resolved_at?: string | null;
  lead_zip?: string | null;
  lead_created_at?: string | null;
  notes?: string | null;
  lead?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    designation_reason?: string;
  };
};

type Practice = { id: string; name: string };

const API_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api`;

export function DesignationReview() {
  const [session, setSession] = useState<any>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [practices, setPractices] = useState<Practice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Per-row UI state
  const [selectedPracticeByReviewId, setSelectedPracticeByReviewId] = useState<Record<string, string>>({});
  const [notesByReviewId, setNotesByReviewId] = useState<Record<string, string>>({});
  const [assigningByReviewId, setAssigningByReviewId] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }: { data: { session: any } }) => {
      if (!mounted) return;
      setSession(data.session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evt, newSession) => {
      if (!mounted) return;
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

      if (!reviewsRes.ok) {
        const txt = await reviewsRes.text();
        throw new Error(`Failed to load reviews (${reviewsRes.status}): ${txt}`);
      }
      if (!practicesRes.ok) {
        const txt = await practicesRes.text();
        throw new Error(`Failed to load practices (${practicesRes.status}): ${txt}`);
      }

      const reviewsJson = await reviewsRes.json();
      const practicesJson = await practicesRes.json();

      const normalizedReviews = Array.isArray(reviewsJson) ? reviewsJson : (reviewsJson.data || []);
      const normalizedPractices = Array.isArray(practicesJson) ? practicesJson : (practicesJson.data || []);

      setReviews(normalizedReviews);
      setPractices(normalizedPractices);

      // Prefill row notes and selected practices
      const newNotes: Record<string, string> = {};
      const newSelectedPractices: Record<string, string> = {};
      normalizedReviews.forEach((r: ReviewItem) => {
        newNotes[r.id] = r.notes || '';
        if (r.assigned_practice_id) {
          newSelectedPractices[r.id] = r.assigned_practice_id;
        }
      });
      setNotesByReviewId(newNotes);
      setSelectedPracticeByReviewId(newSelectedPractices);
    } catch (err: any) {
      setError(err.message || 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const assign = async (reviewId: string) => {
    if (!session) return;
    
    const practiceId = selectedPracticeByReviewId[reviewId];
    if (!practiceId) {
      alert('Please select a practice for this assignment.');
      return;
    }

    const practiceName = practices.find(p => p.id === practiceId)?.name || 'selected practice';
    const notes = notesByReviewId[reviewId] || 'Assigned from Admin Portal UI';

    setAssigningByReviewId(prev => ({ ...prev, [reviewId]: true }));
    setError(null);
    setMessage(null);

    try {
      const res = await fetch(`${API_BASE}/designation_review/${reviewId}/assign`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          assigned_practice_id: practiceId,
          reason_code: 'manual_admin_assignment',
          notes
        })
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Assignment failed (${res.status}): ${text}`);
      }

      setMessage(`Assigned review ${reviewId} to ${practiceName}.`);
      
      // Optimistic UI: Filter out the resolved item
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      
      // Re-fetch to ensure sync
      await fetchData(session);
    } catch (err: any) {
      setError(err.message || 'Failed to assign lead');
    } finally {
      setAssigningByReviewId(prev => ({ ...prev, [reviewId]: false }));
    }
  };

  // Only show unresolved items
  const queue = reviews.filter(r => !r.resolved_at);

  if (!session) {
    return <div style={{ padding: '2rem' }}>Loading session...</div>;
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>Designation Review Queue</h2>
      
      {error && (
        <div style={{ color: '#d32f2f', background: '#fdecea', padding: '1rem', borderRadius: '4px', marginBottom: '1rem', border: '1px solid #f5c6cb' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {message && (
        <div style={{ color: '#155724', background: '#d4edda', padding: '1rem', borderRadius: '4px', marginBottom: '1rem', border: '1px solid #c3e6cb' }}>
          {message}
        </div>
      )}
      
      {loading && reviews.length === 0 && <div>Loading queue...</div>}
      
      {!loading && queue.length === 0 && (
        <div style={{ color: '#666', padding: '2rem', textAlign: 'center', border: '1px dashed #ccc', borderRadius: '8px' }}>
          The queue is empty. No leads require manual designation review.
        </div>
      )}

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {queue.map((item) => (
          <div key={item.id} style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1.5rem', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.25rem' }}>Review ID: {item.id}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                  {item.lead?.first_name || item.lead?.last_name 
                    ? `${item.lead?.first_name || ''} ${item.lead?.last_name || ''}`.trim()
                    : `Lead ID: ${item.lead_id}`}
                </div>
                <div style={{ color: '#555', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  {item.lead?.email && <div style={{ marginBottom: '0.25rem' }}>Email: {item.lead.email}</div>}
                  {item.lead?.phone && <div>Phone: {item.lead.phone}</div>}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', color: '#999' }}>
                  Review Created: {item.created_at ? new Date(item.created_at).toLocaleString() : 'N/A'}
                </div>
                <div style={{ marginTop: '0.75rem' }}>
                  <Link 
                    to={`/admin/leads/${item.lead_id}`} 
                    style={{ 
                      display: 'inline-block',
                      padding: '0.4rem 0.8rem',
                      fontSize: '0.85rem',
                      color: '#0c4c54',
                      textDecoration: 'none',
                      border: '1px solid #0c4c54',
                      borderRadius: '4px'
                    }}
                  >
                    View Lead Details
                  </Link>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem', background: '#f9f9f9', padding: '1rem', borderRadius: '6px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#666', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Reason Code</label>
                <div style={{ fontSize: '0.9rem', color: '#333' }}>{item.reason_code || 'N/A'}</div>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#666', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Lead ZIP</label>
                <div style={{ fontSize: '0.9rem', color: '#333' }}>{item.lead_zip || 'N/A'}</div>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#666', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Internal Notes</label>
                <textarea 
                  value={notesByReviewId[item.id] || ''}
                  onChange={(e) => setNotesByReviewId(prev => ({ ...prev, [item.id]: e.target.value }))}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #ccc', minHeight: '60px', boxSizing: 'border-box' }}
                  placeholder="Notes for this assignment..."
                />
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <select
                  value={selectedPracticeByReviewId[item.id] || ''}
                  onChange={(e) => setSelectedPracticeByReviewId((prev) => ({ ...prev, [item.id]: e.target.value }))}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '0.95rem' }}
                  disabled={assigningByReviewId[item.id]}
                >
                  <option value="">Select practice to assign...</option>
                  {practices.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <button 
                onClick={() => assign(item.id)}
                disabled={!selectedPracticeByReviewId[item.id] || assigningByReviewId[item.id]}
                style={{ 
                  padding: '0.65rem 2rem', 
                  background: '#0c4c54', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.95rem',
                  opacity: (!selectedPracticeByReviewId[item.id] || assigningByReviewId[item.id]) ? 0.5 : 1,
                  transition: 'opacity 0.2s'
                }}
              >
                {assigningByReviewId[item.id] ? 'Assigning...' : 'Assign Lead'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
