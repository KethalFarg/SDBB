import React from 'react';

export function Appointments() {
  return (
    <div>
      <h2 style={{ marginBottom: '2rem' }}>Appointments</h2>
      <div className="card" style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--color-text-muted)' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗓️</div>
        <h3>Appointments Management Coming Soon</h3>
        <p style={{ maxWidth: '400px', margin: '0 auto' }}>
          We are currently finalizing the booking integration. You will soon be able to manage all your patient appointments directly from this portal.
        </p>
      </div>
    </div>
  );
}

