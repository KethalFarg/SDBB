import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const API_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api`;

export function PracticeAccess() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [practice, setPractice] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchPracticeAndUsers(id);
    }
  }, [id]);

  const fetchPracticeAndUsers = async (practiceId: string) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession() as { data: { session: any } };
      
      // 1. Fetch Practice Details
      const pRes = await fetch(`${API_BASE}/admin/practices`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      const pJson = await pRes.json();
      const found = pJson.data?.find((p: any) => p.id === practiceId);
      setPractice(found);

      // 2. Fetch Assigned Users
      const uRes = await fetch(`${API_BASE}/admin/practices/${practiceId}/users`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      const uJson = await uRes.json();
      setUsers(uJson.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setAdding(true);
    setError(null);
    setSuccess(null);

    try {
      const { data: { session } } = await supabase.auth.getSession() as { data: { session: any } };
      const res = await fetch(`${API_BASE}/admin/practices/${id}/users`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email.trim() })
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Failed to assign user');
      }

      setSuccess(`User ${email} assigned successfully`);
      setEmail('');
      fetchPracticeAndUsers(id!);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  if (loading && !practice) return <div style={{ padding: '2rem' }}>Loading access data...</div>;
  if (!practice && !loading) return <div style={{ padding: '2rem' }}>Practice not found.</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={() => navigate(`/admin/onboarding/${id}`)}
          style={{ background: 'transparent', border: 'none', color: '#0c4c54', cursor: 'pointer', padding: 0, fontSize: '0.9rem', marginBottom: '0.5rem' }}
        >
          &larr; Back to Practice Details
        </button>
        <h2 style={{ margin: 0 }}>Portal Access: {practice.name}</h2>
        <p style={{ color: '#666', marginTop: '0.5rem' }}>Manage which provider users can access this practice in the Provider Portal.</p>
      </div>

      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '2rem' }}>
        <h3 style={{ marginTop: 0, fontSize: '1.1rem' }}>Assign New User</h3>
        <form onSubmit={handleAddUser} style={{ display: 'flex', gap: '1rem' }}>
          <input 
            type="email" placeholder="provider@example.com" value={email} 
            onChange={e => setEmail(e.target.value)} required
            style={{ flex: 1, padding: '0.6rem', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <button 
            type="submit" disabled={adding}
            style={{ 
              padding: '0.6rem 1.5rem', background: '#0c4c54', color: 'white', 
              border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' 
            }}
          >
            {adding ? 'Assigning...' : 'Assign User'}
          </button>
        </form>
        {error && <p style={{ color: '#991b1b', fontSize: '0.9rem', marginTop: '1rem' }}>{error}</p>}
        {success && <p style={{ color: '#065f46', fontSize: '0.9rem', marginTop: '1rem' }}>{success}</p>}
      </div>

      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', border: '1px solid #ddd' }}>
        <h3 style={{ marginTop: 0, fontSize: '1.1rem', marginBottom: '1.5rem' }}>Current Assigned Users</h3>
        {users.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>No users assigned yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                <th style={{ padding: '0.75rem 0' }}>Email</th>
                <th style={{ padding: '0.75rem 0' }}>Role</th>
                <th style={{ padding: '0.75rem 0' }}>Assigned At</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.user_id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '0.75rem 0' }}>{u.email}</td>
                  <td style={{ padding: '0.75rem 0' }}><span style={{ background: '#e7f5ff', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>{u.role}</span></td>
                  <td style={{ padding: '0.75rem 0', fontSize: '0.85rem', color: '#666' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <button 
          onClick={() => navigate('/admin/map')}
          style={{ padding: '0.8rem 2rem', background: '#eee', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}
        >
          Done
        </button>
      </div>
    </div>
  );
}

