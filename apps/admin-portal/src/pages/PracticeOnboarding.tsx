import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '../lib/supabase';

const API_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api`;
const ROUTING_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/routing-resolve`;

const VITE_MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';
mapboxgl.accessToken = VITE_MAPBOX_TOKEN;

// ----- Small geometry helper: circle polygon around [lng,lat] -----
function circlePolygon(lng: number, lat: number, radiusMiles: number, steps = 64) {
  // Convert miles -> meters
  const radiusMeters = radiusMiles * 1609.344;
  const earthRadius = 6378137; // meters (WGS84)
  const coords: [number, number][] = [];

  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;
  const angularDistance = radiusMeters / earthRadius;

  for (let i = 0; i <= steps; i++) {
    const bearing = (i * 2 * Math.PI) / steps;

    const sinLat = Math.sin(latRad);
    const cosLat = Math.cos(latRad);
    const sinAd = Math.sin(angularDistance);
    const cosAd = Math.cos(angularDistance);

    const lat2 = Math.asin(sinLat * cosAd + cosLat * sinAd * Math.cos(bearing));
    const lng2 =
      lngRad +
      Math.atan2(
        Math.sin(bearing) * sinAd * cosLat,
        cosAd - sinLat * Math.sin(lat2)
      );

    coords.push([(lng2 * 180) / Math.PI, (lat2 * 180) / Math.PI]);
  }

  return {
    type: 'Feature' as const,
    geometry: {
      type: 'Polygon' as const,
      coordinates: [coords],
    },
    properties: {},
  };
}

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
    status: 'pending',
  });

  // Validation / Step state
  const [coverageValidated, setCoverageValidated] = useState(false);
  const [overlapAcknowledged, setOverlapAcknowledged] = useState(false);
  const [testZip, setTestZip] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [testingRouting, setTestingRouting] = useState(false);
  const [checkingOverlaps, setCheckingOverlaps] = useState(false);
  const [overlapResult, setOverlapResult] = useState<{ count: number; overlaps: any[] } | null>(null);

  // List / Search state
  const [allPractices, setAllPractices] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  // Map + geocoding state
  const [allowManualCoords, setAllowManualCoords] = useState(false);
  const [geocodeLoading, setGeocodeLoading] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const fetchCountRef = useRef(0);
  const sessionRef = useRef<any>(null);

  const CIRCLE_SOURCE_ID = 'onboarding-radius-source';
  const CIRCLE_FILL_LAYER_ID = 'onboarding-radius-fill';
  const CIRCLE_LINE_LAYER_ID = 'onboarding-radius-line';

  const fetchPractices = useCallback(async (activeSession: any) => {
    if (!activeSession) return;
    
    const currentFetchId = ++fetchCountRef.current;
    setLoadingList(true);
    setListError(null);
    
    try {
      const res = await fetch(`${API_BASE}/admin/practices`, {
        headers: { Authorization: `Bearer ${activeSession.access_token}` },
      });
      
      if (!res.ok) {
        throw new Error(`Failed to load practices (${res.status})`);
      }
      
      const json = await res.json();
      
      // Guard against race conditions: only update if this is still the latest fetch
      if (currentFetchId !== fetchCountRef.current) return;
      
      const practices = json.data || [];
      setAllPractices(practices);

      if (id) {
        const practice = practices.find((p: any) => p.id === id);
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
            status: practice.status,
          });
        }
      } else {
        // Reset form for new practice
        setFormData({
          name: '',
          address: '',
          city: '',
          state: '',
          zip: '',
          phone: '',
          lat: '',
          lng: '',
          radius_miles: '10',
          status: 'pending',
        });
      }
    } catch (err: any) {
      if (currentFetchId === fetchCountRef.current) {
        setListError(err.message);
      }
    } finally {
      if (currentFetchId === fetchCountRef.current) {
        setLoadingList(false);
      }
    }
  }, [id]);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    let mounted = true;
    
    // 1. Initial Session Load
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!mounted) return;
      setSession(s);
      if (s) fetchPractices(s);
    });

    // 2. Auth State Change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!mounted) return;
      setSession(s);
      if (s) fetchPractices(s);
    });

    // 3. Re-fetch on focus or visibility change (resilient sync)
    const handleSync = () => {
      if (document.visibilityState === 'visible' && sessionRef.current) {
        fetchPractices(sessionRef.current);
      }
    };

    window.addEventListener('focus', handleSync);
    document.addEventListener('visibilitychange', handleSync);

    return () => { 
      mounted = false;
      subscription.unsubscribe();
      window.removeEventListener('focus', handleSync);
      document.removeEventListener('visibilitychange', handleSync);
    };
  }, [fetchPractices]);

  const filteredPractices = useMemo(() => {
    return allPractices.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allPractices, searchQuery]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
          phone: formData.phone,
        },
      };

      const method = id ? 'PATCH' : 'POST';
      const url = id ? `${API_BASE}/admin/practices/${id}` : `${API_BASE}/admin/practices`;

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
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
        fetchPractices(session);
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
          Authorization: `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ zip: testZip }),
      });
      const json = await res.json();
      setTestResult(json);
    } catch (err: any) {
      setError('Routing test failed: ' + err.message);
    } finally {
      setTestingRouting(false);
    }
  };

  const checkOverlaps = async () => {
    if (!formData.lat || !formData.lng) {
      alert('Set lat/lng first');
      return;
    }
    setCheckingOverlaps(true);
    setOverlapResult(null);
    try {
      const res = await fetch(`${API_BASE}/admin/map/preview`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lat: parseFloat(formData.lat),
          lng: parseFloat(formData.lng),
          radius_miles: parseFloat(formData.radius_miles),
        }),
      });
      const json = await res.json();
      const filtered = json.overlaps?.filter((o: any) => o.practice_id !== id) || [];
      setOverlapResult({ count: filtered.length, overlaps: filtered });
    } catch (err: any) {
      setError('Overlap check failed: ' + err.message);
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

  const canActivate =
    step1 && step2 && step3 && step4 && (!overlapResult || overlapResult.count === 0 || overlapAcknowledged);

  const hasCoords = useMemo(() => {
    const lat = parseFloat(formData.lat);
    const lng = parseFloat(formData.lng);
    return Number.isFinite(lat) && Number.isFinite(lng);
  }, [formData.lat, formData.lng]);

  const canGeocode = useMemo(() => {
    const streetOk = !!formData.address?.trim();
    const zipOk = !!formData.zip?.trim();
    const cityStateOk = !!formData.city?.trim() && !!formData.state?.trim();
    return streetOk && (zipOk || cityStateOk) && !!VITE_MAPBOX_TOKEN;
  }, [formData.address, formData.city, formData.state, formData.zip]);

  const buildGeocodeQuery = () => {
    const parts = [
      formData.address?.trim(),
      formData.city?.trim(),
      formData.state?.trim(),
      formData.zip?.trim(),
    ].filter(Boolean);
    return parts.join(', ');
  };

  const geocodeAddress = async () => {
    setGeocodeError(null);

    if (!VITE_MAPBOX_TOKEN) {
      setGeocodeError('Mapbox token is missing.');
      return;
    }

    const query = buildGeocodeQuery();
    if (!query) return;

    setGeocodeLoading(true);
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        query
      )}.json?access_token=${encodeURIComponent(VITE_MAPBOX_TOKEN)}&limit=1`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`Geocode failed (${res.status})`);

      const json = await res.json();
      const feature = json?.features?.[0];
      if (!feature || !feature.center || feature.center.length < 2) {
        setGeocodeError('No results found for that address.');
        return;
      }

      const [lng, lat] = feature.center;
      setFormData((prev) => ({
        ...prev,
        lat: String(lat),
        lng: String(lng),
      }));

      // Once we geocode, default to locked coords (manual edit off)
      setAllowManualCoords(false);

      // Update map view immediately
      if (mapRef.current) {
        mapRef.current.flyTo({ center: [lng, lat], zoom: 12, essential: true });
      }
    } catch (err: any) {
      setGeocodeError(err.message || 'Geocode failed.');
    } finally {
      setGeocodeLoading(false);
    }
  };

  // Initialize map once
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-98.5795, 39.8283], // US center
      zoom: 3,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

    map.on('load', () => {
      if (!map.getSource(CIRCLE_SOURCE_ID)) {
        map.addSource(CIRCLE_SOURCE_ID, {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [],
          },
        });
      }

      if (!map.getLayer(CIRCLE_FILL_LAYER_ID)) {
        map.addLayer({
          id: CIRCLE_FILL_LAYER_ID,
          type: 'fill',
          source: CIRCLE_SOURCE_ID,
          paint: {
            'fill-color': '#0c4c54',
            'fill-opacity': 0.12,
          },
        });
      }

      if (!map.getLayer(CIRCLE_LINE_LAYER_ID)) {
        map.addLayer({
          id: CIRCLE_LINE_LAYER_ID,
          type: 'line',
          source: CIRCLE_SOURCE_ID,
          paint: {
            'line-color': '#0c4c54',
            'line-width': 2,
            'line-opacity': 0.8,
          },
        });
      }
    });

    mapRef.current = map;

    const handleResize = () => map.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markerRef.current = null;
    };
  }, []);

  // Update marker + circle when coords or radius changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const lat = parseFloat(formData.lat);
    const lng = parseFloat(formData.lng);
    const radius = parseFloat(formData.radius_miles);

    if (!Number.isFinite(radius) || radius <= 0) {
      if (map.isStyleLoaded() && map.getSource(CIRCLE_SOURCE_ID)) {
        const source = map.getSource(CIRCLE_SOURCE_ID) as mapboxgl.GeoJSONSource;
        source.setData({ type: 'FeatureCollection', features: [] } as any);
      }
    } else if (Number.isFinite(lat) && Number.isFinite(lng)) {
      const circle = circlePolygon(lng, lat, radius, 64);
      if (map.isStyleLoaded() && map.getSource(CIRCLE_SOURCE_ID)) {
        const source = map.getSource(CIRCLE_SOURCE_ID) as mapboxgl.GeoJSONSource;
        source.setData({ type: 'FeatureCollection', features: [circle] } as any);
      }
    }

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      return;
    }

    if (!markerRef.current) {
      markerRef.current = new mapboxgl.Marker({ color: '#0c4c54' })
        .setLngLat([lng, lat])
        .addTo(map);
    } else {
      markerRef.current.setLngLat([lng, lat]);
    }

    const currentZoom = map.getZoom();
    if (currentZoom <= 3.2) {
      map.flyTo({ center: [lng, lat], zoom: 10 });
    }
  }, [formData.lat, formData.lng, formData.radius_miles]);

  if (loading) return <div style={{ padding: '2rem' }}>Loading practice data...</div>;

  const latReadOnly = !allowManualCoords && !!formData.lat;
  const lngReadOnly = !allowManualCoords && !!formData.lng;

  return (
    <div
      style={{
        maxWidth: '1400px',
        margin: '2rem auto',
        padding: '0 1.5rem',
        display: 'grid',
        gridTemplateColumns: 'minmax(520px, 600px) 1fr',
        gap: '2rem',
        alignItems: 'start',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #ddd' }}>
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
              <li
                key={i}
                style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', opacity: step.done ? 1 : 0.6 }}
              >
                <span
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: step.done ? '#28a745' : '#eee',
                    color: step.done ? 'white' : '#999',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    marginRight: '10px',
                    fontWeight: 'bold',
                  }}
                >
                  {step.done ? '✓' : i + 1}
                </span>
                <span style={{ fontSize: '0.9rem', fontWeight: step.done ? 'bold' : 'normal' }}>{step.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ margin: 0 }}>{id ? 'Practice Onboarding' : 'New Practice'}</h2>
            {id && (
              <button
                onClick={() => navigate(`/admin/onboarding/${id}/access`)}
                style={{
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  background: '#0c4c54',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                }}
              >
                Practice Access &rarr;
              </button>
            )}
          </div>

          {formData.status === 'pending' && (
            <div
              style={{
                background: '#e7f5ff',
                color: '#004085',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                border: '1px solid #b8daff',
              }}
            >
              <strong>Practice Pending:</strong> This practice is not yet visible to the routing engine. Complete the steps
              below to activate.
            </div>
          )}

          {formData.status === 'paused' && (
            <div
              style={{
                background: '#fff3cd',
                color: '#856404',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                border: '1px solid #ffeeba',
              }}
            >
              <strong>Practice Paused:</strong> This practice is currently hidden from routing.
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{ background: 'white', padding: '2rem', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '2rem' }}
          >
            {error && (
              <div style={{ background: '#fef2f2', color: '#991b1b', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Practice Name *</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Street Address</label>
                <input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>City</label>
                <input name="city" value={formData.city} onChange={handleChange} style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>State</label>
                  <input
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    maxLength={2}
                    style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>ZIP</label>
                  <input name="zip" value={formData.zip} onChange={handleChange} style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Latitude</label>
                <input
                  name="lat"
                  value={formData.lat}
                  onChange={handleChange}
                  type="number"
                  step="any"
                  readOnly={latReadOnly}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    boxSizing: 'border-box',
                    background: latReadOnly ? '#f7fafc' : 'white',
                    cursor: latReadOnly ? 'not-allowed' : 'text',
                  }}
                />
                {!!formData.lat && (
                  <div style={{ marginTop: '6px', fontSize: '0.85rem' }}>
                    <button
                      type="button"
                      onClick={() => setAllowManualCoords((v) => !v)}
                      style={{
                        padding: 0,
                        border: 'none',
                        background: 'transparent',
                        color: '#0c4c54',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                      }}
                    >
                      {allowManualCoords ? 'Lock coordinates' : 'Edit manually'}
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Longitude</label>
                <input
                  name="lng"
                  value={formData.lng}
                  onChange={handleChange}
                  type="number"
                  step="any"
                  readOnly={lngReadOnly}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    boxSizing: 'border-box',
                    background: lngReadOnly ? '#f7fafc' : 'white',
                    cursor: lngReadOnly ? 'not-allowed' : 'text',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Radius (miles)</label>
                <input
                  name="radius_miles"
                  value={formData.radius_miles}
                  onChange={handleChange}
                  type="number"
                  style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }}
                >
                  <option value="pending">Pending</option>
                  <option value="active" disabled={!canActivate}>
                    Active {!canActivate && '(Validate first)'}
                  </option>
                  <option value="paused">Paused</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  flex: 1,
                  padding: '0.8rem',
                  background: '#0c4c54',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  opacity: saving ? 0.7 : 1,
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
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    Test ZIP Routing
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      placeholder="Enter ZIP"
                      value={testZip}
                      onChange={(e) => setTestZip(e.target.value)}
                      style={{ flex: 1, padding: '0.5rem' }}
                    />
                    <button type="button" onClick={runZipTest} disabled={testingRouting} style={{ padding: '0.5rem', cursor: 'pointer' }}>
                      {testingRouting ? '...' : 'Test'}
                    </button>
                  </div>
                  {testResult && (
                    <div
                      style={{
                        marginTop: '1rem',
                        fontSize: '0.85rem',
                        background: 'white',
                        padding: '0.75rem',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                      }}
                    >
                      <div>
                        <strong>Outcome:</strong> {testResult.outcome}
                      </div>
                      {testResult.practice_id && (
                        <div>
                          <strong>Practice:</strong> {testResult.practice_id === id ? 'THIS PRACTICE' : testResult.practice_id}
                        </div>
                      )}
                      {testResult.reason && (
                        <div>
                          <strong>Reason:</strong> {testResult.reason}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    Conflict Check
                  </label>
                  <button type="button" onClick={checkOverlaps} disabled={checkingOverlaps} style={{ width: '100%', padding: '0.5rem', cursor: 'pointer' }}>
                    {checkingOverlaps ? 'Checking...' : 'Check for Overlaps'}
                  </button>
                  {overlapResult && (
                    <div
                      style={{
                        marginTop: '1rem',
                        fontSize: '0.85rem',
                        background: 'white',
                        padding: '0.75rem',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                      }}
                    >
                      {overlapResult.count === 0 ? (
                        <div style={{ color: 'green' }}>✓ No overlaps detected</div>
                      ) : (
                        <div style={{ color: '#856404' }}>
                          ⚠ Detected {overlapResult.count} overlaps.
                          <div style={{ marginTop: '0.5rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                              <input type="checkbox" checked={overlapAcknowledged} onChange={(e) => setOverlapAcknowledged(e.target.checked)} />
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
                    type="checkbox"
                    checked={coverageValidated}
                    onChange={(e) => setCoverageValidated(e.target.checked)}
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
        </div>
      </div>

      <div style={{ position: 'sticky', top: '2rem' }}>
        <div
          style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #ddd',
            minHeight: '600px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '1rem', marginBottom: '0.75rem' }}>
            <h3 style={{ marginTop: 0, marginBottom: 0 }}>Map Preview</h3>
            <button
              type="button"
              onClick={geocodeAddress}
              disabled={!canGeocode || geocodeLoading}
              style={{
                padding: '0.5rem 0.75rem',
                cursor: canGeocode && !geocodeLoading ? 'pointer' : 'not-allowed',
                background: canGeocode && !geocodeLoading ? '#0c4c54' : '#94a3b8',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontWeight: 600,
              }}
              title={!VITE_MAPBOX_TOKEN ? 'Mapbox token missing' : undefined}
            >
              {geocodeLoading ? 'Searching…' : 'Find on Map'}
            </button>
          </div>

          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
            Uses the address on the left to look up coordinates and preview routing radius.
          </p>

          {geocodeError && (
            <div style={{ background: '#fff7ed', color: '#9a3412', padding: '0.75rem', borderRadius: '6px', border: '1px solid #fed7aa', marginBottom: '0.75rem' }}>
              {geocodeError}
            </div>
          )}

          {!VITE_MAPBOX_TOKEN && (
            <div style={{ background: '#fef2f2', color: '#991b1b', padding: '0.75rem', borderRadius: '6px', border: '1px solid #fecaca', marginBottom: '0.75rem' }}>
              Mapbox token not found. The map cannot load until the env var VITE_MAPBOX_TOKEN is present.
            </div>
          )}

          <div
            ref={mapContainerRef}
            style={{
              flex: 1,
              minHeight: '520px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
            }}
          />

          <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#64748b' }}>
            {hasCoords ? (
              <>
                Center: <strong>{parseFloat(formData.lat).toFixed(6)}, {parseFloat(formData.lng).toFixed(6)}</strong> • Radius:{' '}
                <strong>{parseFloat(formData.radius_miles || '0') || 0} mi</strong>
              </>
            ) : (
              <>Enter an address and click <strong>Find on Map</strong> to populate coordinates.</>
            )}
          </div>
        </div>

        {/* Existing Practices List - Moved to right column with scroll */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #ddd', marginTop: '2rem' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Existing Practices</h3>
          <div style={{ marginBottom: '1rem' }}>
            <input 
              placeholder="Search practices..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          
          {!session ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>Session not ready — retrying…</div>
          ) : loadingList ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>Loading practices…</div>
          ) : listError ? (
            <div style={{ padding: '1rem', textAlign: 'center' }}>
              <div style={{ color: '#c53030', marginBottom: '0.5rem' }}>{listError}</div>
              <button 
                onClick={() => fetchPractices(session)}
                style={{ padding: '0.4rem 0.8rem', cursor: 'pointer', background: '#0c4c54', color: 'white', border: 'none', borderRadius: '4px' }}
              >
                Retry
              </button>
            </div>
          ) : filteredPractices.length === 0 ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
              {searchQuery ? 'No practices match your search.' : 'No practices yet.'}
            </div>
          ) : (
            <div style={{ maxHeight: '320px', overflowY: 'auto', border: '1px solid #f1f5f9', borderRadius: '4px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead style={{ position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                    <th style={{ padding: '0.5rem', background: '#f8fafc' }}>Name</th>
                    <th style={{ padding: '0.5rem', background: '#f8fafc' }}>Location</th>
                    <th style={{ padding: '0.5rem', background: '#f8fafc' }}>Status</th>
                    <th style={{ padding: '0.5rem', background: '#f8fafc' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPractices.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f9f9f9', background: id === p.id ? '#f0f7ff' : 'transparent' }}>
                      <td style={{ padding: '0.5rem', fontWeight: 600 }}>{p.name}</td>
                      <td style={{ padding: '0.5rem', color: '#666' }}>
                        {p.profile_payload?.city || '-'}{p.profile_payload?.state ? `, ${p.profile_payload.state}` : ''}
                      </td>
                      <td style={{ padding: '0.5rem' }}>
                        <span style={{ 
                          fontSize: '0.75rem', 
                          padding: '2px 6px', 
                          borderRadius: '4px', 
                          background: p.status === 'active' ? '#e6fffa' : '#fff5f5',
                          color: p.status === 'active' ? '#234e52' : '#c53030'
                        }}>{p.status}</span>
                      </td>
                      <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                        <Link to={`/admin/onboarding/${p.id}`} style={{ color: '#0c4c54', fontWeight: 'bold', textDecoration: 'none' }}>Open</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
