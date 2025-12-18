import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useSession } from '../hooks/useSession';
import { usePracticeId } from '../hooks/usePracticeId';

type Appointment = {
  id: string;
  lead_id: string;
  start_time: string;
  end_time: string;
  status: string;
  sales_outcome: string | null;
  source: string;
  created_at: string;
  expires_at: string | null;
  leads: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
};

export function Appointments() {
  const { session } = useSession();
  const { practiceId, loading: loadingPractice, error: practiceError } = usePracticeId();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');

  useEffect(() => {
    if (!practiceId) return;
    fetchAppointments();
  }, [practiceId]);

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      // RLS ensures we only get appointments for the user's practice
      // but we filter explicitly by practiceId for robustness.
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id, 
          lead_id, 
          start_time, 
          end_time, 
          status, 
          sales_outcome, 
          source, 
          created_at,
          expires_at,
          leads (
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .eq('practice_id', practiceId)
        .in('status', ['scheduled', 'hold', 'show', 'no_show', 'pending', 'canceled'])
        .order('start_time', { ascending: true }) // Upcoming first
        .limit(200);

      if (error) throw error;
      setAppointments((data as any) || []);
    } catch (err: any) {
      setError(err.message || 'Error loading appointments');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const now = new Date();
    // Filter out expired holds first
    const activeOnly = appointments.filter((a) => {
      if (a.status === 'hold') {
        if (!a.expires_at) return true; // Shouldn't happen with holds but be safe
        return new Date(a.expires_at) > now;
      }
      return true; // scheduled/canceled/etc always show
    });

    const term = q.trim().toLowerCase();
    if (!term) return activeOnly;
    return activeOnly.filter((a) => {
      const patientName = `${a.leads?.first_name ?? ''} ${a.leads?.last_name ?? ''}`.toLowerCase();
      const patientContact = `${a.leads?.email ?? ''} ${a.leads?.phone ?? ''}`.toLowerCase();
      return (
        a.id.toLowerCase().includes(term) ||
        a.lead_id.toLowerCase().includes(term) ||
        a.status.toLowerCase().includes(term) ||
        a.source.toLowerCase().includes(term) ||
        patientName.includes(term) ||
        patientContact.includes(term)
      );
    });
  }, [q, appointments]);

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(dateStr));
  };

  const formatTimeRange = (start: string, end: string) => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return `${formatter.format(new Date(start))} - ${formatter.format(new Date(end))}`;
  };

  const getStatusPill = (status: string) => {
    const s = status.toLowerCase();
    let className = 'status-pill ';
    if (s === 'scheduled' || s === 'confirmed' || s === 'show') className += 'status-assigned';
    else if (s === 'pending') className += 'status-review';
    else if (s === 'canceled' || s === 'no_show') className += 'status-no-coverage';
    else if (s === 'hold') className += 'status-new';
    else className += 'status-new';

    const label = s === 'hold' ? 'Hold' : status.replace('_', ' ');
    return <span className={className}>{label}</span>;
  };

  const getSourceLabel = (source: string) => {
    return source.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (!session) return <div className="main-content">Loading session...</div>;
  
  if (loadingPractice) return <div className="main-content">Verifying practice...</div>;

  if (!practiceId) {
    return (
      <div className="main-content">
        <div className="card" style={{ color: '#92400e', backgroundColor: '#fffbeb', border: '1px solid #fef3c7' }}>
          Your account isn’t linked to a practice yet. Please contact support.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Appointments</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            onClick={fetchAppointments} 
            className="btn btn-outline btn-sm"
            disabled={loading}
          >
            Refresh
          </button>
          <input
            type="text"
            className="input-search"
            placeholder="Search appointments..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      {(error || practiceError) && (
        <div className="card" style={{ color: '#991b1b', backgroundColor: '#fef2f2', border: '1px solid #fee2e2' }}>
          {error || practiceError}
          <div style={{ marginTop: '0.5rem' }}>
            <button onClick={fetchAppointments} className="btn btn-outline btn-sm">Try refresh</button>
          </div>
        </div>
      )}

      {loading && <div style={{ textAlign: 'center', padding: '3rem' }}>Loading appointments...</div>}

      {!loading && !error && filtered.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
          {appointments.length === 0 ? 'No scheduled appointments yet.' : 'No appointments found matching your search.'}
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Patient</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Source</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((appt) => (
                  <tr key={appt.id}>
                    <td>{formatDate(appt.start_time)}</td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
                      {formatTimeRange(appt.start_time, appt.end_time)}
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {appt.leads ? `${appt.leads.first_name ?? ''} ${appt.leads.last_name ?? ''}`.trim() : 'N/A'}
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                      {appt.leads?.email}<br/>{appt.leads?.phone}
                    </td>
                    <td>
                      {getStatusPill(appt.status)}
                      {appt.status === 'hold' && appt.expires_at && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-coral)', marginTop: '0.25rem', fontWeight: 600 }}>
                          Expires: {new Date(appt.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                        {getSourceLabel(appt.source)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/leads/${appt.lead_id}`} className="btn btn-outline btn-sm">
                        View Lead
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
