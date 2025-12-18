import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useSession } from '../hooks/useSession';
import { usePracticeId } from '../hooks/usePracticeId';
import { PageShell } from '../components/PageShell';
import { EmptyState } from '../components/EmptyState';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { DataTable } from '../components/DataTable';
import { StatusPill } from '../components/StatusPill';

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
        .order('start_time', { ascending: true })
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
    const activeOnly = appointments.filter((a) => {
      if (a.status === 'hold') {
        if (!a.expires_at) return true;
        return new Date(a.expires_at) > now;
      }
      return true;
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

  const getSourceLabel = (source: string) => {
    return source.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (!session || loadingPractice || loading) return <LoadingState />;
  if (error || practiceError) return <ErrorState message={error || practiceError || ''} retry={fetchAppointments} />;

  if (!practiceId) {
    return (
      <PageShell title="Appointments">
        <EmptyState 
          title="No Practice Assigned" 
          description="No practice assigned to this account. Contact support." 
        />
      </PageShell>
    );
  }

  return (
    <PageShell 
      title="Appointments" 
      subtitle="Scheduled and upcoming patient consultations"
      actions={
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input
            type="text"
            className="input-search input-sm"
            placeholder="Search appointments..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button onClick={fetchAppointments} className="btn btn-outline btn-sm">Refresh</button>
        </div>
      }
    >
      <DataTable 
        headers={['Date', 'Time', 'Patient', 'Status', 'Source', '']} 
        empty={filtered.length === 0}
        onEmpty={
          <EmptyState 
            title={appointments.length === 0 ? "No appointments yet" : "No results"} 
            description={appointments.length === 0 ? "When patients book time with you, they will appear here." : "Try a different search term."} 
            actionLabel={appointments.length === 0 ? "Manage Availability" : undefined}
            onAction={appointments.length === 0 ? () => {} : undefined} // TODO: Navigate to availability
          />
        }
      >
        {filtered.map((appt) => (
          <tr key={appt.id}>
            <td>{formatDate(appt.start_time)}</td>
            <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
              {formatTimeRange(appt.start_time, appt.end_time)}
            </td>
            <td style={{ fontWeight: 600 }}>
              {appt.leads ? `${appt.leads.first_name ?? ''} ${appt.leads.last_name ?? ''}`.trim() : 'N/A'}
            </td>
            <td>
              <StatusPill status={appt.status} />
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
      </DataTable>
    </PageShell>
  );
}
