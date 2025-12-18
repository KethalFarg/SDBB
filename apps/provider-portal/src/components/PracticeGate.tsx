import React from 'react';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { PageShell } from './PageShell';
import { EmptyState } from './EmptyState';

interface PracticeGateProps {
  practice: { name?: string; status?: string } | null;
  loading: boolean;
  error: string | null;
  children: React.ReactNode;
}

export function PracticeGate({ practice, loading, error, children }: PracticeGateProps) {
  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!practice) {
    return (
      <PageShell title="Access Restricted">
        <EmptyState 
          title="No Practice Assigned" 
          description="Your account isn't linked to a practice yet. Please contact support." 
        />
      </PageShell>
    );
  }

  if (practice.status === 'pending') {
    return (
      <PageShell title="Practice Pending Activation">
        <div className="card" style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center', padding: '3rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Activation Required</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', lineHeight: '1.6' }}>
            Your practice account <strong>{practice.name}</strong> has been created, but it hasn't been activated yet. 
            Please contact support or wait for an admin to activate your practice.
          </p>
        </div>
      </PageShell>
    );
  }

  if (practice.status === 'paused') {
    return (
      <PageShell title="Practice Paused">
        <div className="card" style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center', padding: '3rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Account Paused</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', lineHeight: '1.6' }}>
            Your practice <strong>{practice.name}</strong> is currently paused. Please contact support.
          </p>
        </div>
      </PageShell>
    );
  }

  if (practice.status !== 'active') {
    return (
      <PageShell title="Access Restricted">
        <EmptyState 
          title="Restricted Access" 
          description={`Your practice status is '${practice.status}'. Please contact support.`} 
        />
      </PageShell>
    );
  }

  return <>{children}</>;
}

