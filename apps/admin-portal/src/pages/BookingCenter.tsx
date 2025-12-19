import React, { useState, useMemo } from 'react';

// Mock Data
const MOCK_PRACTICES = [
  { id: '1', name: 'Westside Spinal Center' },
  { id: '2', name: 'Downtown Wellness' },
  { id: '3', name: 'North Valley Clinic' },
];

const MOCK_LEADS = [
  { id: 'l1', first_name: 'John', last_name: 'Doe', phone: '555-0101', email: 'john@example.com' },
  { id: 'l2', first_name: 'Jane', last_name: 'Smith', phone: '555-0102', email: 'jane@example.com' },
  { id: 'l3', first_name: 'Bob', last_name: 'Johnson', phone: '555-0103', email: 'bob@example.com' },
  { id: 'l4', first_name: 'Alice', last_name: 'Williams', phone: '555-0104', email: 'alice@example.com' },
  { id: 'l5', first_name: 'Charlie', last_name: 'Brown', phone: '555-0105', email: 'charlie@example.com' },
];

// Helper: 12-hour AM/PM
const format12h = (minutes: number) => {
  const h24 = Math.floor(minutes / 60);
  const m = minutes % 60;
  const h12 = h24 % 12 || 12;
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
};

const START_MIN = 7 * 60; // 7:00 AM
const END_MIN = 18 * 60; // 6:00 PM
const STEP = 15;

