import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const { error } = await (supabase.auth.signInWithPassword({
      email,
      password,
    }) as Promise<any>);

    if (error) {
      setError(error.message);
    } else {
      navigate('/admin/map');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f5f7fb' }}>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '350px', padding: '2.5rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          <img 
            src="https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/e256c45d-65cb-4415-95c8-e98f47e66e00/public" 
            alt="Logo" 
            style={{ height: '70px', width: 'auto' }}
          />
        </div>
        {error && <div style={{ color: '#e53e3e', backgroundColor: '#fff5f5', padding: '0.75rem', borderRadius: '6px', fontSize: '0.9rem', textAlign: 'center', border: '1px solid #fed7d7' }}>{error}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4a5568' }}>Email Address</label>
          <input 
            type="email" 
            placeholder="admin@example.com" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '1rem' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4a5568' }}>Password</label>
          <input 
            type="password" 
            placeholder="••••••••" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '1rem' }}
          />
        </div>
        <button 
          type="submit"
          style={{ 
            padding: '0.75rem', 
            borderRadius: '6px', 
            border: 'none', 
            backgroundColor: '#0998b2', 
            color: 'white', 
            fontSize: '1rem', 
            fontWeight: 600, 
            cursor: 'pointer',
            marginTop: '0.5rem',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#077a8f'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0998b2'}
        >
          Sign In
        </button>
      </form>
    </div>
  );
}

