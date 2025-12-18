import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { AdminMap } from './pages/AdminMap';
import { DesignationReview } from './pages/DesignationReview';
import { LeadDetail } from './pages/LeadDetail';
import { LeadsList } from './pages/LeadsList';
import { PracticeOnboarding } from './pages/PracticeOnboarding';
import { PracticeAccess } from './pages/PracticeAccess';
import { supabase } from './lib/supabase';
import { AdminLayout } from './components/AdminLayout';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }: { data: { session: any } }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading session...</div>;
  if (!session) return <Navigate to="/login" />;
  return <AdminLayout>{children}</AdminLayout>;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin/map" element={
          <PrivateRoute>
            <AdminMap />
          </PrivateRoute>
        } />
        <Route path="/admin/leads" element={
          <PrivateRoute>
            <LeadsList />
          </PrivateRoute>
        } />
        <Route path="/admin/onboarding" element={
          <PrivateRoute>
            <PracticeOnboarding />
          </PrivateRoute>
        } />
        <Route path="/admin/onboarding/:id" element={
          <PrivateRoute>
            <PracticeOnboarding />
          </PrivateRoute>
        } />
        <Route path="/admin/onboarding/:id/access" element={
          <PrivateRoute>
            <PracticeAccess />
          </PrivateRoute>
        } />
        <Route path="/admin/designation-review" element={
          <PrivateRoute>
            <DesignationReview />
          </PrivateRoute>
        } />
        <Route path="/admin/leads/:id" element={
          <PrivateRoute>
            <LeadDetail />
          </PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/admin/map" />} />
      </Routes>
    </Router>
  );
}
