import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const API_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api`;

export function PracticeAccess() {
  const { id } = useParams();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [practice, setPractice] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [highlightedEmail, setHighlightedEmail] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchPracticeAndUsers(id);
    }
    // Auto-focus on load
    inputRef.current?.focus();
  }, [id]);

  useEffect(() => {
    if (highlightedEmail) {
      const timer = setTimeout(() => {
        setHighlightedEmail(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [highlightedEmail]);

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
      const { data: userData, error: userError } = await supabase
        .from('practice_users_with_email')
        .select('practice_id,user_id,role,created_at,email')
        .eq('practice_id', practiceId)
        .order('created_at', { ascending: false });

      if (userError) throw userError;
      setUsers(userData || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setError(null);
    setSuccess(null);

    const normalizedEmail = email.trim().toLowerCase();
    
    // Basic Validation
    if (!normalizedEmail) {
      setFormError('Email is required');
      return;
    }

    // "must contain exactly one @" and "must have at least one "." after the "@""
    const parts = normalizedEmail.split('@');
    if (parts.length !== 2) {
      setFormError('Email must contain exactly one "@"');
      return;
    }
    if (!parts[1].includes('.')) {
      setFormError('Email must have at least one "." after the "@"');
      return;
    }

    setAdding(true);

    try {
      const { data: { session } } = await supabase.auth.getSession() as { data: { session: any } };
      const res = await fetch(`${API_BASE}/admin/practices/${id}/users`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: normalizedEmail })
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Failed to assign user');
      }

      // Handle success (including idempotent "already linked" case)
      setSuccess(json.message || `User ${normalizedEmail} assigned successfully.`);
      setHighlightedEmail(normalizedEmail);
      setEmail('');
      await fetchPracticeAndUsers(id!);
      
      // Re-focus after success
      inputRef.current?.focus();
    } catch (err: any) {
      setError(err.message || 'Failed to assign user. Please try again.');
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
        <h3 style={{ marginTop: 0, fontSize: '1.1rem', marginBottom: '1.5rem' }}>Assign New User</h3>
        
        {success && (
          <div style={{ color: '#155724', background: '#d4edda', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem', border: '1px solid #c3e6cb' }}>
            {success}
          </div>
        )}

        {error && (
          <div style={{ color: '#d32f2f', background: '#fdecea', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem', border: '1px solid #f5c6cb' }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        <form onSubmit={handleAddUser}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <input 
                ref={inputRef}
                type="text" 
                placeholder="provider@example.com" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                disabled={adding}
                style={{ 
                  width: '100%', 
                  padding: '0.6rem', 
                  border: `1px solid ${formError ? '#d32f2f' : '#ddd'}`, 
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }}
              />
              {formError && <p style={{ color: '#d32f2f', fontSize: '0.8rem', marginTop: '0.25rem', marginBottom: 0 }}>{formError}</p>}
            </div>
            <button 
              type="submit" 
              disabled={adding}
              style={{ 
                padding: '0.6rem 1.5rem', 
                background: '#0c4c54', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                fontWeight: 'bold', 
                cursor: adding ? 'not-allowed' : 'pointer',
                height: 'fit-content',
                opacity: adding ? 0.7 : 1
              }}
            >
              {adding ? 'Assigning...' : 'Assign User'}
            </button>
          </div>
        </form>
      </div>

      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', border: '1px solid #ddd' }}>
        <h3 style={{ marginTop: 0, fontSize: '1.1rem', marginBottom: '1.5rem' }}>Current Assigned Users</h3>
        {users.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>No users assigned yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Email</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Role</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Assigned At</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const isHighlighted = highlightedEmail === u.email?.toLowerCase();
                  return (
                    <tr 
                      key={u.user_id} 
                      style={{ 
                        borderBottom: '1px solid #eee',
                        backgroundColor: isHighlighted ? '#f0fff4' : 'transparent',
                        transition: 'background-color 0.5s ease'
                      }}
                    >
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: isHighlighted ? 'bold' : 'normal' }}>
                        {u.email || u.user_id}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <span style={{ background: '#e7f5ff', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', color: '#666' }}>
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <button 
          onClick={() => navigate(`/admin/onboarding/${id}`)}
          style={{ padding: '0.8rem 2rem', background: '#eee', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
        >
          Done
        </button>
      </div>
    </div>
  );
}
