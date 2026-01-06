import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { useSession } from '../hooks/useSession';
import { usePracticeId } from '../hooks/usePracticeId';
import { PageShell } from '../components/PageShell';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { DataTable } from '../components/DataTable';
import { AvailabilityExceptionsPanel } from '../components/AvailabilityExceptionsPanel';

type AvailabilityBlock = {
  id: string;
  practice_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  type: string;
};

const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

const RENDER_DAYS = [1, 2, 3, 4, 5, 6]; // Monday through Saturday

// Helper: Convert "HH:MM" or "HH:MM:SS" to minutes since midnight
const timeToMinutes = (timeStr: string): number => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

// Helper: Convert minutes to "HH:MM" (24-hour)
const minutesToTime = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

// Helper: Format time label for UI (12h or 24h)
const formatTimeLabel = (minutes: number, is12h: boolean): string => {
  if (!is12h) return minutesToTime(minutes);
  
  const h24 = Math.floor(minutes / 60);
  const m = minutes % 60;
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 || 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
};

// Helper: Build slots for the grid (7 AM to 7 PM)
const START_MIN = 7 * 60; // 7:00 AM
const END_MIN = 19 * 60; // 7:00 PM
const SLOT_STEP = 15; // 15-minute intervals for flexible start times
const TOGGLE_DURATION = 60; // Every click toggles exactly 1 hour