export function BookingCenter() {
  const [selectedPractice, setSelectedPractice] = useState(MOCK_PRACTICES[0].id);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<Record<number, string>>({
    [9 * 60]: 'Scheduled Patient',
    [9 * 60 + 15]: 'Scheduled Patient',
    [14 * 60]: 'Mark Wilson',
    [14 * 60 + 15]: 'Mark Wilson',
  });
  const [searchTerm, setSearchQuery] = useState('');
  const [duration, setDuration] = useState(30);
  
  // Form for new patient
  const [newPatient, setNewPatient] = useState({ first: '', last: '', phone: '', email: '' });

  const slots = useMemo(() => {
    const s = [];
    for (let m = START_MIN; m < END_MIN; m += STEP) {
      s.push(m);
    }
    return s;
  }, []);

  // Mock slot state logic
  const getSlotState = (m: number) => {
    if (bookedSlots[m]) return 'booked';
    if (m >= 12 * 60 && m < 13 * 60) return 'closed'; // Lunch
    
    // Mock some static unavailable slots
    if (m === 10 * 60 || m === 10 * 60 + 15 || m === 15 * 60 + 30) return 'unavailable';
    
    return 'available';
  };

  const handleSlotClick = (m: number) => {
    const state = getSlotState(m);
    if (state === 'available') {
      setSelectedSlot(m);
    }
  };

  const handleConfirmBooking = (leadName: string) => {
    // Book slots based on duration
    const newBooked = { ...bookedSlots };
    for (let i = 0; i < duration; i += STEP) {
      newBooked[selectedSlot! + i] = leadName;
    }
    setBookedSlots(newBooked);
    setIsModalOpen(false);
    setSelectedSlot(null);
    setNewPatient({ first: '', last: '', phone: '', email: '' });
    setSearchQuery('');
    
    // TODO: In real integration, call API to create appointment and lead
    console.info(`Confirmed booking for ${leadName} starting at ${format12h(selectedSlot!)} for ${duration} minutes.`);
  };

  const filteredLeads = MOCK_LEADS.filter(l => 
    `${l.first_name} ${l.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.phone.includes(searchTerm)
  );

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: '#0c4c54' }}>Booking Center</h1>
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748b' }}>Book appointments for patients in real time</p>
          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0c4c54', fontWeight: 600, fontSize: '0.875rem' }}>
            <span style={{ background: '#e0f2f1', padding: '0.25rem 0.75rem', borderRadius: '100px', border: '1px solid #b2dfdb' }}>
              Times shown in Eastern Time (ET)
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select 
            value={selectedPractice} 
            onChange={(e) => setSelectedPractice(e.target.value)}
            style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', outline: 'none' }}
          >
            {MOCK_PRACTICES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button 
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: 500 }}
          >
            Today
          </button>
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0', outline: 'none' }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>
        {/* Left: Day Calendar */}
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>Schedule — {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
            <div style={{ display: 'flex', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 500, color: '#64748b' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#00bfa5' }} /> Available
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 500, color: '#64748b' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#f1f5f9', border: '1px solid #e2e8f0' }} /> Booked
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 500, color: '#64748b' }}>
                <div style={{ 
                  width: '12px', height: '12px', borderRadius: '3px', background: '#fef2f2', border: '1px solid #fee2e2',
                  backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(254,226,226,0.5) 3px, rgba(254,226,226,0.5) 6px)' 
                }} /> Closed
              </div>
            </div>
          </div>
          
          <div style={{ maxHeight: '750px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {slots.map(m => {
                  const state = getSlotState(m);
                  const isSelected = selectedSlot === m;
                  const timeLabel = m % 60 === 0 ? format12h(m) : '';
                  
                  return (
                    <tr key={m} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ 
                        width: '100px', padding: '0.75rem 1rem', fontSize: '0.75rem', 
                        color: m % 60 === 0 ? '#0f172a' : '#94a3b8', 
                        textAlign: 'right', background: '#f8fafc', fontWeight: m % 60 === 0 ? 700 : 400 
                      }}>
                        {timeLabel || format12h(m).split(':')[1].substring(0, 2)}
                      </td>
                      <td 
                        onClick={() => handleSlotClick(m)}
                        title={state === 'available' ? 'Available — Click to book' : undefined}
                        style={{ 
                          padding: '0.75rem 1.5rem', 
                          cursor: state === 'available' ? 'pointer' : 'default',
                          transition: 'all 0.15s',
                          background: isSelected ? '#e0f2f1' : state === 'booked' ? '#f8fafc' : state === 'closed' ? '#fffbfc' : 'transparent',
                          position: 'relative'
                        }}
                        onMouseOver={(e) => { if(state === 'available') e.currentTarget.style.background = isSelected ? '#e0f2f1' : '#f0fdfa' }}
                        onMouseOut={(e) => { if(state === 'available') e.currentTarget.style.background = isSelected ? '#e0f2f1' : 'transparent' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.8125rem', color: isSelected ? '#00796b' : '#94a3b8' }}>
                            {m % 60 !== 0 ? format12h(m).split(' ')[0] : ''}
                          </span>
                          
                          {state === 'booked' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', background: '#fff', padding: '3px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                {bookedSlots[m]}
                              </span>
                            </div>
                          )}
                          
                          {state === 'closed' && (
                            <span style={{ fontSize: '0.75rem', color: '#b91c1c', fontWeight: 500, background: '#fff', padding: '2px 8px', borderRadius: '4px', border: '1px solid #fee2e2' }}>
                              Office Closed
                            </span>
                          )}

                          {state === 'unavailable' && (
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>—</span>
                          )}

                          {state === 'available' && !isSelected && (
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00bfa5', opacity: 0.3 }} />
                          )}
                          
                          {isSelected && (
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#00796b' }}>SELECTED</span>
                          )}
                        </div>
                        
                        {state === 'closed' && (
                          <div style={{ 
                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(254,226,226,0.15) 10px, rgba(254,226,226,0.15) 20px)',
                            pointerEvents: 'none'
                          }} />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Context Panel */}
        <div style={{ position: 'sticky', top: '2rem' }}>
          {!selectedSlot ? (
            <div style={{ background: 'white', padding: '2.5rem 1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <span style={{ fontSize: '1.75rem' }}>📅</span>
              </div>
              <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', fontWeight: 600 }}>Select a time slot</h4>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.75rem', lineHeight: 1.5 }}>Click an available (teal) slot on the calendar to begin booking an appointment.</p>
            </div>
          ) : (
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: '#0f172a' }}>Slot Details</h3>
                <button onClick={() => setSelectedSlot(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1 }}>×</button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '0.5rem' }}>APPOINTMENT TIME</div>
                  <div style={{ fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>
                    {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0c4c54', marginTop: '0.25rem' }}>
                    {format12h(selectedSlot)}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>DURATION</label>
                  <select 
                    value={duration} 
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', outline: 'none', fontSize: '0.9375rem' }}
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                  </select>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                    Ends at {format12h(selectedSlot + duration)}
                  </div>
                </div>

                <button 
                  onClick={() => setIsModalOpen(true)}
                  style={{ 
                    marginTop: '0.5rem', padding: '0.875rem', borderRadius: '10px', 
                    background: '#0c4c54', color: 'white', fontWeight: 700, border: 'none', 
                    cursor: 'pointer', width: '100%', fontSize: '1rem', transition: 'opacity 0.2s' 
                  }}
                  onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                  onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                >
                  Book Appointment
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
          background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 
        }}>
          <div style={{ background: 'white', width: '640px', borderRadius: '20px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
            <div style={{ padding: '1.75rem 2rem', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>Book Appointment</h2>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '2rem', lineHeight: 1 }}>×</button>
              </div>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>Times shown in Eastern Time (ET)</p>
            </div>

            <div style={{ padding: '2rem', maxHeight: '75vh', overflowY: 'auto' }}>
              {/* Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.2fr', gap: '1.5rem', marginBottom: '2.5rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                <div>
                  <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 800, letterSpacing: '0.05em' }}>DATE</div>
                  <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '0.25rem' }}>{new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 800, letterSpacing: '0.05em' }}>START</div>
                  <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '0.25rem' }}>{format12h(selectedSlot!)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 800, letterSpacing: '0.05em' }}>DURATION / END</div>
                  <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '0.25rem' }}>{duration}m • {format12h(selectedSlot! + duration)}</div>
                </div>
              </div>

              {/* Patient Selection */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h4 style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 800, letterSpacing: '0.05em', marginBottom: '1rem', textTransform: 'uppercase' }}>Search Existing Leads</h4>
                <div style={{ position: 'relative' }}>
                  <input 
                    placeholder="Search by name, email, or phone..." 
                    value={searchTerm}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: '100%', padding: '0.875rem 1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0', boxSizing: 'border-box', outline: 'none', fontSize: '1rem', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)' }}
                  />
                </div>
                
                {searchTerm && (
                  <div style={{ marginTop: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    {filteredLeads.length > 0 ? filteredLeads.map(l => (
                      <div 
                        key={l.id} 
                        onClick={() => handleConfirmBooking(`${l.first_name} ${l.last_name}`)}
                        style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a' }}>{l.first_name} {l.last_name}</div>
                          <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.125rem' }}>{l.email} • {l.phone}</div>
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0c4c54', background: '#e0f2f1', padding: '4px 10px', borderRadius: '6px' }}>Select</span>
                      </div>
                    )) : (
                      <div style={{ padding: '1.5rem', textAlign: 'center', fontSize: '0.9375rem', color: '#64748b', background: '#f8fafc' }}>No matching leads found.</div>
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', margin: '2.5rem 0' }}>
                <div style={{ flex: 1, height: '1px', background: '#f1f5f9' }} />
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 800, letterSpacing: '0.1em' }}>OR REGISTER NEW PATIENT</span>
                <div style={{ flex: 1, height: '1px', background: '#f1f5f9' }} />
              </div>

              {/* New Patient Form */}
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase' }}>First Name</label>
                    <input 
                      value={newPatient.first} 
                      onChange={e => setNewPatient({...newPatient, first: e.target.value})}
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box', outline: 'none' }} 
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Last Name</label>
                    <input 
                      value={newPatient.last} 
                      onChange={e => setNewPatient({...newPatient, last: e.target.value})}
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box', outline: 'none' }} 
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Phone Number</label>
                    <input 
                      value={newPatient.phone} 
                      onChange={e => setNewPatient({...newPatient, phone: e.target.value})}
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box', outline: 'none' }} 
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Email (Optional)</label>
                    <input 
                      value={newPatient.email} 
                      onChange={e => setNewPatient({...newPatient, email: e.target.value})}
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box', outline: 'none' }} 
                    />
                  </div>
                </div>
                <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: '#eff6ff', borderRadius: '8px', border: '1px solid #dbeafe' }}>
                  <span style={{ fontSize: '1rem' }}>ℹ️</span>
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: '#1e40af', fontWeight: 500 }}>A new lead record will be created automatically upon confirmation.</p>
                </div>
              </div>
            </div>

            <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '1rem', background: '#f8fafc' }}>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: 700, color: '#475569', transition: 'all 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
              >
                Cancel
              </button>
              <button 
                disabled={!newPatient.first || !newPatient.last}
                onClick={() => handleConfirmBooking(`${newPatient.first} ${newPatient.last}`)}
                style={{ 
                  padding: '0.75rem 2rem', borderRadius: '10px', border: 'none', 
                  background: (!newPatient.first || !newPatient.last) ? '#cbd5e1' : '#0c4c54', 
                  color: 'white', cursor: (!newPatient.first || !newPatient.last) ? 'not-allowed' : 'pointer', 
                  fontWeight: 700, fontSize: '1rem', transition: 'all 0.2s' 
                }}
                onMouseOver={(e) => { if(newPatient.first && newPatient.last) e.currentTarget.style.opacity = '0.9' }}
                onMouseOut={(e) => { if(newPatient.first && newPatient.last) e.currentTarget.style.opacity = '1' }}
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

