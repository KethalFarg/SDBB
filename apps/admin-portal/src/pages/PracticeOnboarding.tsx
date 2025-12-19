import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const API_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api`;
const ROUTING_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/routing-resolve`;

export function PracticeOnboarding() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    lat: '',
    lng: '',
    radius_miles: '10',
    status: 'pending'
  });

  // Validation / Step state
  const [coverageValidated, setCoverageValidated] = useState(false);
  const [overlapAcknowledged, setOverlapAcknowledged] = useState(false);
  const [testZip, setTestZip] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [testingRouting, setTestingRouting] = useState(false);
  const [checkingOverlaps, setCheckingOverlaps] = useState(false);
  const [overlapResult, setOverlapResult] = useState<{ count: number; overlaps: any[] } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (id) fetchPractice(id, session);
    });
  }, [id]);

  const fetchPractice = async (practiceId: string, activeSession: any) => {
    if (!activeSession) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/practices`, {
        headers: { 'Authorization': `Bearer ${activeSession.access_token}` }
      });
      const json = await res.json();
      const practice = json.data?.find((p: any) => p.id === practiceId);
      
      if (practice) {
        setFormData({
          name: practice.name,
          address: practice.address || '',
          city: practice.profile_payload?.city || '',
          state: practice.profile_payload?.state || '',
          zip: practice.profile_payload?.zip || '',
          phone: practice.profile_payload?.phone || '',
          lat: practice.lat?.toString() || '',
          lng: practice.lng?.toString() || '',
          radius_miles: practice.radius_miles?.toString() || '10',
          status: practice.status
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        name: formData.name,
        address: formData.address,
        lat: formData.lat ? parseFloat(formData.lat) : null,
        lng: formData.lng ? parseFloat(formData.lng) : null,
        radius_miles: parseFloat(formData.radius_miles),
        status: formData.status,
        profile_payload: {
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          phone: formData.phone
        }
      };

      const method = id ? 'PATCH' : 'POST';
      const url = id ? `${API_BASE}/admin/practices/${id}` : `${API_BASE}/admin/practices`;

      const res = await fetch(url, {
        method,
        headers: { 
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to save practice');
      }

      const savedPractice = await res.json();
      const newId = id || savedPractice.id;

      if (!id) {
        navigate(`/admin/onboarding/${newId}`);
      } else {
        alert('Practice updated');
        fetchPractice(newId, session);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const runZipTest = async () => {
    if (!testZip) return;
    setTestingRouting(true);
    setTestResult(null);
    try {
      const res = await fetch(`${ROUTING_BASE}/routing/resolve`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ zip: testZip })
      });
      const json = await res.json();
      setTestResult(json);
    } catch (err: any) {
      setError("Routing test failed: " + err.message);
    } finally {
      setTestingRouting(false);
    }
  };

  const checkOverlaps = async () => {
    if (!formData.lat || !formData.lng) {
      alert("Set lat/lng first");
      return;
    }
    setCheckingOverlaps(true);
    setOverlapResult(null);
    try {
      const res = await fetch(`${API_BASE}/admin/map/preview`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          lat: parseFloat(formData.lat), 
          lng: parseFloat(formData.lng), 
          radius_miles: parseFloat(formData.radius_miles) 
        })
      });
      const json = await res.json();
      const filtered = json.overlaps?.filter((o: any) => o.practice_id !== id) || [];
      setOverlapResult({ count: filtered.length, overlaps: filtered });
    } catch (err: any) {
      setError("Overlap check failed: " + err.message);
    } finally {
      setCheckingOverlaps(false);
    }
  };

  // Step completions
  const step1 = !!id;
  const step2 = !!formData.address && !!formData.lat && !!formData.lng;
  const step3 = parseFloat(formData.radius_miles) > 0;
  const step4 = coverageValidated;
  const step5 = formData.status === 'active';
  const step6 = false; // GHL not implemented yet

  const canActivate = step1 && step2 && step3 && step4 && (!overlapResult || overlapResult.count === 0 || overlapAcknowledged);

  if (loading) return <div style={{ padding: '2rem' }}>Loading practice data...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1.5rem', display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
      
      {/* Left Sidebar: Checklist */}
      <aside>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #ddd', position: 'sticky', top: '2rem' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Onboarding Progress</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {[
              { label: 'Create practice', done: step1 },
              { label: 'Set address + lat/lng', done: step2 },
              { label: 'Set radius miles', done: step3 },
              { label: 'Validate coverage', done: step4 },
              { label: 'Activate practice', done: step5 },
              { label: 'Configure GHL', done: step6 },
            ].map((step, i) => (
              <li key={i} style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', opacity: step.done ? 1 : 0.6 }}>
                <span style={{ 
                  width: '24px', height: '24px', borderRadius: '50%', 
                  background: step.done ? '#28a745' : '#eee', 
                  color: step.done ? 'white' : '#999',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', marginRight: '10px', fontWeight: 'bold'
                }}>
                  {step.done ? '✓' : i + 1}
                </span>
                <span style={{ fontSize: '0.9rem', fontWeight: step.done ? 'bold' : 'normal' }}>{step.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <main>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ margin: 0 }}>{id ? 'Practice Onboarding' : 'New Practice'}</h2>
          {id && (
            <button 
              onClick={() => navigate(`/admin/onboarding/${id}/access`)}
              style={{ padding: '0.5rem 1rem', cursor: 'pointer', background: '#0c4c54', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              Practice Access &rarr;
            </button>
          )}
        </div>

        {formData.status === 'pending' && (
          <div style={{ background: '#e7f5ff', color: '#004085', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #b8daff' }}>
            <strong>Practice Pending:</strong> This practice is not yet visible to the routing engine. Complete the steps below to activate.
          </div>
        )}

        {formData.status === 'paused' && (
          <div style={{ background: '#fff3cd', color: '#856404', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #ffeeba' }}>
            <strong>Practice Paused:</strong> This practice is currently hidden from routing.
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ background: 'white', padding: '2rem', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '2rem' }}>
          {error && (
            <div style={{ background: '#fef2f2', color: '#991b1b', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Practice Name *</label>
              <input 
                name="name" value={formData.name} onChange={handleChange} required 
                style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Street Address</label>
              <input 
                name="address" value={formData.address} onChange={handleChange}
                style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>City</label>
              <input 
                name="city" value={formData.city} onChange={handleChange}
                style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>State</label>
                <input 
                  name="state" value={formData.state} onChange={handleChange} maxLength={2}
                  style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>ZIP</label>
                <input 
                  name="zip" value={formData.zip} onChange={handleChange}
                  style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Latitude</label>
              <input 
                name="lat" value={formData.lat} onChange={handleChange} type="number" step="any"
                style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Longitude</label>
              <input 
                name="lng" value={formData.lng} onChange={handleChange} type="number" step="any"
                style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Radius (miles)</label>
              <input 
                name="radius_miles" value={formData.radius_miles} onChange={handleChange} type="number"
                style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Status</label>
              <select 
                name="status" value={formData.status} onChange={handleChange}
                style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }}
              >
                <option value="pending">Pending</option>
                <option value="active" disabled={!canActivate}>Active {!canActivate && '(Validate first)'}</option>
                <option value="paused">Paused</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
            <button 
              type="submit" disabled={saving}
              style={{ 
                flex: 1, padding: '0.8rem', background: '#0c4c54', color: 'white', 
                border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer',
                opacity: saving ? 0.7 : 1
              }}
            >
              {saving ? 'Saving...' : id ? 'Update Settings' : 'Create Practice & Continue'}
            </button>
          </div>
        </form>

        {id && (
          <div style={{ background: '#f8fafb', padding: '2rem', borderRadius: '8px', border: '1px solid #eee' }}>
            <h3 style={{ marginTop: 0 }}>Coverage Validation</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
              {/* ZIP Test */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>Test ZIP Routing</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    placeholder="Enter ZIP" value={testZip} onChange={e => setTestZip(e.target.value)}
                    style={{ flex: 1, padding: '0.5rem' }}
                  />
                  <button 
                    type="button" onClick={runZipTest} disabled={testingRouting}
                    style={{ padding: '0.5rem', cursor: 'pointer' }}
                  >
                    {testingRouting ? '...' : 'Test'}
                  </button>
                </div>
                {testResult && (
                  <div style={{ marginTop: '1rem', fontSize: '0.85rem', background: 'white', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}>
                    <div><strong>Outcome:</strong> {testResult.outcome}</div>
                    {testResult.practice_id && <div><strong>Practice:</strong> {testResult.practice_id === id ? 'THIS PRACTICE' : testResult.practice_id}</div>}
                    {testResult.reason && <div><strong>Reason:</strong> {testResult.reason}</div>}
                  </div>
                )}
              </div>

              {/* Overlap Check */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>Conflict Check</label>
                <button 
                  type="button" onClick={checkOverlaps} disabled={checkingOverlaps}
                  style={{ width: '100%', padding: '0.5rem', cursor: 'pointer' }}
                >
                  {checkingOverlaps ? 'Checking...' : 'Check for Overlaps'}
                </button>
                {overlapResult && (
                  <div style={{ marginTop: '1rem', fontSize: '0.85rem', background: 'white', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}>
                    {overlapResult.count === 0 ? (
                      <div style={{ color: 'green' }}>✓ No overlaps detected</div>
                    ) : (
                      <div style={{ color: '#856404' }}>
                        ⚠ Detected {overlapResult.count} overlaps.
                        <div style={{ marginTop: '0.5rem' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                            <input type="checkbox" checked={overlapAcknowledged} onChange={e => setOverlapAcknowledged(e.target.checked)} />
                            I understand conflicts
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div style={{ borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>
                <input 
                  type="checkbox" checked={coverageValidated} 
                  onChange={e => setCoverageValidated(e.target.checked)} 
                  disabled={!testResult && !overlapResult}
                />
                Coverage Validated
              </label>
              <p style={{ margin: '0.5rem 0 0 25px', fontSize: '0.85rem', color: '#666' }}>
                Run a ZIP test or conflict check to enable validation.
              </p>
            </div>
          </div>
        )}

        <div style={{ marginTop: '2rem', background: '#f8fafb', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eee' }}>
          <h3 style={{ marginTop: 0, fontSize: '1rem' }}>GHL Destination</h3>
          <p style={{ color: '#666', fontStyle: 'italic' }}>Not implemented yet. Routing defaults to system inbox.</p>
        </div>
      </main>
    </div>
  );
}
