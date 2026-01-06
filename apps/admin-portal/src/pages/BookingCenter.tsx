import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// Helper: 12-hour AM/PM
const format12h = (minutes: number) => {
  const h24 = Math.floor(minutes / 60);
  const m = minutes % 60;
  const h12 = h24 % 12 || 12;
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
};

// Helper: Map JS day (Sun=0..Sat=6) to DB day (Sun=0..Sat=6)
const toDbDayOfWeek = (jsDay: number) => jsDay;

// Helper: Get day of week (Sun=0..Sat=6) for a date string in a specific timezone
const getPracticeDayOfWeek = (dateStr: string, tz: string): number => {
  try {
    const d = new Date(dateStr + 'T12:00:00');
    const localD = new Date(d.toLocaleString('en-US', { timeZone: tz }));
    const jsDay = localD.getDay();
    return toDbDayOfWeek(jsDay);
  } catch (e) {
    const jsDay = new Date(dateStr).getDay();
    return toDbDayOfWeek(jsDay);
  }
};

// Helper: Convert "HH:MM:SS" or "HH:MM" to minutes
const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

// Helper: Convert YYYY-MM-DD to a Date object without UTC day-shift
function dateStrToSafeDate(dateStr: string) {
  // Use noon local to avoid timezone shifting when parsing YYYY-MM-DD
  return new Date(`${dateStr}T12:00:00`);
}

// Helper: Convert minutes since midnight to HH:MM:SS
function minutesToTimeString(m: number) {
  const hh = Math.floor(m / 60).toString().padStart(2, '0');
  const mm = (m % 60).toString().padStart(2, '0');
  return `${hh}:${mm}:00`;
}

// Helper: Get timezone offset string (e.g. "+05:00" or "-08:00") for a date and tz
function getTzOffset(date: Date, tz: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    timeZoneName: 'longOffset' // Use longOffset for more predictable "+HH:MM"
  }).formatToParts(date);
  const offsetPart = parts.find(p => p.type === 'timeZoneName')?.value || ''; // e.g. "GMT-05:00"
  
  const match = offsetPart.match(/[+-]\d{2}:\d{2}/);
  if (match) return match[0];
  
  // Fallback for GMT/UTC
  if (offsetPart.includes('GMT') || offsetPart.includes('UTC')) {
    const fallbackMatch = offsetPart.match(/[+-]\d+/);
    if (!fallbackMatch) return '+00:00';
    const sign = offsetPart.includes('-') ? '-' : '+';
    const digits = offsetPart.replace(/[^0-9]/g, '');
    return `${sign}${digits.padStart(2, '0')}:00`;
  }

  return '+00:00';
}

// Helper: Build a Postgres-ready timestamptz string with offset
function buildTimestampWithOffset(dateStr: string, minutes: number, tz: string) {
  const timeStr = minutesToTimeString(minutes);
  // We need the offset for THIS specific wall-clock time in THIS timezone
  // Simplest way: create a date object and get its offset in that tz
  const date = new Date(`${dateStr}T${timeStr}`);
  const offset = getTzOffset(date, tz);
  return `${dateStr} ${timeStr}${offset}`;
}

// Helper: Get today's date string in a specific timezone
function getTodayDateStrInTZ(tz: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const y = parts.find(p => p.type === 'year')?.value;
  const m = parts.find(p => p.type === 'month')?.value;
  const d = parts.find(p => p.type === 'day')?.value;
  return `${y}-${m}-${d}`;
}

// Helper: Check if slot is enabled by availability blocks
const isSlotWithinAvailability = (slotStart: number, slotEnd: number, blocks: any[]): boolean => {
  if (!blocks || blocks.length === 0) return false;
  return blocks.some(b => {
    const bStart = timeToMinutes(b.start_time);
    const bEnd = timeToMinutes(b.end_time);
    // Strict match with RPC: end_time must be strictly less than block end_time
    // to satisfy the p_end_time::time < ab.end_time check in SQL
    return slotStart >= bStart && slotEnd < bEnd;
  });
};

// Helper: Convert ISO timestamp to minute of day in a specific timezone
const timestampToMinutes = (timestamp: string, tz: string): number => {
  try {
    const date = new Date(timestamp);
    const parts = new Intl.DateTimeFormat('en-US', { 
      timeZone: tz, 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    }).formatToParts(date);
    const hh = parseInt(parts.find(p => p.type === 'hour')?.value ?? '0', 10);
    const mm = parseInt(parts.find(p => p.type === 'minute')?.value ?? '0', 10);
    return hh * 60 + mm;
  } catch (e) {
    console.error('Error converting timestamp to minutes:', e);
    return 0;
  }
};

const START_MIN = 7 * 60; // 7:00 AM
const END_MIN = 19 * 60; // 7:00 PM (12 hours)
const SLOT_STEP = 30; // 30-minute slots ONLY

