import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

export function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ marginBottom: '1rem' }}>Check your email</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
              We've sent a confirmation link to <strong>{email}</strong>. Please verify your email to continue.
            </p>
            <Link to="/login" className="btn btn-primary" style={{ display: 'inline-block' }}>
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img 
            src="https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/fdd5f772-73a3-4208-fd11-f03e2a90eb00/public" 
            alt="Logo" 
            style={{ width: '180px', marginBottom: '1.5rem' }} 
          />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Create Provider Account</h2>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>Join the Spinal Decompression network</p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', color: '#991b1b', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              className="form-control" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              placeholder="e.g. doctor@clinic.com"
            />
          </div>
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label>Password</label>
            <input 
              type="password" 
              className="form-control" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              placeholder="Min. 6 characters"
              minLength={6}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--color-text-muted)' }}>Already have an account? </span>
          <Link to="/login" style={{ fontWeight: 600 }}>Log In</Link>
        </div>
      </div>
    </div>
  );
}



