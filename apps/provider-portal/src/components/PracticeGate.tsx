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
      <PageShell title="Account Pending Setup">
        <div className="card" style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', padding: '4rem 3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>⏳</div>
          <h2 style={{ marginBottom: '1rem', color: 'var(--color-text-main)' }}>Your account is created!</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
            However, your profile is not yet linked to a clinic. Please contact support to complete your practice registration.
          </p>
          <div style={{ paddingTop: '2rem', borderTop: '1px solid var(--color-border)' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-light)' }}>
              Once linked, you'll be able to manage leads, availability, and bookings here.
            </p>
          </div>
        </div>
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

