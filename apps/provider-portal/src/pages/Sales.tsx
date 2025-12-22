import { useEffect, useState } from 'react';
import { PageShell } from '../components/PageShell';
import { EmptyState } from '../components/EmptyState';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { DataTable } from '../components/DataTable';
import { StatusPill } from '../components/StatusPill';
import { supabase } from '../supabaseClient';
import { usePracticeId } from '../hooks/usePracticeId';
import { Link } from 'react-router-dom';

export function Sales() {
  const { practiceId, loading: loadingPractice } = usePracticeId();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!practiceId) return;
    fetchAppointments();
  }, [practiceId]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          start_time,
          status,
          sales_outcome,
          objection,
          lead_id,
          leads (
            first_name,
            last_name
          )
        `)
        .eq('practice_id', practiceId)
        .neq('status', 'canceled')
        .order('start_time', { ascending: false });

      if (error) throw error;

      // Deduplicate by lead_id, keeping the latest one (first in descending order)
      const seenLeads = new Set();
      const deduped = (data || []).filter(appt => {
        if (!appt.lead_id) return true; // Keep if no lead_id (shouldn't happen)
        if (seenLeads.has(appt.lead_id)) return false;
        seenLeads.add(appt.lead_id);
        return true;
      });

      setAppointments(deduped);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateOutcome = async (id: string, outcome: string) => {
    let objection = '';
    if (outcome === 'lost') {
      objection = window.prompt('Please enter the reason/objection for the lost sale:') || '';
      if (!objection) {
        alert('An objection is required for lost sales.');
        return;
      }
    }

    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ 
          sales_outcome: outcome,
          objection: outcome === 'lost' ? objection : null,
          status: outcome === 'won' ? 'show' : undefined // Suggesting 'show' if 'won'
        })
        .eq('id', id);

      if (error) throw error;
      await fetchAppointments();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      await fetchAppointments();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loadingPractice || loading) return <LoadingState />;
  if (error) return <ErrorState message={error} retry={fetchAppointments} />;

  if (!practiceId) {
    return (
      <PageShell title="Sales & Outcomes">
        <EmptyState 
          title="No Practice Assigned" 
          description="No practice assigned to this account. Contact support." 
        />
      </PageShell>
    );
  }

  return (
    <PageShell 
      title="Sales & Outcomes" 
      subtitle="Track appointment show rates and closing outcomes"
      actions={
        <button onClick={fetchAppointments} className="btn btn-outline btn-sm">Refresh</button>
      }
    >
      <DataTable 
        headers={['Date', 'Patient', 'Status', 'Outcome', 'Actions']} 
        empty={appointments.length === 0}
        onEmpty={
          <EmptyState 
            title="No appointments yet" 
            description="Once you have scheduled appointments, you can track their outcomes here."
          />
        }
      >
        {appointments.map((appt) => (
          <tr key={appt.id}>
            <td>{new Date(appt.start_time).toLocaleDateString()}</td>
            <td style={{ fontWeight: 600 }}>
              {appt.leads ? `${appt.leads.first_name ?? ''} ${appt.leads.last_name ?? ''}`.trim() : 'N/A'}
            </td>
            <td>
              <select 
                value={appt.status} 
                onChange={(e) => updateStatus(appt.id, e.target.value)}
                disabled={updatingId === appt.id}
                className="input-sm"
                style={{ width: '120px' }}
              >
                <option value="scheduled">Scheduled</option>
                <option value="show">Show</option>
                <option value="no_show">No Show</option>
                <option value="canceled">Canceled</option>
                <option value="pending">Pending</option>
              </select>
            </td>
            <td>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <StatusPill status={appt.sales_outcome || 'pending'} />
                {appt.objection && (
                  <span title={appt.objection} style={{ cursor: 'help', fontSize: '1.2rem' }}>💬</span>
                )}
              </div>
            </td>
            <td>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => updateOutcome(appt.id, 'won')}
                  className="btn btn-primary btn-sm"
                  disabled={updatingId === appt.id || appt.sales_outcome === 'won'}
                >
                  Won
                </button>
                <button 
                  onClick={() => updateOutcome(appt.id, 'lost')}
                  className="btn btn-outline btn-sm"
                  disabled={updatingId === appt.id || appt.sales_outcome === 'lost'}
                >
                  Lost
                </button>
                <Link to={`/leads/${appt.lead_id}`} className="btn btn-outline btn-sm">Lead</Link>
              </div>
            </td>
          </tr>
        ))}
      </DataTable>
    </PageShell>
  );
}

