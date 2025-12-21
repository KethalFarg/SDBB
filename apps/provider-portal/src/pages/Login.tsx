import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (session) {
      navigate('/dashboard');
    }
  }, [session, navigate]);

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
          <img 
            src="https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/fdd5f772-73a3-4208-fd11-f03e2a90eb00/public" 
            alt="Spinal Decompression" 
          />
          <span className="brand-subtitle">Provider Access</span>
        </div>

        <form onSubmit={onSubmit}>
          {envMissing && (
            <div style={{ color: '#991b1b', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', padding: '1rem', fontSize: '0.8125rem', marginBottom: '1.5rem', borderRadius: '4px' }}>
              ⚠️ Missing Configuration. Please contact system administrator.
            </div>
          )}
          
          {error && (
            <div style={{ color: '#991b1b', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', padding: '1rem', fontSize: '0.8125rem', marginBottom: '1.5rem', borderRadius: '4px' }}>
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
            className="btn btn-primary" 
            disabled={loading} 
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.875rem' }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
        
        <div className="login-footer">
          &copy; {new Date().getFullYear()} SpinalDecompression.com
          <span className="login-footer-link">Secure Provider Portal</span>
        </div>
      </div>
    </div>
  );
}

