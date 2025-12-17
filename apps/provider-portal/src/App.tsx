import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Leads } from './pages/Leads';
import { LeadDetail } from './pages/LeadDetail';
import { Appointments } from './pages/Appointments';
import { supabase } from './supabaseClient';
import { useSession } from './hooks/useSession';

function Layout({ children }: { children: React.ReactNode }) {
  const { session } = useSession();
  const location = useLocation();

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
        </nav>

        <div className="sidebar-footer">
          {session && (
            <button className="btn btn-outline" style={{ width: '100%', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }} onClick={logout}>
              Logout
            </button>
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
        <Route path="*" element={<Navigate to="/leads" />} />
      </Routes>
    </Router>
  );
}

