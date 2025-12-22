import { useEffect, useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, List, RefreshCw, Search, X, CheckCircle2, AlertCircle, Clock, User } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useSession } from '../hooks/useSession';
import { usePracticeId } from '../hooks/usePracticeId';
import { PageShell } from '../components/PageShell';
import { EmptyState } from '../components/EmptyState';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { DataTable } from '../components/DataTable';
import { StatusPill } from '../components/StatusPill';
import { WeekView } from '../components/booking/WeekView';

// --- Timezone Helpers (from Admin Portal) ---

function getTzOffset(date: Date, tz: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    timeZoneName: 'longOffset'
  }).formatToParts(date);
  const offsetPart = parts.find(p => p.type === 'timeZoneName')?.value || '';
  const match = offsetPart.match(/[+-]\d{2}:\d{2}/);
  if (match) return match[0];
  if (offsetPart.includes('GMT') || offsetPart.includes('UTC')) {
    const sign = offsetPart.includes('-') ? '-' : '+';
    const digits = offsetPart.replace(/[^0-9]/g, '');
    return `${sign}${digits.padStart(2, '0')}:00`;
  }
  return '+00:00';
}

function buildTimestampWithOffset(dateStr: string, timeStr: string, tz: string) {
  const date = new Date(`${dateStr}T${timeStr}`);
  const offset = getTzOffset(date, tz);
  return `${dateStr} ${timeStr}${offset}`;
}

// --- Component ---

type Lead = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
};

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

type AvailabilityBlock = {
  id: string;
  practice_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  type: string;
};

