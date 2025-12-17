import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSession } from '../hooks/useSession';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useSession();

  if (loading) return <div>Loading...</div>;
  if (!session) return <Navigate to="/login" />;
  return <>{children}</>;
}