export function Availability() {
  const { session } = useSession();
  const { practiceId, loading: loadingPractice, error: practiceError } = usePracticeId();
  const [blocks, setBlocks] = useState<AvailabilityBlock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Grid / Toggle states
  const [gridType, setGridType] = useState('available');
  const [savingSlot, setSavingSlot] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // 12-hour vs 24-hour preference
  const [use12h, setUse12h] = useState(() => {
    const saved = localStorage.getItem('sd_pref_12h');
    return saved === null ? true : saved === 'true';
  });

  // Advanced form state
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [type, setType] = useState('new_patient');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    localStorage.setItem('sd_pref_12h', String(use12h));
  }, [use12h]);

  useEffect(() => {
    if (!practiceId) return;
    fetchBlocks();
  }, [practiceId]);

  const fetchBlocks = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: blocksError } = await supabase
        .from('availability_blocks')
        .select('id, practice_id, day_of_week, start_time, end_time, type')
        .eq('practice_id', practiceId)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });

      if (blocksError) throw blocksError;
      setBlocks(data || []);
    } catch (err: any) {
      console.error('Error fetching availability:', err);
      setError(err.message || 'Failed to load availability data.');
    } finally {
      setLoading(false);
    }
  };

  const isSlotCovered = (dayIdx: number, slotStartMin: number) => {
    const slotEndMin = slotStartMin + SLOT_STEP;
    return blocks.find(b => {
      if (b.day_of_week !== dayIdx) return false;
      const bStart = timeToMinutes(b.start_time);
      const bEnd = timeToMinutes(b.end_time);
      // Slot is covered if it's within block range
      return slotStartMin >= bStart && slotEndMin <= bEnd;
    });
  };

  const toggleSlot = async (dayIdx: number, slotStartMin: number) => {
    if (savingSlot || !practiceId) return;
    
    setSavingSlot(true);
    setSaveError(null);
    const slotEndMin = slotStartMin + TOGGLE_DURATION;
    const slotStartStr = minutesToTime(slotStartMin);
    const slotEndStr = minutesToTime(slotEndMin);
    
    const coveringBlock = isSlotCovered(dayIdx, slotStartMin);

    try {
      if (coveringBlock) {
        // REMOVE ENTIRE BLOCK - This ensures no 15-min fragments are accidentally left behind.
        // If you click anywhere in a block, the whole block is removed.
        const { error: delErr } = await supabase
          .from('availability_blocks')
          .delete()
          .eq('id', coveringBlock.id);
        if (delErr) throw delErr;
      } else {
        // ADD 60 MINUTES OF AVAILABILITY
        // This provides the "One Click = One Hour" behavior the user requested.
        const { error: insErr } = await supabase
          .from('availability_blocks')
          .insert({
            practice_id: practiceId,
            day_of_week: dayIdx,
            start_time: slotStartStr,
            end_time: slotEndStr,
            type: gridType
          });
        if (insErr) throw insErr;

        // MERGE adjacent blocks of SAME type on SAME day
        // This allows providers to build longer shifts (2h, 3h, etc.) by clicking back-to-back.
        const { data: refreshedDayBlocks } = await supabase
          .from('availability_blocks')
          .select('*')
          .eq('practice_id', practiceId)
          .eq('day_of_week', dayIdx)
          .eq('type', gridType)
          .order('start_time', { ascending: true });
// ...

        if (refreshedDayBlocks && refreshedDayBlocks.length > 1) {
          for (let i = 0; i < refreshedDayBlocks.length - 1; i++) {
            const current = refreshedDayBlocks[i];
            const next = refreshedDayBlocks[i + 1];
            if (current.end_time.slice(0, 5) === next.start_time.slice(0, 5)) {
              // Merge next into current
              const { error: mergeUpd } = await supabase
                .from('availability_blocks')
                .update({ end_time: next.end_time })
                .eq('id', current.id);
              if (mergeUpd) throw mergeUpd;

              const { error: mergeDel } = await supabase
                .from('availability_blocks')
                .delete()
                .eq('id', next.id);
              if (mergeDel) throw mergeDel;
              
              // Shift array to continue merging if needed
              refreshedDayBlocks.splice(i + 1, 1);
              i--; // Re-check current with new next
            }
          }
        }
      }
      await fetchBlocks();
    } catch (err: any) {
      console.error('Toggle error:', err);
      setSaveError(err.message || 'Failed to update slot.');
    } finally {
      setSavingSlot(false);
    }
  };

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!practiceId) return;
    
    if (startTime >= endTime) {
      alert('End time must be after start time.');
      return;
    }

    const hasOverlap = blocks.filter(b => b.day_of_week === dayOfWeek).some(block => {
      const start = block.start_time.slice(0, 5);
      const end = block.end_time.slice(0, 5);
      return (startTime < end && endTime > start);
    });

    if (hasOverlap) {
      alert('This time block overlaps with an existing block on the same day.');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('availability_blocks')
        .insert({
          practice_id: practiceId,
          day_of_week: dayOfWeek,
          start_time: startTime,
          end_time: endTime,
          type
        });

      if (error) throw error;
      setStartTime('09:00');
      setEndTime('17:00');
      await fetchBlocks();
    } catch (err: any) {
      alert(err.message || 'Failed to add block.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBlock = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this availability block?')) return;
    try {
      const { error } = await supabase.from('availability_blocks').delete().eq('id', id);
      if (error) throw error;
      await fetchBlocks();
    } catch (err: any) {
      alert(err.message || 'Failed to delete block.');
    }
  };

  const timeSlots = useMemo(() => {
    const slots = [];
    for (let m = START_MIN; m < END_MIN; m += SLOT_STEP) {
      slots.push(m);
    }
    return slots;
  }, []);

  if (!session || loadingPractice || (loading && blocks.length === 0)) return <LoadingState />;
  if (error || practiceError) return <ErrorState message={error || practiceError || ''} retry={fetchBlocks} />;

  if (!practiceId) {
    return (
      <PageShell title="Availability">
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h2 style={{ color: 'var(--color-text-main)', marginBottom: '1rem' }}>No Practice Assigned</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>You must be linked to a practice to manage availability.</p>
          <p>Contact system support if you believe this is an error.</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell 
      title="Practice Availability" 
      subtitle="Manage your recurring weekly schedule using the grid below."
      actions={
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {savingSlot && <span style={{ fontSize: '0.875rem', color: 'var(--color-primary)' }}>Saving...</span>}
          {saveError && <span style={{ fontSize: '0.875rem', color: '#ef4444' }}>{saveError}</span>}
          <button onClick={fetchBlocks} className="btn btn-outline btn-sm" disabled={loading || savingSlot}>Refresh</button>
        </div>
      }
    >
      {/* Grid Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem', color: 'var(--color-text-main)' }}>Weekly Availability</h3>
            <p style={{ fontSize: '0.875rem', margin: 0, color: 'var(--color-text-main)' }}>Click any 15-minute slot to add a <strong>1-hour</strong> availability block.</p>
            <p style={{ fontSize: '0.75rem', margin: '0.25rem 0 0 0', color: 'var(--color-text-muted)' }}>Clicking an existing block will remove it entirely. Back-to-back clicks will merge into longer blocks.</p>
          </div>

          <div style={{ display: 'flex', gap: '2rem' }}>
            <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: 'var(--color-primary-light)' }}></div>
              <span>Available</span>
            </div>
            <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: '#f1f5f9', border: '1px solid var(--color-border)' }}></div>
              <span>Unavailable</span>
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
              Click a time slot to toggle availability
            </div>
          </div>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer', color: 'var(--color-text-main)', fontWeight: 500 }}>
            <input 
              type="checkbox" 
              checked={use12h} 
              onChange={e => setUse12h(e.target.checked)}
              style={{ width: '1rem', height: '1rem', cursor: 'pointer' }}
            />
            12-hour time (AM/PM)
          </label>
        </div>

        <div className="form-group" style={{ marginBottom: 0, minWidth: '200px' }}>
          <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '0.25rem', display: 'block' }}>Type for new slots</label>
          <select className="form-control" value={gridType} onChange={e => setGridType(e.target.value)} disabled={savingSlot}>
            <option value="available">Available (General)</option>
            <option value="new_patient">New Patients Only</option>
            <option value="follow_up">Follow Up Only</option>
          </select>
        </div>
      </div>

      {/* Weekly Grid */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--color-border)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: '800px' }}>
            <thead>
              <tr>
                <th style={{ width: '100px', padding: '1rem', borderBottom: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)', backgroundColor: '#f8fafc' }}></th>
                {RENDER_DAYS.map((dayIdx) => (
                  <th key={DAYS[dayIdx]} style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-main)', backgroundColor: '#f8fafc' }}>
                    {DAYS[dayIdx]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((m) => (
                <tr key={m}>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)', fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center', backgroundColor: '#f8fafc', fontWeight: 500 }}>
                    {formatTimeLabel(m, use12h)}
                  </td>
                  {RENDER_DAYS.map((dayIdx) => {
                    const block = isSlotCovered(dayIdx, m);
                    const isAvailable = !!block;
                    const bStart = isAvailable ? timeToMinutes(block.start_time) : 0;
                    const bEnd = isAvailable ? timeToMinutes(block.end_time) : 0;
                    const isStart = isAvailable && bStart === m;
                    const isLastSlot = isAvailable && bEnd === m + SLOT_STEP;
                    
                    const slotLabel = formatTimeLabel(m, use12h);
                    return (
                      <td 
                        key={`${dayIdx}-${m}`} 
                        onClick={() => toggleSlot(dayIdx, m)}
                        style={{ 
                          padding: 0, 
                          height: '32px', // Compact rows for 15-min intervals
                          borderBottom: m % 60 === 45 ? '2px solid var(--color-border)' : '1px solid var(--color-border-light)', 
                          borderRight: '1px solid var(--color-border)',
                          backgroundColor: isAvailable ? 'var(--color-primary-light)' : 'transparent',
                          cursor: savingSlot ? 'wait' : 'pointer',
                          transition: 'all 0.1s ease',
                          position: 'relative'
                        }}
                        title={isAvailable ? `${block.type.replace('_', ' ')}: ${formatTimeLabel(bStart, use12h)} – ${formatTimeLabel(bEnd, use12h)}` : `Add 1-hour availability starting at ${slotLabel}`}
                      >
                        {isAvailable && (
                          <div style={{ 
                            position: 'absolute', 
                            top: isStart ? '2px' : 0, 
                            left: '2px', 
                            right: '2px', 
                            bottom: isLastSlot ? '2px' : 0,
                            background: 'var(--color-primary)',
                            borderRadius: isStart && isLastSlot ? '4px' : isStart ? '4px 4px 0 0' : isLastSlot ? '0 0 4px 4px' : '0',
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            fontSize: '0.625rem', 
                            color: 'white',
                            zIndex: 1
                          }}>
                            {isStart && (block.type === 'new_patient' ? 'NP' : block.type === 'follow_up' ? 'FU' : 'AV')}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Advanced Section */}
      <div style={{ marginTop: '3rem' }}>
        <button 
          onClick={() => setAdvancedOpen(!advancedOpen)}
          className="btn btn-outline btn-sm"
          style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          {advancedOpen ? 'Hide Advanced Options' : 'Show Advanced Options'}
          <span style={{ transform: advancedOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
        </button>

        {advancedOpen && (
          <div className="fade-in">
            <div className="card" style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem' }}>Manual Time Block Entry</h3>
              <form onSubmit={handleAddBlock} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', alignItems: 'end' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Day of Week</label>
                  <select className="form-control" value={dayOfWeek} onChange={e => setDayOfWeek(parseInt(e.target.value))} disabled={submitting}>
                    {RENDER_DAYS.map((dayIdx) => <option key={DAYS[dayIdx]} value={dayIdx}>{DAYS[dayIdx]}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Start Time</label>
                  <input type="time" className="form-control" value={startTime} onChange={e => setStartTime(e.target.value)} disabled={submitting} required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>End Time</label>
                  <input type="time" className="form-control" value={endTime} onChange={e => setEndTime(e.target.value)} disabled={submitting} required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Block Type</label>
                  <select className="form-control" value={type} onChange={e => setType(e.target.value)} disabled={submitting}>
                    <option value="available">Available (General)</option>
                    <option value="new_patient">New Patients Only</option>
                    <option value="follow_up">Follow Up Only</option>
                  </select>
                </div>
                <div><button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%' }}>{submitting ? 'Adding...' : 'Add Block'}</button></div>
              </form>
            </div>

            <div className="dashboard-sections">
              {RENDER_DAYS.map((dayIdx) => {
                const day = DAYS[dayIdx];
                const dayBlocks = blocks.filter(b => b.day_of_week === dayIdx);
                if (dayBlocks.length === 0) return null;
                return (
                  <div key={`${day}-list`} className="card" style={{ padding: '1.5rem 0' }}>
                    <div style={{ padding: '0 1.5rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ margin: 0, fontSize: '1.125rem' }}>{day} Blocks</h3>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>{dayBlocks.length} total</span>
                    </div>
                    <DataTable 
                      headers={['Time', 'Type', '']} 
                      empty={dayBlocks.length === 0}
                    >
                      {dayBlocks.map(block => (
                        <tr key={block.id}>
                          <td style={{ fontWeight: 600 }}>
                            {formatTimeLabel(timeToMinutes(block.start_time), use12h)} – {formatTimeLabel(timeToMinutes(block.end_time), use12h)}
                          </td>
                          <td style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>{block.type.replace('_', ' ')}</td>
                          <td style={{ textAlign: 'right' }}>
                            <button onClick={() => handleDeleteBlock(block.id)} className="btn btn-outline" style={{ color: '#ef4444', borderColor: '#fee2e2' }}>&times;</button>
                          </td>
                        </tr>
                      ))}
                    </DataTable>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* One-time closures */}
      <AvailabilityExceptionsPanel practiceId={practiceId} />
    </PageShell>
  );
}