export function Appointments() {
  const { session } = useSession();
  const { practiceId, practice, loading: loadingPractice, error: practiceError } = usePracticeId();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [availability, setAvailability] = useState<AvailabilityBlock[]>([]);
  const [activeTab, setActiveTab] = useState<'calendar' | 'list'>('calendar');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');

  // Booking Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; start: string; end: string } | null>(null);
  const [leadQuery, setLeadQuery] = useState('');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [totalLeadsFound, setTotalLeadsFound] = useState(0);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [bookingMode, setBookingMode] = useState<'select' | 'create'>('select');
  const [newLead, setNewLead] = useState({ first: '', last: '', phone: '', email: '' });
  const [apptNotes, setApptNotes] = useState('');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const practiceTimezone = useMemo(() => {
    return practice?.timezone || practice?.booking_settings?.timezone || 'America/New_York';
  }, [practice]);

  useEffect(() => {
    if (!practiceId) return;
    fetchData();
  }, [practiceId]);

  // Lead search effect
  useEffect(() => {
    if (!isModalOpen || !practiceId) return;
    
    const searchLeads = async () => {
      setLeadsLoading(true);
      try {
        let leadQueryBuilder = supabase
          .from('leads')
          .select('id, first_name, last_name, email, phone')
          .eq('practice_id', practiceId)
          .order('created_at', { ascending: false })
          .limit(25);

        if (leadQuery.trim()) {
          const pattern = `%${leadQuery.trim()}%`;
          leadQueryBuilder = leadQueryBuilder.or(`first_name.ilike.${pattern},last_name.ilike.${pattern},email.ilike.${pattern},phone.ilike.${pattern}`);
        }

        const [leadsRes, apptsRes] = await Promise.all([
          leadQueryBuilder,
          supabase
            .from('appointments')
            .select('lead_id')
            .eq('practice_id', practiceId)
            .neq('status', 'canceled')
        ]);

        if (leadsRes.error) throw leadsRes.error;
        if (apptsRes.error) throw apptsRes.error;

        const fetchedLeads: Lead[] = leadsRes.data || [];
        const bookedIds = new Set((apptsRes.data || []).map((a: { lead_id: string }) => a.lead_id));
        
        const eligibleLeads = fetchedLeads.filter((l: Lead) => !bookedIds.has(l.id));
        
        setLeads(eligibleLeads);
        setTotalLeadsFound(fetchedLeads.length);
      } catch (err) {
        console.error('Lead search error:', err);
      } finally {
        setLeadsLoading(false);
      }
    };

    const timer = setTimeout(searchLeads, 300);
    return () => clearTimeout(timer);
  }, [leadQuery, isModalOpen, practiceId]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [apptsRes, availRes] = await Promise.all([
        supabase
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
          .limit(200),
        supabase
          .from('availability_blocks')
          .select('*')
          .eq('practice_id', practiceId)
          .order('day_of_week', { ascending: true })
          .order('start_time', { ascending: true })
      ]);

      if (apptsRes.error) throw apptsRes.error;
      if (availRes.error) throw availRes.error;

      setAppointments((apptsRes.data as any) || []);
      setAvailability(availRes.data || []);
    } catch (err: any) {
      setError(err.message || 'Error loading data');
    } finally {
      setLoading(false);
    }
  }, [practiceId]);

  const handleSelectSlot = (date: string, start: string, end: string) => {
    setSelectedSlot({ date, start, end });
    setLeadQuery('');
    setLeads([]);
    setTotalLeadsFound(0);
    setSelectedLead(null);
    setBookingMode('select');
    setNewLead({ first: '', last: '', phone: '', email: '' });
    setApptNotes('');
    setBookingError(null);
    setSuccessMessage(null);
    setIsModalOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot || !practiceId || !session) return;
    if (bookingMode === 'select' && !selectedLead) return;
    if (bookingMode === 'create' && (!newLead.first || !newLead.last || !newLead.phone)) return;

    setBookingSubmitting(true);
    setBookingError(null);

    try {
      const token = session.access_token;
      let finalLeadId = selectedLead?.id;
      let finalLeadName = selectedLead ? `${selectedLead.first_name} ${selectedLead.last_name}` : '';

      // 1. Create Lead if in 'create' mode
      if (bookingMode === 'create') {
        const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/booking-api`;
        const leadRes = await fetch(`${baseUrl}/provider/leads`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            first_name: newLead.first,
            last_name: newLead.last,
            phone: newLead.phone,
            email: newLead.email
          })
        });

        if (!leadRes.ok) {
          const errJson = await leadRes.json();
          if (leadRes.status === 409) {
            const existingId = errJson.lead_id || errJson.leadId || errJson.existing_lead_id || errJson.existingLeadId;
            if (existingId) {
              console.log('[Appointments] Lead already exists, auto-selecting:', existingId);
              finalLeadId = existingId;
              finalLeadName = `${newLead.first} ${newLead.last}`;
            } else {
              throw new Error(errJson.error || 'Lead already exists');
            }
          } else {
            throw new Error(errJson.error || 'Failed to create lead');
          }
        } else {
          const leadJson = await leadRes.json();
          finalLeadId = leadJson.data.id;
          finalLeadName = `${newLead.first} ${newLead.last}`;
        }
      }

      if (!finalLeadId) throw new Error('No patient selected or created');

      const tz = practiceTimezone;
      const startTimestamp = buildTimestampWithOffset(selectedSlot.date, `${selectedSlot.start}:00`, tz);
      const endTimestamp = buildTimestampWithOffset(selectedSlot.date, `${selectedSlot.end}:00`, tz);

      // Use the RPC that Admin uses
      const { error } = await supabase.rpc('admin_create_appointment', {
        p_practice_id: practiceId,
        p_lead_id: finalLeadId,
        p_start_time: startTimestamp,
        p_end_time: endTimestamp,
        p_source: 'call_center', 
        p_created_by: session.user.id,
        p_notes: apptNotes || null
      });

      if (error) {
        let msg = error.message;
        if (msg.includes('Time slot outside availability')) msg = 'Time slot is no longer available.';
        if (msg.includes('Time slot unavailable (overlap)')) msg = 'This time slot is already booked.';
        throw new Error(msg);
      }

      setSuccessMessage(`Appointment booked for ${finalLeadName}`);
      setTimeout(() => {
        setIsModalOpen(false);
        fetchData();
      }, 2000);
    } catch (err: any) {
      setBookingError(err.message || 'Failed to book appointment');
    } finally {
      setBookingSubmitting(false);
    }
  };

  const filtered = useMemo(() => {
    const now = new Date();
    const activeOnly = appointments.filter((a: Appointment) => {
      if (a.status === 'hold') {
        if (!a.expires_at) return true;
        return new Date(a.expires_at) > now;
      }
      return true;
    });

    const term = q.trim().toLowerCase();
    if (!term) return activeOnly;
    return activeOnly.filter((a: Appointment) => {
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
    return source.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
  };

  if (!session || loadingPractice || (loading && appointments.length === 0)) return <LoadingState />;
  if (error || practiceError) return <ErrorState message={error || practiceError || ''} retry={fetchData} />;

  if (!practiceId) {
    return (
      <PageShell title="Booking Center">
        <EmptyState 
          title="No Practice Assigned" 
          description="No practice assigned to this account. Contact support." 
        />
      </PageShell>
    );
  }

  return (
    <PageShell 
      title="Booking Center" 
      subtitle={practice?.name || "Scheduled and upcoming patient consultations"}
      actions={
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {activeTab === 'list' && (
            <input
              type="text"
              className="input-search input-sm"
              placeholder="Search booking center..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          )}
          <button onClick={fetchData} className="btn btn-outline btn-sm" disabled={loading}>
            <RefreshCw size={14} style={{ marginRight: '0.5rem', animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
        </div>
      }
    >
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1px' }}>
        <button 
          onClick={() => setActiveTab('calendar')}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.75rem 1.25rem', fontSize: '0.875rem', fontWeight: 600,
            border: 'none', background: 'none', cursor: 'pointer',
            color: activeTab === 'calendar' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            borderBottom: activeTab === 'calendar' ? '2px solid var(--color-primary)' : '2px solid transparent',
            transition: 'all 0.2s'
          }}
        >
          <Calendar size={18} />
          Calendar
        </button>
        <button 
          onClick={() => setActiveTab('list')}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.75rem 1.25rem', fontSize: '0.875rem', fontWeight: 600,
            border: 'none', background: 'none', cursor: 'pointer',
            color: activeTab === 'list' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            borderBottom: activeTab === 'list' ? '2px solid var(--color-primary)' : '2px solid transparent',
            transition: 'all 0.2s'
          }}
        >
          <List size={18} />
          Appointments List
        </button>
      </div>

      {activeTab === 'calendar' ? (
        <WeekView 
          availability={availability} 
          appointments={appointments} 
          timezone={practiceTimezone}
          onSelectSlot={handleSelectSlot}
        />
      ) : (
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
      )}

      {/* Booking Modal */}
      {isModalOpen && selectedSlot && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', padding: 0, overflow: 'hidden', animation: 'modalFadeIn 0.2s ease-out' }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fcfdfe' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Book Appointment</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}><X size={24} /></button>
            </div>

            <div style={{ padding: '2rem' }}>
              {successMessage ? (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <div style={{ color: 'var(--status-success)', marginBottom: '1rem' }}><CheckCircle2 size={48} style={{ margin: '0 auto' }} /></div>
                  <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Success!</h3>
                  <p style={{ color: 'var(--color-text-muted)' }}>{successMessage}</p>
                </div>
              ) : (
                <>
                  {bookingError && (
                    <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '8px', color: '#991b1b', fontSize: '0.875rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <AlertCircle size={18} />
                      {bookingError}
                    </div>
                  )}

                  <div style={{ marginBottom: '2rem', padding: '1.25rem', background: 'var(--color-bg-base)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Selected Time Slot</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={16} className="text-muted" />
                        <span style={{ fontWeight: 600 }}>{new Date(selectedSlot.date + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={16} className="text-muted" />
                        <span style={{ fontWeight: 600 }}>{selectedSlot.start} - {selectedSlot.end}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: '#f1f5f9', padding: '0.25rem', borderRadius: '8px' }}>
                    <button 
                      onClick={() => setBookingMode('select')}
                      style={{ 
                        flex: 1, padding: '0.5rem', borderRadius: '6px', border: 'none',
                        fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                        background: bookingMode === 'select' ? 'white' : 'transparent',
                        color: bookingMode === 'select' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        boxShadow: bookingMode === 'select' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      Select Existing
                    </button>
                    <button 
                      onClick={() => setBookingMode('create')}
                      style={{ 
                        flex: 1, padding: '0.5rem', borderRadius: '6px', border: 'none',
                        fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                        background: bookingMode === 'create' ? 'white' : 'transparent',
                        color: bookingMode === 'create' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        boxShadow: bookingMode === 'create' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      Create New
                    </button>
                  </div>

                  {bookingMode === 'select' ? (
                    <>
                      <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.75rem' }}>Search Patient (Lead)</label>
                        <div style={{ position: 'relative' }}>
                          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
                          <input 
                            type="text"
                            className="form-control"
                            placeholder="Name, email, or phone..."
                            value={leadQuery}
                            onChange={(e) => setLeadQuery(e.target.value)}
                            style={{ paddingLeft: '2.75rem' }}
                            autoFocus
                          />
                        </div>
                      </div>

                      <div style={{ border: '1px solid var(--color-border)', borderRadius: '12px', maxHeight: '200px', overflowY: 'auto', background: 'white', marginBottom: '1.5rem' }}>
                        {leadsLoading ? (
                          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-light)', fontSize: '0.875rem' }}>Searching...</div>
                        ) : leads.length === 0 ? (
                          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-light)', fontSize: '0.875rem' }}>
                            {totalLeadsFound > 0 && leads.length === 0 
                              ? "No eligible leads to book (all leads already have appointments)."
                              : leadQuery ? "No patients found matching your search." : "No leads found for this practice."}
                          </div>
                        ) : (
                          leads.map(lead => (
                            <div 
                              key={lead.id}
                              onClick={() => setSelectedLead(lead)}
                              style={{ 
                                padding: '1rem 1.25rem', 
                                borderBottom: '1px solid var(--color-border)', 
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                background: selectedLead?.id === lead.id ? 'var(--color-accent-soft)' : 'transparent',
                                transition: 'all 0.2s'
                              }}
                            >
                              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                                <User size={16} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{lead.first_name} {lead.last_name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{lead.email} • {lead.phone}</div>
                              </div>
                              {selectedLead?.id === lead.id && <CheckCircle2 size={18} style={{ color: 'var(--color-accent)' }} />}
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div className="form-group">
                        <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>First Name *</label>
                        <input 
                          type="text" className="form-control" placeholder="John"
                          value={newLead.first} onChange={e => setNewLead({...newLead, first: e.target.value})}
                        />
                      </div>
                      <div className="form-group">
                        <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Last Name *</label>
                        <input 
                          type="text" className="form-control" placeholder="Doe"
                          value={newLead.last} onChange={e => setNewLead({...newLead, last: e.target.value})}
                        />
                      </div>
                      <div className="form-group">
                        <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Phone Number *</label>
                        <input 
                          type="text" className="form-control" placeholder="(555) 000-0000"
                          value={newLead.phone} onChange={e => setNewLead({...newLead, phone: e.target.value})}
                        />
                      </div>
                      <div className="form-group">
                        <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Email (Optional)</label>
                        <input 
                          type="email" className="form-control" placeholder="john@example.com"
                          value={newLead.email} onChange={e => setNewLead({...newLead, email: e.target.value})}
                        />
                      </div>
                    </div>
                  )}

                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.75rem' }}>Appointment Notes (Optional)</label>
                    <textarea 
                      className="form-control"
                      placeholder="Add any specific details for this appointment..."
                      value={apptNotes}
                      onChange={(e) => setApptNotes(e.target.value)}
                      style={{ minHeight: '80px', resize: 'vertical' }}
                    />
                  </div>
                </>
              )}
            </div>

            {!successMessage && (
              <div style={{ padding: '1.5rem 2rem', background: '#fcfdfe', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-outline"
                  disabled={bookingSubmitting}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmBooking}
                  className="btn btn-primary"
                  disabled={bookingSubmitting || (bookingMode === 'select' ? !selectedLead : (!newLead.first || !newLead.last || !newLead.phone))}
                  style={{ minWidth: '140px' }}
                >
                  {bookingSubmitting ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </PageShell>
  );
}
