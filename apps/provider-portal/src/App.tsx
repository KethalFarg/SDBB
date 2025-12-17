import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Availability } from './pages/Availability';
import { Leads } from './pages/Leads';
import { LeadDetail } from './pages/LeadDetail';
import { Appointments } from './pages/Appointments';
import { supabase } from './supabaseClient';
import { useSession } from './hooks/useSession';

function Layout({ children }: { children: React.ReactNode }) {
  const { session } = useSession();
  const location = useLocation();
  const [practiceName, setPracticeName] = useState<string | null>(null);
  const [loadingPractice, setLoadingPractice] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) return;

    async function fetchPractice() {
      setLoadingPractice(true);
      try {
        const { data, error } = await supabase
          .from('practice_users')
          .select('practices(name)')
          .eq('user_id', session.user.id)
          .limit(1);

        if (error) throw error;
        const name = (data?.[0]?.practices as any)?.name;
        setPracticeName(name || null);
      } catch (err) {
        console.error('Error fetching sidebar practice info:', err);
      } finally {
        setLoadingPractice(false);
      }
    }

    fetchPractice();
  }, [session]);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="brand-title">Spinal</h1>
          <span className="brand-subtitle">Provider Portal</span>
        </div>
        
        <nav className="nav-menu">
          <Link 
            to="/dashboard" 
            className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
          >
            Dashboard
          </Link>
          <Link 
            to="/leads" 
            className={`nav-link ${isActive('/leads') ? 'active' : ''}`}
          >
            Leads
          </Link>
          <Link 
            to="/appointments" 
            className={`nav-link ${isActive('/appointments') ? 'active' : ''}`}
          >
            Appointments
          </Link>
          <Link 
            to="/availability" 
            className={`nav-link ${isActive('/availability') ? 'active' : ''}`}
          >
            Availability
          </Link>
        </nav>

        <div className="sidebar-footer">
          {session && (
            <>
              <div className="user-info">
                <span className="user-email">{session.user.email}</span>
                {loadingPractice ? (
                  <span className="user-practice" style={{ opacity: 0.5 }}>Loading...</span>
                ) : practiceName ? (
                  <span className="user-practice">Practice: {practiceName}</span>
                ) : (
                  <span className="no-practice-pill">No practice linked</span>
                )}
              </div>
              <button className="btn btn-outline" style={{ width: '100%', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }} onClick={logout}>
                Logout
              </button>
            </>
          )}
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/leads"
          element={
            <ProtectedRoute>
              <Layout>
                <Leads />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/leads/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <LeadDetail />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments"
          element={
            <ProtectedRoute>
              <Layout>
                <Appointments />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/availability"
          element={
            <ProtectedRoute>
              <Layout>
                <Availability />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

