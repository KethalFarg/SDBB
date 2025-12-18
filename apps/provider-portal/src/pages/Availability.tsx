import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useSession } from '../hooks/useSession';
import { usePracticeId } from '../hooks/usePracticeId';

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

/**
 * Availability Component
 * Implementation: WEEKLY RECURRING TEMPLATE (Option A)
 * 
 * Override Model (Future):
 * 1. System checks 'availability_blocks' for the recurring weekly template.
 * 2. System checks 'availability_exceptions' for date-specific overrides (vacations, specific date openings).
 * 
 * This component currently manages only the recurring weekly template.
 */
export function Availability() {
  const { session } = useSession();
  const { practiceId, loading: loadingPractice, error: practiceError } = usePracticeId();
  const [blocks, setBlocks] = useState<AvailabilityBlock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [dayOfWeek, setDayOfWeek] = useState(1); // Default Monday
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [type, setType] = useState('new_patient');
  const [submitting, setSubmitting] = useState(false);

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

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!practiceId) return;
    
    // Simple validation
    if (startTime >= endTime) {
      alert('End time must be after start time.');
      return;
    }

    // Overlap validation (client-side)
    const dayBlocks = blocks.filter(b => b.day_of_week === dayOfWeek);
    const hasOverlap = dayBlocks.some(block => {
      // time comparison using HH:MM string comparison is safe for 'HH:MM' format
      // but let's ensure we are comparing against full time strings if needed
      // DB returns HH:MM:SS or HH:MM
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

      // Reset form (keep day for convenience)
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
      const { error } = await supabase
        .from('availability_blocks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchBlocks();
    } catch (err: any) {
      alert(err.message || 'Failed to delete block.');
    }
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
        <h2 style={{ marginBottom: 0 }}>Practice Availability</h2>
        <button onClick={fetchBlocks} className="btn btn-outline btn-sm" disabled={loading}>Refresh</button>
      </div>
      <p style={{ color: 'var(--color-text-muted)', marginTop: '-1.5rem', marginBottom: '2rem' }}>Manage the time blocks when you are available for patient appointments.</p>

      {(error || practiceError) && (
        <div className="card" style={{ color: '#991b1b', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', marginBottom: '2rem' }}>
          {error || practiceError}
        </div>
      )}

      {/* Add Block Form */}
      <div className="card" style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem' }}>Add New Time Block</h3>
        <form onSubmit={handleAddBlock} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', alignItems: 'end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Day of Week</label>
            <select 
              className="form-control" 
              value={dayOfWeek} 
              onChange={e => setDayOfWeek(parseInt(e.target.value))}
              disabled={submitting}
            >
              {DAYS.map((day, idx) => (
                <option key={day} value={idx}>{day}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Start Time</label>
            <input 
              type="time" 
              className="form-control" 
              value={startTime} 
              onChange={e => setStartTime(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>End Time</label>
            <input 
              type="time" 
              className="form-control" 
              value={endTime} 
              onChange={e => setEndTime(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Block Type</label>
            <select 
              className="form-control" 
              value={type} 
              onChange={e => setType(e.target.value)}
              disabled={submitting}
            >
              <option value="new_patient">New Patient</option>
              <option value="follow_up">Follow Up</option>
              <option value="consultation">Consultation</option>
            </select>
          </div>

          <div>
            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%' }}>
              {submitting ? 'Adding...' : 'Add Block'}
            </button>
          </div>
        </form>
      </div>

      {/* Blocks List Grouped by Day */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading availability...</div>
      ) : (
        <div className="dashboard-sections">
          {DAYS.map((day, dayIdx) => {
            const dayBlocks = blocks.filter(b => b.day_of_week === dayIdx);
            
            return (
              <div key={day} className="card" style={{ padding: '1.5rem 0', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '0 1.5rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '1.125rem' }}>{day}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                    {dayBlocks.length} {dayBlocks.length === 1 ? 'block' : 'blocks'}
                  </span>
                </div>

                <div className="table-container" style={{ border: 'none', borderRadius: 0, flex: 1 }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Type</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {dayBlocks.length === 0 ? (
                        <tr>
                          <td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-light)', fontSize: '0.875rem' }}>
                            No blocks scheduled
                          </td>
                        </tr>
                      ) : (
                        dayBlocks.map(block => (
                          <tr key={block.id}>
                            <td style={{ fontWeight: 600 }}>
                              {block.start_time.slice(0, 5)} – {block.end_time.slice(0, 5)}
                            </td>
                            <td style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                              {block.type.replace('_', ' ')}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <button 
                                onClick={() => handleDeleteBlock(block.id)}
                                className="btn btn-outline"
                                style={{ padding: '0.25rem 0.5rem', color: '#ef4444', borderColor: '#fee2e2' }}
                                title="Delete block"
                              >
                                &times;
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
