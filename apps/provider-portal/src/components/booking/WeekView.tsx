import { useMemo } from 'react';
import { CalendarDays, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

type AvailabilityBlock = {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  type: string;
};

type Appointment = {
  id: string;
  lead_id: string;
  start_time: string;
  end_time: string;
  status: string;
  leads: {
    first_name: string | null;
    last_name: string | null;
  } | null;
};

interface Props {
  availability: AvailabilityBlock[];
  appointments: Appointment[];
  timezone: string;
  onSelectSlot: (date: string, startTime: string, endTime: string) => void;
}

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

// Helper: Map grid column index (0=Mon...6=Sun) to DB day_of_week (0=Sun...6=Sat)
const dbDowForColumnIndex = (colIndex: number) => (colIndex === 6 ? 0 : colIndex + 1);

export function WeekView({ availability, appointments, timezone, onSelectSlot }: Props) {
  // Compute the dates for the week view in the practice timezone
  const weekDates = useMemo(() => {
    // 1. Get current time in practice timezone
    const now = new Date();
    const tzNowStr = now.toLocaleString('en-US', { timeZone: timezone });
    const tzNow = new Date(tzNowStr);
    
    // 2. Determine reference date
    // If today is Sunday (0), we want the week view to start tomorrow (Monday)
    const isSunday = tzNow.getDay() === 0;
    const refDate = new Date(tzNow);
    if (isSunday) {
      refDate.setDate(tzNow.getDate() + 1);
    }
    
    // 3. Find Monday of the reference week
    const day = refDate.getDay(); // 0 (Sun) to 6 (Sat)
    // In our refDate logic, day will be 1 (Mon) if it was Sunday and we added 1
    const diff = refDate.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(refDate.setDate(diff));
    
    console.log('[ProviderWeekView] today/ref/weekStart', { 
      today: tzNow.toISOString(), 
      isSunday,
      ref: refDate.toISOString(), 
      weekStart: monday.toISOString() 
    });

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      // Format as YYYY-MM-DD
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const da = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${da}`;
    });
  }, [timezone]);

  const blocksByDay = useMemo(() => {
    const days = Array.from({ length: 7 }, () => [] as any[]);

    // Add availability blocks for each day of the week
    weekDates.forEach((dateStr, colIdx) => {
      const dbDay = dbDowForColumnIndex(colIdx);

      availability.filter(b => Number(b.day_of_week) === dbDay).forEach(b => {
        days[colIdx].push({
          id: b.id,
          start: b.start_time.slice(0, 5),
          end: b.end_time.slice(0, 5),
          type: 'open',
          label: b.type === 'new_patient' ? 'New Patients' : 'Open',
          sortKey: b.start_time,
          date: dateStr
        });
      });
    });

    // Add appointments that fall within this week
    appointments.filter(a => a.status !== 'canceled').forEach(a => {
      const date = new Date(a.start_time);
      // Convert start_time to practice timezone for comparison
      const tzStartStr = date.toLocaleString('en-US', { timeZone: timezone });
      const tzStart = new Date(tzStartStr);
      
      const y = tzStart.getFullYear();
      const m = String(tzStart.getMonth() + 1).padStart(2, '0');
      const d = String(tzStart.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;
      
      const dayIdx = weekDates.indexOf(dateStr);
      
      if (dayIdx !== -1) {
        const start = tzStart.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
        const end = new Date(a.end_time).toLocaleTimeString('en-US', { timeZone: timezone, hour12: false, hour: '2-digit', minute: '2-digit' });
        
        days[dayIdx].push({
          id: a.id,
          lead_id: a.lead_id,
          start,
          end,
          type: 'booked',
          label: a.leads ? `${a.leads.first_name} ${a.leads.last_name}` : 'Booked',
          status: a.status,
          sortKey: start,
          date: dateStr
        });
      }
    });

    // Sort each day by start time
    days.forEach(day => {
      day.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    });

    return days;
  }, [availability, appointments, weekDates, timezone]);

  const formatTime = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  if (availability.length === 0 && appointments.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '12px', border: '2px dashed var(--color-border)' }}>
        <div style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}><CalendarDays size={48} /></div>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Schedule Found</h3>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>Set your practice availability to start accepting bookings.</p>
        <Link to="/availability" className="btn btn-primary">Go to Availability</Link>
      </div>
    );
  }

  return (
    <div className="week-view">
      {/* Legend */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', fontSize: '0.8125rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--color-accent-soft)', border: '1px solid var(--color-accent)' }}></div>
          <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Available</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--color-primary)', opacity: 0.1, border: '1px solid var(--color-primary)' }}></div>
          <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Booked</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
        {DAYS.slice(0, 6).map((day, idx) => (
          <div key={day} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ paddingBottom: '0.5rem', borderBottom: '2px solid var(--color-border)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>{day}</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-light)', marginTop: '0.125rem' }}>
                {new Date(weekDates[idx] + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {blocksByDay[idx].length === 0 ? (
                <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-light)', fontStyle: 'italic' }}>
                  No slots
                </div>
              ) : (
                blocksByDay[idx].map((block: any, bIdx: number) => (
                  <div 
                    key={`${block.id}-${bIdx}`}
                    onClick={() => block.type === 'open' && onSelectSlot(block.date, block.start, block.end)}
                    style={{ 
                      padding: '0.75rem', 
                      borderRadius: '8px',
                      background: block.type === 'booked' ? 'white' : 'var(--color-accent-soft)',
                      border: `1px solid ${block.type === 'booked' ? 'var(--color-border)' : 'var(--color-accent)'}`,
                      boxShadow: block.type === 'booked' ? 'var(--shadow-sm)' : 'none',
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: block.type === 'open' ? 'pointer' : 'default',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseOver={(e) => {
                      if (block.type === 'open') {
                        e.currentTarget.style.background = 'rgba(0, 229, 255, 0.2)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (block.type === 'open') {
                        e.currentTarget.style.background = 'var(--color-accent-soft)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    {block.type === 'booked' && (
                      <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', background: 'var(--color-primary)' }}></div>
                    )}
                    
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: block.type === 'booked' ? 'var(--color-primary)' : '#0098B3', marginBottom: '0.25rem' }}>
                      {block.label}
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                      <Clock size={12} />
                      {formatTime(block.start)} - {formatTime(block.end)}
                    </div>

                    {block.type === 'booked' && block.lead_id && (
                      <Link 
                        to={`/leads/${block.lead_id}`}
                        style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-primary-light)' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        View Details &rarr;
                      </Link>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

