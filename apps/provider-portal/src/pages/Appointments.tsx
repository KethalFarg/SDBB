import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useSession } from '../hooks/useSession';

type Appointment = {
  id: string;
  lead_id: string;
  start_time: string;
  end_time: string;
  status: string;
  sales_outcome: string | null;
  source: string;
  created_at: string;
  leads: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
};

export function Appointments() {
  const { session } = useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');

  useEffect(() => {
    if (!session) return;
    fetchAppointments();
  }, [session]);

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      // RLS ensures we only get appointments for the user's practice
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
          leads (
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .order('start_time', { ascending: false })
        .limit(100);

      if (error) throw error;
      setAppointments((data as any) || []);
    } catch (err: any) {
      setError(err.message || 'Error loading appointments');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return appointments;
    return appointments.filter((a) => {
      const patientName = `${a.leads?.first_name ?? ''} ${a.leads?.last_name ?? ''}`.toLowerCase();
      return (
        a.id.toLowerCase().includes(term) ||
        a.lead_id.toLowerCase().includes(term) ||
        a.status.toLowerCase().includes(term) ||
        a.source.toLowerCase().includes(term) ||
        patientName.includes(term)
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
    else className += 'status-new';

    return <span className={className}>{status.replace('_', ' ')}</span>;
  };

  const getSourceLabel = (source: string) => {
    return source.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (!session) return <div className="main-content">Loading session...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Appointments</h2>
        <input
          type="text"
          className="input-search"
          placeholder="Search appointments..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {error && (
        <div className="card" style={{ color: '#991b1b', backgroundColor: '#fef2f2', border: '1px solid #fee2e2' }}>
          {error}
        </div>
      )}

      {loading && <div style={{ textAlign: 'center', padding: '3rem' }}>Loading appointments...</div>}

      {!loading && filtered.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
          {appointments.length === 0 ? 'No appointments scheduled yet.' : 'No appointments found matching your search.'}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Patient</th>
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
                    <td>{getStatusPill(appt.status)}</td>
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
