import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, envMissing } from '../supabaseClient';
import { useSession } from '../hooks/useSession';

export function Login() {
  const navigate = useNavigate();
  const { session } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (session) {
    navigate('/dashboard');
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      navigate('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="brand-title" style={{ fontSize: '2rem', color: 'var(--color-primary)' }}>Spinal</h1>
          <span className="brand-subtitle" style={{ fontSize: '0.875rem' }}>Provider Access</span>
        </div>

        <form onSubmit={onSubmit}>
          {envMissing && (
            <div className="card" style={{ color: '#991b1b', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', padding: '1rem', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              ⚠️ Missing Configuration. Please contact system administrator.
            </div>
          )}
          
          {error && (
            <div className="card" style={{ color: '#991b1b', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', padding: '1rem', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              className="form-control"
              placeholder="name@practice.com"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              className="form-control"
              placeholder="••••••••"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-lg" 
            disabled={loading} 
            style={{ width: '100%', marginTop: '1rem', padding: '0.875rem' }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
        
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            &copy; {new Date().getFullYear()} SpinalDecompression.com<br/>
            Secure Provider Portal
          </p>
        </div>
      </div>
    </div>
  );
}

