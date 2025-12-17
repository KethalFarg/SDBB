import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Leads } from './pages/Leads';
import { LeadDetail } from './pages/LeadDetail';
import { Appointments } from './pages/Appointments';
import { supabase } from './supabaseClient';
import { useSession } from './hooks/useSession';

function Layout({ children }: { children: React.ReactNode }) {
  const { session } = useSession();

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="layout">
      <div className="sidebar">
        <div className="nav-section">
          <h3>Provider Portal</h3>
        </div>
        <div className="nav-section">
          <div><Link to="/leads">Leads</Link></div>
          <div><Link to="/appointments">Appointments</Link></div>
        </div>
        {session && (
          <div className="nav-section">
            <button onClick={logout}>Logout</button>
          </div>
        )}
      </div>
      <div className="content">
        {children}
      </div>
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

