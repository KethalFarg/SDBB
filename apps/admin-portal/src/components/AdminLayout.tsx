import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[AdminLayout] Session check:', session?.user?.email);
      setUserEmail(session?.user?.email || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div style={{ display: 'flex', height: '100vh', flexDirection: 'column', fontFamily: 'sans-serif' }}>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '0.75rem 1.5rem', 
        background: '#0c4c54', 
        color: 'white' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>SD Admin</h2>
          <nav style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => navigate('/admin/dashboard')}
              style={{ 
                background: isActive('/admin/dashboard') ? 'rgba(255,255,255,0.2)' : 'transparent',
                border: 'none', color: 'white', padding: '0.5rem 1rem', cursor: 'pointer', borderRadius: '4px'
              }}
            >
              Dashboard
            </button>
            <button 
              onClick={() => navigate('/admin/map')}
              style={{ 
                background: isActive('/admin/map') ? 'rgba(255,255,255,0.2)' : 'transparent',
                border: 'none', color: 'white', padding: '0.5rem 1rem', cursor: 'pointer', borderRadius: '4px'
              }}
            >
              Map
            </button>
            <button 
              onClick={() => navigate('/admin/onboarding')}
              style={{ 
                background: isActive('/admin/onboarding') ? 'rgba(255,255,255,0.2)' : 'transparent',
                border: 'none', color: 'white', padding: '0.5rem 1rem', cursor: 'pointer', borderRadius: '4px'
              }}
            >
              Onboarding
            </button>
            <button 
              onClick={() => navigate('/admin/leads')}
              style={{ 
                background: isActive('/admin/leads') ? 'rgba(255,255,255,0.2)' : 'transparent',
                border: 'none', color: 'white', padding: '0.5rem 1rem', cursor: 'pointer', borderRadius: '4px'
              }}
            >
              Leads
            </button>
            <button 
              onClick={() => navigate('/admin/bookings')}
              style={{ 
                background: isActive('/admin/bookings') ? 'rgba(255,255,255,0.2)' : 'transparent',
                border: 'none', color: 'white', padding: '0.5rem 1rem', cursor: 'pointer', borderRadius: '4px'
              }}
            >
              Bookings
            </button>

            <button 
              onClick={() => navigate('/admin/messages')}
              style={{ 
                background: isActive('/admin/messages') ? 'rgba(255,255,255,0.2)' : 'transparent',
                border: 'none', color: 'white', padding: '0.5rem 1rem', cursor: 'pointer', borderRadius: '4px'
              }}
            >
              Messages (Beta)
            </button>

            <button 
              onClick={() => navigate('/admin/designation-review')}
              style={{ 
                background: isActive('/admin/designation-review') ? 'rgba(255,255,255,0.2)' : 'transparent',
                border: 'none', color: 'white', padding: '0.5rem 1rem', cursor: 'pointer', borderRadius: '4px'
              }}
            >
              Reviews
            </button>
          </nav>
        </div>
        <button 
          onClick={() => (supabase.auth.signOut() as Promise<any>).then(() => navigate('/login'))}
          style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.5)', color: 'white', padding: '0.4rem 0.8rem', cursor: 'pointer', borderRadius: '4px' }}
        >
          Logout
        </button>
      </header>
      <main style={{ flex: 1, overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}

