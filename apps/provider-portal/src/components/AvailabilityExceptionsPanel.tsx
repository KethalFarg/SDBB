import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { DataTable } from './DataTable';

interface AvailabilityException {
  id: string;
  practice_id: string;
  exception_date: string;
  start_time: string | null;
  end_time: string | null;
  is_available: boolean;
  reason: string | null;
  created_at: string;
}

interface Props {
  practiceId: string;
}

// Helper: Convert 12h components to 24h string "HH:MM"
const to24h = (hour: string, minute: string, ampm: string): string => {
  let h = parseInt(hour, 10);
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return `${h.toString().padStart(2, '0')}:${minute}`;
};

export function AvailabilityExceptionsPanel({ practiceId }: Props) {
  const [exceptions, setExceptions] = useState<AvailabilityException[]>([]);
  const [, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [date, setDate] = useState('');
  const [isAllDay, setIsAllDay] = useState(true);
  
  // Start time 12h parts
  const [startHour, setStartHour] = useState('9');
  const [startMin, setStartMin] = useState('00');
  const [startAmpm, setStartAmpm] = useState('AM');

  // End time 12h parts
  const [endHour, setEndHour] = useState('5');
  const [endMin, setEndMin] = useState('00');
  const [endAmpm, setEndAmpm] = useState('PM');

  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchExceptions = useCallback(async () => {
    if (!practiceId) return;
    setLoading(true);
    setError(null);
    try {
      const today = new Date().toISOString().split('T')[0];
      const sixtyDaysLater = new Date();
      sixtyDaysLater.setDate(sixtyDaysLater.getDate() + 60);
      const endRange = sixtyDaysLater.toISOString().split('T')[0];

      const { data, error: fetchErr } = await supabase
        .from('availability_exceptions')
        .select('*')
        .eq('practice_id', practiceId)
        .gte('exception_date', today)
        .lte('exception_date', endRange)
        .order('exception_date', { ascending: true })
        .order('start_time', { ascending: true, nullsFirst: true });

      if (fetchErr) throw fetchErr;
      setExceptions(data || []);
    } catch (err: any) {
      console.error('Error fetching exceptions:', err);
      setError('Could not load closures.');
    } finally {
      setLoading(false);
    }
  }, [practiceId]);

  useEffect(() => {
    fetchExceptions();
  }, [fetchExceptions]);

  const handleAddClosure = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!date) {
      setFormError('Date is required.');
      return;
    }

    let startTime24 = null;
    let endTime24 = null;

    if (!isAllDay) {
      startTime24 = to24h(startHour, startMin, startAmpm);
      endTime24 = to24h(endHour, endMin, endAmpm);

      if (startTime24 >= endTime24) {
        setFormError('End time must be after start time.');
        return;
      }
    }

    setSaving(true);
    try {
      const { error: insErr } = await supabase
        .from('availability_exceptions')
        .insert({
          practice_id: practiceId,
          exception_date: date,
          start_time: startTime24,
          end_time: endTime24,
          is_available: false, // It's a closure
          reason: note || null
        });

      if (insErr) throw insErr;

      // Reset form
      setDate('');
      setIsAllDay(true);
      setStartHour('9');
      setStartMin('00');
      setStartAmpm('AM');
      setEndHour('5');
      setEndMin('00');
      setEndAmpm('PM');
      setNote('');
      
      await fetchExceptions();
    } catch (err: any) {
      console.error('Error adding closure:', err);
      setFormError(err.message || 'Failed to add closure.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this closure?')) return;
    try {
      const { error: delErr } = await supabase
        .from('availability_exceptions')
        .delete()
        .eq('id', id);

      if (delErr) throw delErr;
      await fetchExceptions();
    } catch (err: any) {
      console.error('Error deleting closure:', err);
      alert('Failed to remove closure.');
    }
  };

  const formatTime = (time: string | null) => {
    if (!time) return '';
    const [h, m] = time.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const minutes = ['00', '15', '30', '45'];

  return (
    <div style={{ marginTop: '3rem' }}>
      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--color-text-main)' }}>One-time closures</h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
        Use this to block NEW PATIENT booking on specific dates without changing your weekly schedule.
      </p>

      {error && (
        <div style={{ 
          background: '#fff7ed', 
          color: '#9a3412', 
          padding: '0.75rem 1rem', 
          borderRadius: '8px', 
          border: '1px solid #fed7aa', 
          marginBottom: '1.5rem',
          fontSize: '0.875rem'
        }}>
          {error}
        </div>
      )}

      <div className="card" style={{ marginBottom: '2rem' }}>
        <form onSubmit={handleAddClosure}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
            <div className="form-group">
              <label>Date *</label>
              <input 
                type="date" 
                className="form-control" 
                value={date} 
                onChange={e => setDate(e.target.value)} 
                required 
                disabled={saving}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', marginTop: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', margin: 0 }}>
                <input 
                  type="checkbox" 
                  checked={isAllDay} 
                  onChange={e => setIsAllDay(e.target.checked)} 
                  disabled={saving}
                  style={{ width: '1.125rem', height: '1.125rem' }}
                />
                <span style={{ fontSize: '0.9375rem', fontWeight: 500 }}>All day closure</span>
              </label>
            </div>

            {!isAllDay && (
              <>
                <div className="form-group">
                  <label>Start time</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select className="form-control" value={startHour} onChange={e => setStartHour(e.target.value)} disabled={saving} style={{ padding: '0.5rem' }}>
                      {hours.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <select className="form-control" value={startMin} onChange={e => setStartMin(e.target.value)} disabled={saving} style={{ padding: '0.5rem' }}>
                      {minutes.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <select className="form-control" value={startAmpm} onChange={e => setStartAmpm(e.target.value)} disabled={saving} style={{ padding: '0.5rem' }}>
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>End time</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select className="form-control" value={endHour} onChange={e => setEndHour(e.target.value)} disabled={saving} style={{ padding: '0.5rem' }}>
                      {hours.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <select className="form-control" value={endMin} onChange={e => setEndMin(e.target.value)} disabled={saving} style={{ padding: '0.5rem' }}>
                      {minutes.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <select className="form-control" value={endAmpm} onChange={e => setEndAmpm(e.target.value)} disabled={saving} style={{ padding: '0.5rem' }}>
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Note (Optional)</label>
              <textarea 
                className="form-control" 
                value={note} 
                onChange={e => setNote(e.target.value)} 
                disabled={saving}
                placeholder="Holiday, office maintenance, etc."
                style={{ minHeight: '80px', resize: 'vertical' }}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: '0.5rem', marginBottom: 0 }}>
                Times are local to your clinic.
              </p>
            </div>
          </div>

          {formError && (
            <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '1rem', marginBottom: 0 }}>{formError}</p>
          )}

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={saving}
              style={{ padding: '0.625rem 1.5rem' }}
            >
              {saving ? 'Adding...' : 'Add closure'}
            </button>
          </div>
        </form>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)' }}>
          <h4 style={{ margin: 0, fontSize: '1rem' }}>Upcoming Closures</h4>
        </div>
        <DataTable
          headers={['Date', 'Time Range', 'Note', 'Created']}
          empty={exceptions.length === 0}
          onEmpty={<div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>No upcoming closures.</div>}
        >
          {exceptions.map(ex => (
            <tr key={ex.id}>
              <td style={{ fontWeight: 600 }}>{formatDate(ex.exception_date)}</td>
              <td>
                {(!ex.start_time || !ex.end_time) ? (
                  <span className="status-pill status-neutral">All day</span>
                ) : (
                  <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                    {formatTime(ex.start_time)} – {formatTime(ex.end_time)}
                  </span>
                )}
              </td>
              <td style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {ex.reason || <span style={{ opacity: 0.5 }}>—</span>}
              </td>
              <td style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                {new Date(ex.created_at).toLocaleDateString()}
              </td>
              <td style={{ textAlign: 'right' }}>
                <button 
                  onClick={() => handleRemove(ex.id)}
                  className="btn btn-outline btn-sm"
                  style={{ color: '#dc2626', borderColor: 'rgba(220, 38, 38, 0.2)' }}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </DataTable>
      </div>
    </div>
  );
}