// --- Sub-components ---

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed', bottom: '2rem', right: '2rem',
      background: '#0c4c54', color: 'white',
      padding: '1rem 1.5rem', borderRadius: '12px',
      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
      zIndex: 2000, display: 'flex', alignItems: 'center', gap: '0.75rem',
      animation: 'toastSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      <div style={{ background: '#00bfa5', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>✓</div>
      <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{message}</span>
      <style>{`
        @keyframes toastSlideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export function BookingCenter() {
  const [adminPractices, setAdminPractices] = useState<Array<{ id: string; name: string; status?: string }>>([]);
  const [selectedPractice, setSelectedPractice] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchTerm, setSearchQuery] = useState('');
  const [duration, setDuration] = useState(30);
  const [liveLeads, setLiveLeads] = useState<Array<{ id: string; first_name: string | null; last_name: string | null; phone: string | null; email: string | null }>>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadsError, setLeadsError] = useState<string | null>(null);
  const [modalOpenCount, setModalOpenCount] = useState(0);
  const [activeAppts, setActiveAppts] = useState<any[]>([]);
  const [activeApptsLoading, setActiveApptsLoading] = useState(false);
  
  // Live API State
  const [liveAvailability, setLiveAvailability] = useState<any>(null);
  const [liveAppointments, setLiveAppointments] = useState<any[]>([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [leadsMap, setLeadsMap] = useState<Record<string, any>>({});
  const [selectedBookedAppt, setSelectedBookedAppt] = useState<any | null>(null);
  const requestId = useRef(0);

  // Fetch practice list via admin-api
  useEffect(() => {
    const fetchPractices = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('No active session');

        const token = session.access_token;
        const adminBaseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api`;
        const headers = { 'Authorization': `Bearer ${token}` };

        // 1) Try GET /admin/practices
        let res = await fetch(`${adminBaseUrl}/admin/practices?limit=200&offset=0`, { headers });
        
        // 2) Fallback to GET /admin/map/practices
        if (!res.ok) {
          res = await fetch(`${adminBaseUrl}/admin/map/practices?include_missing=true`, { headers });
        }

        if (!res.ok) throw new Error(`Failed to load practices (${res.status})`);

        const json = await res.json();
        const rawList = Array.isArray(json) ? json : (json.data || []);
        
        const normalized = rawList.map((p: any) => ({
          id: p.id,
          name: p.name,
          status: p.status
        }));

        setAdminPractices(normalized);
        console.log(`Loaded practices count=${normalized.length}`);

        if (normalized.length > 0 && !selectedPractice) {
          setSelectedPractice(normalized[0].id);
        }
      } catch (err: any) {
        console.error('Error fetching practices via admin-api:', err);
        setApiError('Failed to load practices list');
      }
    };
    fetchPractices();
  }, []);

  // Fetch live data
  const refreshLiveData = useCallback(async () => {
    if (!selectedPractice) return;
    
    const currentReqId = ++requestId.current;
    console.log("[BookingCenter] fetchAvailability", { reqId: currentReqId, selectedPractice, selectedDate });

    setApiLoading(true);
    setApiError(null);
    setSelectedSlot(null);
    setSelectedBookedAppt(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session found');
      }

      const token = session.access_token;
      const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/booking-api`;
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [availRes, apptsRes] = await Promise.all([
        fetch(`${baseUrl}/availability?date=${selectedDate}&practice_id=${selectedPractice}`, { 
          headers: { ...headers, 'x-practice-id': selectedPractice } 
        }),
        fetch(`${baseUrl}/appointments?date=${selectedDate}&practice_id=${selectedPractice}`, { 
          headers: { ...headers, 'x-practice-id': selectedPractice } 
        })
      ]);

      if (!availRes.ok) {
        const errJson = await availRes.json().catch(() => ({}));
        throw new Error(`Availability fetch failed: ${availRes.status} ${errJson.error || availRes.statusText}`);
      }
      if (!apptsRes.ok) {
        const errJson = await apptsRes.json().catch(() => ({}));
        throw new Error(`Appointments fetch failed: ${apptsRes.status} ${errJson.error || apptsRes.statusText}`);
      }

      const availJson = await availRes.json();
      const apptsJson = await apptsRes.json();

      // Guard: only apply if this is the latest request
      if (currentReqId !== requestId.current) {
        console.warn("[BookingCenter] ignoring stale availability response", { reqId: currentReqId, latest: requestId.current });
        return;
      }

      const blocks = availJson.data?.blocks || [];
      const exceptions = availJson.data?.exceptions || [];
      console.log("[BookingCenter] fetchAvailability result", { reqId: currentReqId, blocks: blocks.length, exceptions: exceptions.length });

      setLiveAvailability(availJson.data);
      const fetchedAppointments = apptsJson.data?.appointments || [];
      setLiveAppointments(fetchedAppointments);

      // Extract lead info from joined results (provided by service-role backend)
      const joinedLeadsMap: Record<string, any> = {};
      fetchedAppointments.forEach((appt: any) => {
        // The backend returns joined lead data under the 'lead' key
        const leadData = appt.lead || appt.leads;
        if (leadData && appt.lead_id) {
          joinedLeadsMap[appt.lead_id] = leadData;
        }
      });

      if (Object.keys(joinedLeadsMap).length > 0) {
        setLeadsMap(prev => ({ ...prev, ...joinedLeadsMap }));
      }
    } catch (err: any) {
      if (currentReqId === requestId.current) {
        console.error('BookingCenter Fetch Error:', err);
        setApiError(err.message || 'Failed to fetch live data');
      }
    } finally {
      if (currentReqId === requestId.current) {
        setApiLoading(false);
      }
    }
  }, [selectedPractice, selectedDate]);

  useEffect(() => {
    refreshLiveData();
  }, [refreshLiveData]);

  // Fetch leads when modal opens
  useEffect(() => {
    if (!isModalOpen) return;

    let cancelled = false;

    const fetchData = async () => {
      try {
        setLeadsLoading(true);
        setActiveApptsLoading(true);
        setLeadsError(null);

        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        const q = searchTerm ? `&q=${encodeURIComponent(searchTerm)}` : '';
        const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api`;
        const headers = { 'Authorization': `Bearer ${token}` };

        const leadsUrl = `${baseUrl}/admin/leads/search?practice_id=${selectedPractice}${q}`;
        const activeApptsUrl = `${baseUrl}/admin/appointments/active?practice_id=${selectedPractice}`;
        
        console.log('[BookingCenter] fetching leads and active appts for modal');

        const [leadsRes, activeRes] = await Promise.all([
          fetch(leadsUrl, { headers }),
          fetch(activeApptsUrl, { headers })
        ]);

        if (!leadsRes.ok) {
          const errTxt = await leadsRes.text();
          throw new Error(`Failed to fetch leads: ${leadsRes.status} ${errTxt}`);
        }
        if (!activeRes.ok) {
          const errTxt = await activeRes.text();
          throw new Error(`Failed to fetch active appointments: ${activeRes.status} ${errTxt}`);
        }

        const leadsJson = await leadsRes.json();
        const activeJson = await activeRes.json();

        if (cancelled) return;

        setLiveLeads(leadsJson.data || []);
        setActiveAppts(activeJson.data || []);
      } catch (e: any) {
        if (cancelled) return;
        setLiveLeads([]);
        setLeadsError(e?.message || 'Failed to load data');
      } finally {
        if (!cancelled) {
          setLeadsLoading(false);
          setActiveApptsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [isModalOpen, searchTerm, selectedPractice]);

  useEffect(() => {
    console.log('[BookingCenter] isModalOpen changed:', isModalOpen);
    if (isModalOpen) setModalOpenCount((c) => c + 1);
  }, [isModalOpen]);

  // Form for new patient
  const [newPatient, setNewPatient] = useState({ first: '', last: '', phone: '', email: '' });
  const [apptNotes, setApptNotes] = useState('');
  const [bookingMode, setBookingMode] = useState<'select' | 'create'>('select');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const slots = useMemo(() => {
    const s = [];
    for (let m = START_MIN; m < END_MIN; m += SLOT_STEP) {
      s.push(m);
    }
    return s;
  }, []);

  // Compute timezone-aware availability for the grid
  const availabilityData = useMemo(() => {
    const tz = liveAvailability?.timezone || 'America/New_York';
    const dayOfWeek = getPracticeDayOfWeek(selectedDate, tz);
    const blocks = liveAvailability?.blocks || [];
    
    // Ensure we handle both string and number day_of_week from API
    const dayBlocks = blocks.filter((b: any) => Number(b.day_of_week) === dayOfWeek);
    
    console.log("[BookingCenter] dayBlocks debug", {
      selectedDate,
      jsDay: dateStrToSafeDate(selectedDate).getDay(),
      dbDay: dayOfWeek,
      rawBlockDays: blocks.map((b: any) => b.day_of_week),
      matched: dayBlocks.length
    });

    return {
      tz,
      dayOfWeek,
      dayBlocks,
      hasAvailability: dayBlocks.length > 0,
      totalBlocks: blocks.length
    };
  }, [liveAvailability, selectedDate]);

  // Derived map of booked slots from liveAppointments
  const bookedSlotsByMinute = useMemo(() => {
    const map: Record<number, { appt: any; name: string; info: string; isStart: boolean; isEnd: boolean }> = {};
    if (!liveAppointments || liveAppointments.length === 0) return map;

    liveAppointments.forEach(appt => {
      const startIso = appt.start_at || appt.start_time || appt.start;
      const endIso = appt.end_at || appt.end_time || appt.end;
      if (!startIso || !endIso) return;

      const rawStartMin = timestampToMinutes(startIso, availabilityData.tz);
      const rawEndMin = timestampToMinutes(endIso, availabilityData.tz);
      
      // Snap to 30-min boundaries
      const startMin = Math.floor(rawStartMin / SLOT_STEP) * SLOT_STEP;
      const endMin = Math.ceil(rawEndMin / SLOT_STEP) * SLOT_STEP;
      
      if (endMin <= startMin) return;

      const lead = leadsMap[appt.lead_id];
      let displayName = 'Patient';
      if (lead) {
        const full = `${lead.first_name ?? ''} ${lead.last_name ?? ''}`.trim();
        if (full) displayName = full;
        else if (lead.phone) displayName = lead.phone;
        else if (lead.email) displayName = lead.email;
      } else {
        displayName = appt.lead_name || appt.patient_name || appt.name || 'Booked';
      }

      const secondaryInfo = lead ? (lead.email || lead.phone || '') : '';

      for (let m = startMin; m < endMin; m += SLOT_STEP) {
        // Only include if it fits in our grid view
        if (m >= START_MIN && m < END_MIN) {
          map[m] = { 
            appt,
            name: displayName, 
            info: secondaryInfo,
            isStart: m === startMin,
            isEnd: (m + SLOT_STEP >= endMin)
          };
        }
      }
    });

    return map;
  }, [liveAppointments, availabilityData.tz, leadsMap]);

  const getSlotState = (m: number) => {
    // 1. Check if it's booked (Overrides everything else)
    if (bookedSlotsByMinute[m]) return 'booked';

    // 2. Check if it's in availability blocks
    const enabled = isSlotWithinAvailability(m, m + SLOT_STEP, availabilityData.dayBlocks);
    if (!enabled) return 'unavailable';
    
    // TODO: Apply exceptions (Phase B)
    
    return 'available';
  };

  const handleSlotClick = (m: number) => {
    const state = getSlotState(m);
    if (state === 'available') {
      setSelectedSlot(m);
      setSelectedBookedAppt(null);
    } else if (state === 'booked') {
      setSelectedBookedAppt(bookedSlotsByMinute[m].appt);
      setSelectedSlot(null);
    }
  };

  const handleConfirmBooking = async (inputLead?: { id: string; name: string }) => {
    if (selectedSlot === null || !selectedPractice) return;
    
    setApiLoading(true);
    setApiError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session. Please log in again.');

      const tz = liveAvailability?.timezone || 'America/New_York';
      const startTimestamp = buildTimestampWithOffset(selectedDate, selectedSlot, tz);
      const endTimestamp = buildTimestampWithOffset(selectedDate, selectedSlot + duration, tz);
      const createdBy = session.user?.id || session.user?.email || 'admin';
      const token = session.access_token;

      let finalLeadId = inputLead?.id || selectedLeadId;
      let finalLeadName = inputLead?.name || '';

      // 1. If in 'create' mode, create the lead first
      if (bookingMode === 'create') {
        const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api`;
        const leadRes = await fetch(`${baseUrl}/admin/leads`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            first_name: newPatient.first,
            last_name: newPatient.last,
            phone: newPatient.phone,
            email: newPatient.email,
            practice_id: selectedPractice
          })
        });

        if (!leadRes.ok) {
          const errJson = await leadRes.json();
          
          // Handle duplicate lead conflict (409)
          if (leadRes.status === 409) {
            const existingId = errJson.lead_id || errJson.leadId || errJson.existing_lead_id || errJson.existingLeadId;
            if (existingId) {
              console.log('[BookingCenter] Lead already exists, auto-selecting:', existingId);
              setBookingMode('select');
              setSelectedLeadId(existingId);
              setApiError(null);
              
              // Proceed with this existing lead ID
              finalLeadId = existingId;
              finalLeadName = `${newPatient.first} ${newPatient.last}`; 
            } else {
              throw new Error(errJson.error || 'Lead already exists');
            }
          } else {
            throw new Error(errJson.error || 'Failed to create lead');
          }
        } else {
          const leadJson = await leadRes.json();
          finalLeadId = leadJson.data.id;
          finalLeadName = `${newPatient.first} ${newPatient.last}`;
        }
      } else if (!finalLeadId && inputLead) {
        finalLeadId = inputLead.id;
        finalLeadName = inputLead.name;
      } else if (finalLeadId && !finalLeadName) {
        const lead = liveLeads.find(l => l.id === finalLeadId);
        finalLeadName = lead ? `${lead.first_name} ${lead.last_name}` : 'Patient';
      }

      if (!finalLeadId) throw new Error('No patient selected or created');

      // 2. Create the appointment
      const { data, error } = await (supabase.rpc as any)('admin_create_appointment', {
        p_practice_id: selectedPractice,
        p_lead_id: finalLeadId,
        p_start_time: startTimestamp,
        p_end_time: endTimestamp,
        p_source: 'call_center',
        p_created_by: createdBy,
        p_notes: apptNotes || null
      });

      if (error) {
        let msg = error.message || 'Failed to create appointment';
        if (msg.includes('Time slot outside availability')) {
          msg = 'Time slot outside availability';
          console.warn("[BookingCenter] slot rejected", { 
            slotStart: selectedSlot, 
            slotEnd: selectedSlot + duration, 
            tz, 
            selectedDate,
            error: error.message 
          });
        }
        if (msg.includes('Time slot unavailable (overlap)')) msg = 'Time slot unavailable (overlap)';
        throw new Error(msg);
      }

      console.log('Appointment created:', data, { startTimestamp, endTimestamp });

      setIsModalOpen(false);
      setSelectedSlot(null);
      setSelectedLeadId(null);
      setNewPatient({ first: '', last: '', phone: '', email: '' });
      setApptNotes('');
      setSearchQuery('');
      setToastMessage(`Booking confirmed for ${finalLeadName}`);
      
      refreshLiveData();
    } catch (err: any) {
      console.error('Booking Error:', err);
      setApiError(err.message || 'An unexpected error occurred during booking.');
    } finally {
      setApiLoading(false);
    }
  };

  const handleCancelAppointment = async (apptId: string) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

    setApiLoading(true);
    setApiError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const token = session.access_token;
      const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api`;
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const res = await fetch(`${baseUrl}/admin/appointments/${apptId}/cancel`, {
        method: 'POST',
        headers
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to cancel appointment');
      }

      setToastMessage('Appointment canceled successfully');
      setSelectedBookedAppt(null);
      refreshLiveData();
    } catch (err: any) {
      console.error('Cancellation Error:', err);
      setApiError(err.message || 'Failed to cancel appointment');
    } finally {
      setApiLoading(false);
    }
  };

  const activeBookedLeadIds = useMemo(() => {
    return new Set(
      (activeAppts ?? [])
        .map(a => a.lead_id)
        .filter(Boolean)
    );
  }, [activeAppts]);

  const filteredLeads = useMemo(() => {
    if (searchTerm === '') return liveLeads.slice(0, 10);
    const search = searchTerm.toLowerCase();
    return liveLeads.filter(l => {
      const displayName = `${l.first_name ?? ''} ${l.last_name ?? ''}`.toLowerCase();
      const email = (l.email ?? '').toLowerCase();
      const phone = l.phone ?? '';
      return displayName.includes(search) || email.includes(search) || phone.includes(search);
    });
  }, [liveLeads, searchTerm]);

  const eligibleLeads = useMemo(() => {
    const list = filteredLeads.filter(l => !activeBookedLeadIds.has(l.id));
    if (isModalOpen) {
      console.log('[BookingCenter] activeAppts count', activeAppts.length);
      console.log('[BookingCenter] activeBookedLeadIds', [...activeBookedLeadIds]);
      console.log('[Admin BookingCenter] eligibleLeads', list.length);
    }
    return list;
  }, [filteredLeads, activeBookedLeadIds, isModalOpen, activeAppts.length]);

  return (
    <div style={{ padding: '2rem', maxWidth: '1440px', margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, color: '#0c4c54', letterSpacing: '-0.025em' }}>Booking Center</h1>
          <p style={{ margin: '0.35rem 0 0 0', color: '#64748b', fontSize: '1.0625rem' }}>Streamlined appointment management for clinical staff</p>
          <div style={{ marginTop: '1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ background: '#f0fdfa', color: '#0c4c54', padding: '0.4rem 0.875rem', borderRadius: '100px', border: '1px solid #ccfbf1', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Times shown in Eastern Time (ET)
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', background: '#f8fafc', padding: '0.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <select 
            value={selectedPractice} 
            onChange={(e) => setSelectedPractice(e.target.value)}
            style={{ padding: '0.625rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', outline: 'none', fontSize: '0.875rem', fontWeight: 600, color: '#1e293b', cursor: 'pointer' }}
          >
            {adminPractices.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <div style={{ width: '1px', height: '24px', background: '#e2e8f0' }} />
          <button 
            onClick={() => {
              const tz = liveAvailability?.timezone || 'America/New_York';
              setSelectedDate(getTodayDateStrInTZ(tz));
            }}
            style={{ padding: '0.625rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', color: '#475569', transition: 'all 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
            onMouseOut={(e) => e.currentTarget.style.background = 'white'}
          >
            Today
          </button>
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ padding: '0.625rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.875rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2.5rem', alignItems: 'start' }}>
        {/* Left: Day Calendar */}
        <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)' }}>
          <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fcfdfe' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#0c4c54', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '1.125rem' }}>
                {dateStrToSafeDate(selectedDate).getDate()}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
                  {dateStrToSafeDate(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Daily View • {availabilityData.tz}</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00bfa5' }} /> Available
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', border: '1px solid #cbd5e1', background: '#f8fafc' }} /> Unavailable
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#cbd5e1' }} /> Booked
              </div>
            </div>
          </div>

          {!apiLoading && availabilityData.totalBlocks === 0 && (
            <div style={{ padding: '1rem 2rem', background: '#fffbeb', borderBottom: '1px solid #fef3c7', color: '#92400e', fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span>⚠️</span>
              No availability has been set for this practice yet. Add availability in the Provider Portal to enable booking times.
            </div>
          )}

          {!apiLoading && availabilityData.totalBlocks > 0 && availabilityData.dayBlocks.length === 0 && (
            <div style={{ padding: '1rem 2rem', background: '#fffbeb', borderBottom: '1px solid #fef3c7', color: '#92400e', fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span>⚠️</span>
              No availability for this day. Try a different date (or add availability for this day in the Provider Portal).
            </div>
          )}
          
          <div style={{ maxHeight: '800px', overflowY: 'auto', scrollBehavior: 'smooth' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <tbody>
                {slots.map(m => {
                  const state = getSlotState(m);
                  const isSelected = selectedSlot === m;
                  const isHalfHour = m % 60 !== 0;
                  const timeLabel = format12h(m);
                  const isHourBoundaryBelow = (m + SLOT_STEP) % 60 === 0;
                  const isEnabled = state === 'available' || state === 'booked';
                  
                  return (
                    <tr key={m} style={{ height: '40px' }}>
                      <td style={{ 
                        width: '100px', padding: '0 1.5rem', fontSize: '0.75rem', 
                        color: isHalfHour ? '#94a3b8' : '#0f172a', 
                        textAlign: 'right', background: '#f8fafc', fontWeight: 800,
                        borderBottom: isHourBoundaryBelow ? '2px solid #e2e8f0' : '1px solid #f1f5f9',
                        verticalAlign: 'middle', userSelect: 'none'
                      }}>
                        {timeLabel}
                      </td>
                      <td 
                        onClick={() => handleSlotClick(m)}
                        title={state === 'available' ? 'Available — Click to book' : undefined}
                        style={{ 
                          padding: 0, 
                          cursor: state === 'available' ? 'pointer' : 'default',
                          transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                          background: isSelected ? '#f0fdfa' : !isEnabled ? '#fcfdfe' : 'transparent',
                          borderBottom: isHourBoundaryBelow ? '2px solid #e2e8f0' : '1px solid #f1f5f9',
                          borderLeft: '1px solid #f1f5f9',
                          position: 'relative'
                        }}
                        onMouseOver={(e) => { if(state === 'available') e.currentTarget.style.background = isSelected ? '#f0fdfa' : '#f8fafc' }}
                        onMouseOut={(e) => { if(state === 'available') e.currentTarget.style.background = isSelected ? '#f0fdfa' : 'transparent' }}
                      >
                        {!isEnabled && (
                           <div style={{ 
                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 12px, rgba(203,213,225,0.05) 12px, rgba(203,213,225,0.05) 24px)',
                            pointerEvents: 'none'
                          }} />
                        )}

                        {state === 'booked' && (
                          <div style={{ 
                            position: 'absolute', top: '2px', left: '6px', right: '6px', bottom: '2px',
                            background: '#f1f5f9', 
                            borderRadius: bookedSlotsByMinute[m].isStart ? '8px 8px 0 0' : (bookedSlotsByMinute[m].isEnd ? '0 0 8px 8px' : '0'),
                            border: '1px solid #e2e8f0', 
                            borderTop: bookedSlotsByMinute[m].isStart ? '1px solid #e2e8f0' : 'none',
                            borderBottom: bookedSlotsByMinute[m].isEnd ? '1px solid #e2e8f0' : 'none',
                            display: 'flex', alignItems: 'center', padding: '0 1.25rem', zIndex: 1,
                            boxShadow: '0 1px 2px rgba(0,0,0,0.02)', borderLeft: '4px solid #94a3b8',
                            cursor: 'pointer'
                          }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem', overflow: 'hidden' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {bookedSlotsByMinute[m].isStart && <span style={{ fontSize: '0.875rem', opacity: 0.6 }}>👤</span>}
                                {bookedSlotsByMinute[m].name}
                              </span>
                              {bookedSlotsByMinute[m].isStart && bookedSlotsByMinute[m].info && (
                                <span style={{ fontSize: '0.625rem', color: '#64748b', marginLeft: '1.375rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {bookedSlotsByMinute[m].info}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {state === 'available' && isSelected && (
                          <div style={{ 
                            position: 'absolute', top: '3px', left: '6px', right: '6px', bottom: '3px',
                            background: '#0c4c54', borderRadius: '8px', border: '1px solid #0c4c54',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5,
                            boxShadow: '0 0 15px rgba(12,76,84,0.3)', animation: 'pulseGlow 2s infinite'
                          }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'white', letterSpacing: '0.1em' }}>SELECTED SLOT</span>
                          </div>
                        )}

                        {state === 'available' && !isSelected && (
                          <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', padding: '0 1.25rem' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00bfa5', opacity: 0.2 }} />
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <style>{`
              @keyframes pulseGlow {
                0% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.9; transform: scale(0.995); }
                100% { opacity: 1; transform: scale(1); }
              }
            `}</style>
          </div>
        </div>

        {/* Right: Context Panel */}
        <div style={{ position: 'sticky', top: '2rem' }}>
          {selectedBookedAppt ? (
            <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.12)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Appointment Details</h3>
                <button onClick={() => setSelectedBookedAppt(null)} style={{ background: '#f1f5f9', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.25rem', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background='#e2e8f0'}>×</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>👤</div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: '#0f172a' }}>
                      {leadsMap[selectedBookedAppt.lead_id]?.first_name} {leadsMap[selectedBookedAppt.lead_id]?.last_name}
                    </h4>
                    <span style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 500 }}>{leadsMap[selectedBookedAppt.lead_id]?.email || leadsMap[selectedBookedAppt.lead_id]?.phone || 'Patient'}</span>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 800, letterSpacing: '0.05em', marginBottom: '0.75rem' }}>SCHEDULED FOR</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1e293b', fontWeight: 700, fontSize: '0.9375rem' }}>
                      📅 {new Date(selectedBookedAppt.start_time).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0c4c54', fontWeight: 800, fontSize: '1rem' }}>
                      ⏰ {new Date(selectedBookedAppt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(selectedBookedAppt.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 800, letterSpacing: '0.05em', marginBottom: '0.625rem' }}>STATUS</div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#f0fdfa', color: '#0c4c54', padding: '0.35rem 0.75rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', border: '1px solid #ccfbf1' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00bfa5' }} />
                    {selectedBookedAppt.status}
                  </div>
                </div>

                {selectedBookedAppt.notes && (
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 800, letterSpacing: '0.05em', marginBottom: '0.625rem' }}>NOTES</div>
                    <div style={{ background: '#fffbeb', padding: '1rem', borderRadius: '12px', border: '1px solid #fef3c7', fontSize: '0.875rem', color: '#92400e', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                      {selectedBookedAppt.notes}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                  <Link 
                    to={`/admin/leads/${selectedBookedAppt.lead_id}`}
                    style={{ 
                      padding: '1rem', borderRadius: '12px', background: '#f8fafc', color: '#0c4c54', 
                      fontWeight: 700, textDecoration: 'none', textAlign: 'center', fontSize: '0.9375rem', 
                      border: '1px solid #e2e8f0', transition: 'all 0.2s' 
                    }}
                    onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'}
                    onMouseOut={e => e.currentTarget.style.background = '#f8fafc'}
                  >
                    View Lead Profile
                  </Link>
                  <button 
                    onClick={() => handleCancelAppointment(selectedBookedAppt.id)}
                    style={{ 
                      padding: '1rem', borderRadius: '12px', background: '#fff1f2', color: '#be123c', 
                      fontWeight: 700, border: '1px solid #fecdd3', cursor: 'pointer', fontSize: '0.9375rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.background = '#ffe4e6'}
                    onMouseOut={e => e.currentTarget.style.background = '#fff1f2'}
                  >
                    Cancel Appointment
                  </button>
                </div>
              </div>
            </div>
          ) : !selectedSlot ? (
            <div style={{ background: 'white', padding: '3.5rem 2rem', borderRadius: '20px', border: '1px solid #e2e8f0', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.75rem', border: '1px solid #f1f5f9', fontSize: '2.25rem' }}>
                📅
              </div>
              <h4 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 800, letterSpacing: '-0.01em' }}>Ready to book</h4>
              <p style={{ fontSize: '0.9375rem', color: '#64748b', marginTop: '1rem', lineHeight: 1.6 }}>
                Select an <span style={{ color: '#00bfa5', fontWeight: 700 }}>Available</span> slot on the grid to start booking an appointment.
              </p>
            </div>
          ) : (
            <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.12)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Booking Workflow</h3>
                <button onClick={() => setSelectedSlot(null)} style={{ background: '#f1f5f9', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.25rem', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background='#e2e8f0'}>×</button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 800, letterSpacing: '0.05em', marginBottom: '0.625rem' }}>SELECTED DATE</div>
                  <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '1.0625rem' }}>
                    {dateStrToSafeDate(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                  <div>
                    <div style={{ fontSize: '0.625rem', color: '#94a3b8', fontWeight: 800, letterSpacing: '0.05em', marginBottom: '0.35rem' }}>START</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0c4c54' }}>{format12h(selectedSlot)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.625rem', color: '#94a3b8', fontWeight: 800, letterSpacing: '0.05em', marginBottom: '0.35rem' }}>END</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#64748b' }}>{format12h(selectedSlot + duration)}</div>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>APPOINTMENT DURATION</label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {[30, 60].map(d => (
                      <button 
                        key={d}
                        onClick={() => setDuration(d)}
                        style={{
                          flex: 1, minWidth: '60px', padding: '0.625rem 0', borderRadius: '8px', border: '1px solid',
                          fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                          background: duration === d ? '#0c4c54' : 'white',
                          color: duration === d ? 'white' : '#475569',
                          borderColor: duration === d ? '#0c4c54' : '#e2e8f0'
                        }}
                      >
                        {d}m
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={async () => {
                    console.log('[BookingCenter] Continue to Booking clicked', { selectedSlot, selectedDate, selectedPractice });
                    try {
                      setLeadsLoading(true);
                      setLeadsError(null);
                      
                      const { data: { session } } = await supabase.auth.getSession();
                      const token = session?.access_token;
                      // When clicking Continue, searchTerm is usually empty, but let's be safe
                      const q = searchTerm ? `&q=${encodeURIComponent(searchTerm)}` : '';
                      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api/admin/leads/search?practice_id=${selectedPractice}${q}`;
                      
                      console.log('[BookingCenter] fetching leads from:', url);

                      const res = await fetch(url, {
                        headers: { 'Authorization': `Bearer ${token}` }
                      });

                      if (!res.ok) {
                        const errTxt = await res.text();
                        throw new Error(`Failed to fetch leads: ${res.status} ${errTxt}`);
                      }

                      const json = await res.json();
                      const leads = json.data || [];
                      
                      console.debug('[BookingCenter] leads search ok', { count: leads.length, q: searchTerm });
                      setLiveLeads(leads);
                    } catch (err: any) {
                      console.error('Error fetching leads:', err);
                      setLiveLeads([]);
                      setLeadsError(err.message || 'Unknown error fetching leads');
                    } finally {
                      setLeadsLoading(false);
                      const jsDay = dateStrToSafeDate(selectedDate).getDay();
                      const dbDay = toDbDayOfWeek(jsDay);
                      console.log("[BookingCenter] day mapping", { selectedDate, jsDay, dbDay, tz: liveAvailability?.timezone || 'America/New_York' });
                      console.log('[BookingCenter] opening modal now');
                      setIsModalOpen(true);
                    }
                  }}
                  style={{ 
                    marginTop: '0.5rem', padding: '1.125rem', borderRadius: '14px', 
                    background: '#0c4c54', color: 'white', fontWeight: 700, border: 'none', 
                    cursor: 'pointer', width: '100%', fontSize: '1.0625rem', transition: 'all 0.2s',
                    boxShadow: '0 8px 20px -4px rgba(12,76,84,0.3)'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 24px -4px rgba(12,76,84,0.4)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 20px -4px rgba(12,76,84,0.3)'; }}
                >
                  Continue to Booking
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {isModalOpen && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 
        }}>
          <div style={{ background: 'white', width: '720px', borderRadius: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', overflow: 'hidden', animation: 'modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <style>{`
              @keyframes modalSlideUp {
                from { transform: translateY(30px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
              }
            `}</style>
            <div style={{ padding: '2.25rem 3rem', borderBottom: '1px solid #f1f5f9', background: '#fcfdfe' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>Book Appointment</h2>
                  <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.9375rem', color: '#64748b', fontWeight: 600 }}>Finalize scheduling for this patient</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} style={{ background: '#f1f5f9', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.5rem', width: '36px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background='#e2e8f0'}>×</button>
              </div>
            </div>

            <div style={{ padding: '2.5rem 3rem', maxHeight: '70vh', overflowY: 'auto' }}>
              {apiError && (
                <div style={{ marginBottom: '2rem', padding: '1rem 1.5rem', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '16px', color: '#991b1b', fontSize: '0.875rem', fontWeight: 600 }}>
                  ⚠️ {apiError}
                </div>
              )}

              {/* Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem', marginBottom: '2.5rem', background: '#f8fafc', padding: '1.75rem', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                <div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 800, letterSpacing: '0.075em', marginBottom: '0.35rem' }}>APPOINTMENT DATE</div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>{dateStrToSafeDate(selectedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 800, letterSpacing: '0.075em', marginBottom: '0.35rem' }}>START TIME</div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>{format12h(selectedSlot!)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 800, letterSpacing: '0.075em', marginBottom: '0.35rem' }}>END TIME</div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>{format12h(selectedSlot! + duration)}</div>
                </div>
              </div>

              {/* Patient Selection Toggle */}
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
                <button 
                  onClick={() => setBookingMode('select')}
                  style={{
                    flex: 1, padding: '1rem', borderRadius: '16px', border: '1px solid',
                    fontSize: '0.9375rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                    background: bookingMode === 'select' ? '#0c4c54' : 'white',
                    color: bookingMode === 'select' ? 'white' : '#64748b',
                    borderColor: bookingMode === 'select' ? '#0c4c54' : '#e2e8f0',
                    boxShadow: bookingMode === 'select' ? '0 8px 16px -4px rgba(12,76,84,0.2)' : 'none'
                  }}
                >
                  Select Existing Lead
                </button>
                <button 
                  onClick={() => setBookingMode('create')}
                  style={{
                    flex: 1, padding: '1rem', borderRadius: '16px', border: '1px solid',
                    fontSize: '0.9375rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                    background: bookingMode === 'create' ? '#0c4c54' : 'white',
                    color: bookingMode === 'create' ? 'white' : '#64748b',
                    borderColor: bookingMode === 'create' ? '#0c4c54' : '#e2e8f0',
                    boxShadow: bookingMode === 'create' ? '0 8px 16px -4px rgba(12,76,84,0.2)' : 'none'
                  }}
                >
                  Create New Lead
                </button>
              </div>

              {/* Patient Selection Content */}
              {bookingMode === 'select' ? (
                <div style={{ marginBottom: '2.5rem' }}>
                  <h4 style={{ fontSize: '0.75rem', color: '#1e293b', fontWeight: 800, letterSpacing: '0.075em', marginBottom: '1.25rem', textTransform: 'uppercase' }}>Search Existing Leads</h4>
                  <div style={{ position: 'relative' }}>
                    <input 
                      placeholder="Search by name, email, or phone number..." 
                      value={searchTerm}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ width: '100%', padding: '1.125rem 1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxSizing: 'border-box', outline: 'none', fontSize: '1.0625rem', background: '#fcfdfe', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)', transition: 'all 0.2s' }}
                      onFocus={e => e.currentTarget.style.borderColor = '#0c4c54'}
                      onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                    />
                    <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.5rem', fontFamily: 'monospace' }}>
                      Search: "{searchTerm}" | liveLeads: {liveLeads.length} | filtered: {filteredLeads.length} | eligible: {eligibleLeads.length} | leadsLoading: {String(leadsLoading)} | leadsError: {leadsError ?? "none"} | modalOpens: {modalOpenCount}
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '1rem', border: '1px solid #e2e8f0', borderRadius: '20px', overflow: 'hidden', minHeight: '140px', maxHeight: '280px', overflowY: 'auto', background: '#f8fafc' }}>
                    {leadsLoading || activeApptsLoading ? (
                      <div style={{ padding: '3.5rem', textAlign: 'center', fontSize: '0.9375rem', color: '#94a3b8', fontWeight: 500 }}>
                        <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.5rem' }}>⏳</span>
                        Loading leads...
                      </div>
                    ) : leadsError ? (
                      <div style={{ padding: '2.5rem 2rem', textAlign: 'center', fontSize: '0.875rem', color: '#991b1b', background: '#fef2f2' }}>
                        <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.5rem' }}>⚠️</span>
                        <strong>Error: {leadsError}</strong>
                        <p style={{ marginTop: '0.5rem', color: '#7f1d1d', fontSize: '0.75rem' }}>
                          If this says permission denied / RLS, Admin Portal cannot read public.leads directly.
                        </p>
                      </div>
                    ) : eligibleLeads.length > 0 ? eligibleLeads.map(l => {
                      const displayName = `${l.first_name ?? ''} ${l.last_name ?? ''}`.trim() || '(Unnamed lead)';
                      const isSelected = selectedLeadId === l.id;
                      return (
                        <div 
                          key={l.id} 
                          onClick={() => setSelectedLeadId(isSelected ? null : l.id)}
                          style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', background: isSelected ? '#f0fdfa' : 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' }}
                          onMouseOver={(e) => { if(!isSelected) e.currentTarget.style.background = '#f8fafc' }}
                          onMouseOut={(e) => { if(!isSelected) e.currentTarget.style.background = 'white' }}
                        >
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '1.0625rem', color: '#0f172a' }}>{displayName}</div>
                            <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>{l.email ?? 'No email'} • {l.phone ?? 'No phone'}</div>
                          </div>
                          <button style={{ fontSize: '0.75rem', fontWeight: 800, color: isSelected ? 'white' : '#0c4c54', background: isSelected ? '#00bfa5' : '#e0f2f1', padding: '0.625rem 1.25rem', borderRadius: '100px', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>{isSelected ? 'SELECTED' : 'SELECT'}</button>
                        </div>
                      );
                    }) : (
                      <div style={{ padding: '3.5rem', textAlign: 'center', fontSize: '0.9375rem', color: '#64748b', background: 'white' }}>
                        <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.5rem' }}>📂</span>
                        {filteredLeads.length > 0 && eligibleLeads.length === 0 
                          ? "No eligible leads to book (all leads already have active appointments)."
                          : "No leads found yet. Create a new patient below."}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ marginBottom: '2.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.75rem' }}>
                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>First Name *</label>
                      <input 
                        placeholder="Michael"
                        value={newPatient.first} 
                        onChange={e => setNewPatient({...newPatient, first: e.target.value})}
                        style={{ width: '100%', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxSizing: 'border-box', outline: 'none', fontSize: '1rem', transition: 'all 0.2s' }} 
                        onFocus={e => e.currentTarget.style.borderColor = '#0c4c54'}
                        onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                      />
                    </div>
                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last Name *</label>
                      <input 
                        placeholder="Jordan"
                        value={newPatient.last} 
                        onChange={e => setNewPatient({...newPatient, last: e.target.value})}
                        style={{ width: '100%', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxSizing: 'border-box', outline: 'none', fontSize: '1rem', transition: 'all 0.2s' }} 
                        onFocus={e => e.currentTarget.style.borderColor = '#0c4c54'}
                        onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                      />
                    </div>
                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone Number *</label>
                      <input 
                        placeholder="(555) 000-0000"
                        value={newPatient.phone} 
                        onChange={e => setNewPatient({...newPatient, phone: e.target.value})}
                        style={{ width: '100%', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxSizing: 'border-box', outline: 'none', fontSize: '1rem', transition: 'all 0.2s' }} 
                        onFocus={e => e.currentTarget.style.borderColor = '#0c4c54'}
                        onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                      />
                    </div>
                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address (Optional)</label>
                      <input 
                        placeholder="patient@example.com"
                        value={newPatient.email} 
                        onChange={e => setNewPatient({...newPatient, email: e.target.value})}
                        style={{ width: '100%', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxSizing: 'border-box', outline: 'none', fontSize: '1rem', transition: 'all 0.2s' }} 
                        onFocus={e => e.currentTarget.style.borderColor = '#0c4c54'}
                        onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                      />
                    </div>
                  </div>
                  <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f0f9ff', borderRadius: '12px', border: '1px solid #e0f2fe', fontSize: '0.8125rem', color: '#0369a1', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span>💡</span>
                    A new lead record will be created for this practice upon confirmation.
                  </div>
                </div>
              )}

              {/* Appointment Notes */}
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.75rem', color: '#1e293b', fontWeight: 800, letterSpacing: '0.075em', marginBottom: '1.25rem', textTransform: 'uppercase' }}>Appointment Notes (Optional)</h4>
                <textarea 
                  placeholder="Add any internal notes, special requests, or instructions for this appointment..."
                  value={apptNotes}
                  onChange={(e) => setApptNotes(e.target.value)}
                  style={{ width: '100%', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0', minHeight: '100px', boxSizing: 'border-box', outline: 'none', fontSize: '1rem', background: '#fcfdfe', transition: 'all 0.2s', resize: 'vertical' }}
                  onFocus={e => e.currentTarget.style.borderColor = '#0c4c54'}
                  onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                />
              </div>
            </div>

            <div style={{ padding: '2rem 3rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '1rem', background: '#fcfdfe' }}>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ padding: '1rem 2rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: 700, color: '#64748b', transition: 'all 0.2s', fontSize: '1rem' }}
                onMouseOver={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
              >
                Cancel
              </button>
              {(() => {
                const isNewValid = newPatient.first && newPatient.last && newPatient.phone;
                const canConfirm = apiLoading ? false : (bookingMode === 'select' ? !!selectedLeadId : isNewValid);
                
                return (
                  <button 
                    onClick={() => handleConfirmBooking()}
                    disabled={!canConfirm}
                    style={{ 
                      padding: '1rem 2.5rem', borderRadius: '14px', border: 'none', 
                      background: canConfirm ? '#0c4c54' : '#f1f5f9', 
                      color: canConfirm ? 'white' : '#cbd5e1', 
                      cursor: canConfirm ? 'pointer' : 'not-allowed', 
                      fontWeight: 800, fontSize: '1.0625rem', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: canConfirm ? '0 8px 20px -4px rgba(12,76,84,0.3)' : 'none'
                    }}
                    onMouseOver={(e) => { if(canConfirm) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 24px -4px rgba(12,76,84,0.4)'; } }}
                    onMouseOut={(e) => { if(canConfirm) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 20px -4px rgba(12,76,84,0.3)'; } }}
                  >
                    {apiLoading ? 'Processing...' : 'Confirm Booking'}
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
