import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useSession } from '../hooks/useSession';
import { usePracticeId } from '../hooks/usePracticeId';
import { PageShell } from '../components/PageShell';
import { EmptyState } from '../components/EmptyState';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { DataTable } from '../components/DataTable';

export function Dashboard() {
  const { session } = useSession();
  const { practiceId, loading: loadingPractice, error: practiceError } = usePracticeId();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    leads7d: 0,
    leadsTotal: 0,
    apptsUpcoming: 0,
    apptsTotal: 0,
  });
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [upcomingAppts, setUpcomingAppts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!practiceId) return;
    fetchDashboardData();
  }, [practiceId]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    const now = new Date().toISOString();
    const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    try {
      const [
        leads7dRes,
        leadsTotalRes,
        apptsUpcomingRes,
        apptsTotalRes,
        recentLeadsRes,
        upcomingApptsRes
      ] = await Promise.all([
        supabase.from('leads').select('id', { count: 'exact', head: true }).eq('practice_id', practiceId).gte('created_at', since7d),
        supabase.from('leads').select('id', { count: 'exact', head: true }).eq('practice_id', practiceId),
        supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('practice_id', practiceId).gte('start_time', now).eq('status', 'scheduled'),
        supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('practice_id', practiceId),
        supabase.from('leads').select('id, created_at, first_name, last_name, email, phone, zip').eq('practice_id', practiceId).order('created_at', { ascending: false }).limit(5),
        supabase.from('appointments').select('id, lead_id, start_time, status, source, leads(first_name, last_name)').eq('practice_id', practiceId).gte('start_time', now).order('start_time', { ascending: true }).limit(5)
      ]);

      if (leads7dRes.error) throw leads7dRes.error;
      if (leadsTotalRes.error) throw leadsTotalRes.error;
      if (apptsUpcomingRes.error) throw apptsUpcomingRes.error;
      if (apptsTotalRes.error) throw apptsTotalRes.error;
      if (recentLeadsRes.error) throw recentLeadsRes.error;
      if (upcomingApptsRes.error) throw upcomingApptsRes.error;

      setStats({
        leads7d: leads7dRes.count || 0,
        leadsTotal: leadsTotalRes.count || 0,
        apptsUpcoming: apptsUpcomingRes.count || 0,
        apptsTotal: apptsTotalRes.count || 0,
      });
      setRecentLeads(recentLeadsRes.data || []);
      setUpcomingAppts(upcomingApptsRes.data || []);

    } catch (err: any) {
      console.error('Dashboard load error:', err);
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateStr: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(dateStr));
  };

  if (!session || loadingPractice || (loading && !stats.leadsTotal)) return <LoadingState />;
  if (error || practiceError) return <ErrorState message={error || practiceError || ''} retry={fetchDashboardData} />;

  if (!practiceId) {
    return (
      <PageShell title="Dashboard">
        <EmptyState 
          title="No Practice Assigned" 
          description="No practice assigned to this account. Contact support." 
        />
      </PageShell>
    );
  }

  return (
    <PageShell 
      title="Practice Overview" 
      subtitle="Welcome back. Here is what is happening with your practice."
      actions={
        <button onClick={fetchDashboardData} className="btn btn-outline btn-sm" disabled={loading}>Refresh</button>
      }
    >
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">New Leads (7d)</span>
          <span className="stat-value">{stats.leads7d}</span>
          <span className="stat-subtext">Recent inquiries</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Leads</span>
          <span className="stat-value">{stats.leadsTotal}</span>
          <span className="stat-subtext">Lifetime total</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Upcoming Appts</span>
          <span className="stat-value">{stats.apptsUpcoming}</span>
          <span className="stat-subtext">Scheduled & confirmed</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Appts</span>
          <span className="stat-value">{stats.apptsTotal}</span>
          <span className="stat-subtext">All appointments</span>
        </div>
      </div>

      <div className="dashboard-sections">
        {/* Recent Leads */}
        <div className="card" style={{ padding: '1.5rem 0' }}>
          <div className="section-header" style={{ padding: '0 1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Recent Leads</h3>
            <Link to="/leads" style={{ fontSize: '0.875rem', fontWeight: 600 }}>View All &rarr;</Link>
          </div>
          
          <DataTable 
            headers={['Name', 'ZIP', 'Date', '']} 
            empty={recentLeads.length === 0}
            onEmpty={<div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-light)' }}>No leads yet.</div>}
          >
            {recentLeads.map(lead => (
              <tr key={lead.id}>
                <td style={{ fontWeight: 600 }}>{lead.first_name} {lead.last_name}</td>
                <td>{lead.zip}</td>
                <td style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                  {new Date(lead.created_at).toLocaleDateString()}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <Link to={`/leads/${lead.id}`} style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Details</Link>
                </td>
              </tr>
            ))}
          </DataTable>
        </div>

        {/* Upcoming Appointments */}
        <div className="card" style={{ padding: '1.5rem 0' }}>
          <div className="section-header" style={{ padding: '0 1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Upcoming Appointments</h3>
            <Link to="/appointments" style={{ fontSize: '0.875rem', fontWeight: 600 }}>Full Schedule &rarr;</Link>
          </div>

          <DataTable 
            headers={['Patient', 'Time', 'Source', '']} 
            empty={upcomingAppts.length === 0}
            onEmpty={<div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-light)' }}>No upcoming appointments.</div>}
          >
            {upcomingAppts.map(appt => (
              <tr key={appt.id}>
                <td style={{ fontWeight: 600 }}>
                  {appt.leads ? `${appt.leads.first_name} ${appt.leads.last_name}` : 'N/A'}
                </td>
                <td style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                  {formatTime(appt.start_time)}
                </td>
                <td>
                  <span style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>{appt.source.replace('_', ' ')}</span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <Link to={`/leads/${appt.lead_id}`} style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Lead</Link>
                </td>
              </tr>
            ))}
          </DataTable>
        </div>
      </div>
    </PageShell>
  );
}
