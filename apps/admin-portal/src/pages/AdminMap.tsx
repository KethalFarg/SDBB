import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import * as turf from '@turf/turf';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const VITE_MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const VITE_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const VITE_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (VITE_MAPBOX_TOKEN) {
  mapboxgl.accessToken = VITE_MAPBOX_TOKEN;
}

const API_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api`; // resolved API_BASE for admin map

export function AdminMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [practices, setPractices] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [includeMissing, setIncludeMissing] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const navigate = useNavigate();
  
  // Editor State
  const [editStatus, setEditStatus] = useState('active');
  const [editRadius, setEditRadius] = useState(10);
  const [overlaps, setOverlaps] = useState<any[]>([]);

  // Env Check
  const missingEnvs = [];
  if (!VITE_MAPBOX_TOKEN) missingEnvs.push('VITE_MAPBOX_TOKEN');
  if (!VITE_SUPABASE_URL) missingEnvs.push('VITE_SUPABASE_URL');
  if (!VITE_SUPABASE_ANON_KEY) missingEnvs.push('VITE_SUPABASE_ANON_KEY');

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }: { data: { session: any } }) => {
      if (!mounted) return;
      setSession(data.session);
      console.log("[ADMIN_PORTAL] session user:", data.session?.user?.id, data.session?.user?.email);
      if (!data.session) navigate('/login');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession: any) => {
      if (!mounted) return;
      setSession(newSession);
      console.log("[ADMIN_PORTAL] auth change user:", newSession?.user?.id, newSession?.user?.email);
      if (!newSession) {
        setPractices([]);
        clearMarkers();
        updateRadii([]);
        navigate('/login');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    if (map.current || !mapContainer.current || !VITE_MAPBOX_TOKEN) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-98.5795, 39.8283],
      zoom: 4
    });

    map.current.on('load', () => {
      setMapReady(true);
      ensureRadiiLayers(map.current!);
      if (session) fetchPractices(session);
    });
  }, [session]);

  useEffect(() => {
    if (session && mapReady) {
      fetchPractices(session);
    }
  }, [includeMissing, session, mapReady]);

  const fetchPractices = async (activeSession: any) => {
    if (!activeSession) return;

    try {
      const res = await fetch(`${API_BASE}/admin/map/practices?include_missing=${includeMissing}`, {
        headers: { 'Authorization': `Bearer ${activeSession.access_token}` }
      });
      console.log("admin/map/practices status:", res.status);
      const json = await res.json();
      console.log("admin/map/practices body:", json);
      setPractices(json.data || []);
      renderMap(json.data || []);
      updateRadii(json.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const renderMap = (data: any[]) => {
    if (!map.current) return;
    
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    data.forEach(p => {
      if (p.lat && p.lng) {
        const el = document.createElement('div');
        el.style.backgroundColor = p.status === 'active' ? '#28a745' : '#ffc107';
        el.style.width = '15px';
        el.style.height = '15px';
        el.style.borderRadius = '50%';
        el.style.border = '2px solid white';
        el.style.cursor = 'pointer';
        
        const marker = new mapboxgl.Marker(el)
          .setLngLat([p.lng, p.lat])
          .addTo(map.current!);
          
        marker.getElement().addEventListener('click', () => selectPractice(p));
        markersRef.current.push(marker);
      }
    });
  };

  const selectPractice = (p: any) => {
    setSelectedId(p.id);
    setEditStatus(p.status);
    setEditRadius(p.radius_miles);
    setOverlaps([]);
    
    if (map.current && p.lat && p.lng) {
      map.current.flyTo({ center: [p.lng, p.lat], zoom: 9 });
    }
    
    checkOverlaps(p.lat, p.lng, p.radius_miles);
  };

  const checkOverlaps = async (lat: number, lng: number, radius: number) => {
    if (!session) return;

    const res = await fetch(`${API_BASE}/admin/map/preview`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ lat, lng, radius_miles: radius })
    });
    const json = await res.json();
    setOverlaps(json.overlaps?.filter((o: any) => o.practice_id !== selectedId) || []);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !selectedId) return;

    if (overlaps.length > 0) {
      const confirmed = window.confirm(`There are ${overlaps.length} practice overlaps. Overlapping practices may cause leads to be sent to manual designation review. Do you want to proceed?`);
      if (!confirmed) return;
    }

    await fetch(`${API_BASE}/admin/practices/${selectedId}`, {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: editStatus, radius_miles: editRadius })
    });
    
    alert('Saved');
    fetchPractices(session);
  };

  const clearMarkers = () => {
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
  };

  const ensureRadiiLayers = (mapInstance: mapboxgl.Map) => {
    if (!mapInstance.getSource('practice-radii')) {
      mapInstance.addSource('practice-radii', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });
    }
    if (!mapInstance.getLayer('practice-radii-fill')) {
      mapInstance.addLayer({
        id: 'practice-radii-fill',
        type: 'fill',
        source: 'practice-radii',
        paint: {
          'fill-color': '#1d4ed8',
          'fill-opacity': 0.12
        }
      });
    }
    if (!mapInstance.getLayer('practice-radii-outline')) {
      mapInstance.addLayer({
        id: 'practice-radii-outline',
        type: 'line',
        source: 'practice-radii',
        paint: {
          'line-color': '#1d4ed8',
          'line-width': 2,
          'line-opacity': 0.7
        }
      });
    }
  };

  const updateRadii = (practicesList: any[]) => {
    if (!map.current) return;
    const source = map.current.getSource('practice-radii') as mapboxgl.GeoJSONSource;
    if (!source) return;

    const features = practicesList
      .filter(p => p.lat && p.lng && p.radius_miles)
      .map((p: any) => {
        const circle = turf.circle([p.lng, p.lat], p.radius_miles, { steps: 64, units: 'miles' });
        return {
          type: 'Feature',
          geometry: circle.geometry,
          properties: {
            id: p.id,
            name: p.name,
            status: p.status,
            radius_miles: p.radius_miles
          }
        };
      });

    source.setData({
      type: 'FeatureCollection',
      features
    } as any);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
      {/* Set VITE_SHOW_DEBUG_BANNER=true to show this banner in dev. */}
      {import.meta.env.DEV && import.meta.env.VITE_SHOW_DEBUG_BANNER === "true" && session && (
        <div style={{ padding: "8px 12px", background: "#111", color: "#fff", fontSize: 12 }}>
          <div><strong>Supabase:</strong> {VITE_SUPABASE_URL}</div>
          <div><strong>User:</strong> {session?.user?.id}</div>
          <div><strong>Email:</strong> {session?.user?.email}</div>
        </div>
      )}
      {missingEnvs.length > 0 && (
        <div style={{ 
          background: '#ffdddd', color: '#d8000c', padding: '1rem', 
          borderBottom: '1px solid #d8000c', fontWeight: 'bold' 
        }}>
          WARNING: Missing Configuration: The following environment variables are missing in <code>apps/admin-portal/.env</code>:
          <ul style={{marginTop:'0.5rem', marginBottom:0}}>
            {missingEnvs.map(env => <li key={env}>{env}</li>)}
          </ul>
        </div>
      )}

      <div style={{ display: 'flex', flex: 1 }}>
        <div style={{ width: '350px', borderRight: '1px solid #ddd', padding: '1rem', overflowY: 'auto' }}>
          <h3>Practices</h3>
          <div style={{ margin: '1rem 0' }}>
            <label>
              <input type="checkbox" checked={includeMissing} onChange={e => setIncludeMissing(e.target.checked)} />
              Include Missing Coords
            </label>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <button 
              onClick={() => navigate('/admin/onboarding')}
              style={{ width: '100%', padding: '0.5rem', background: '#0c4c54', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              + New Practice
            </button>
          </div>
          {practices.map(p => (
            <div 
              key={p.id} 
              onClick={() => selectPractice(p)}
              style={{ 
                padding: '0.5rem', 
                background: selectedId === p.id ? '#e7f5ff' : 'white',
                cursor: 'pointer',
                borderBottom: '1px solid #eee'
              }}
            >
              <strong>{p.name}</strong> ({p.status})
            </div>
          ))}
        </div>
        
        <div style={{ flex: 1, position: 'relative' }}>
          <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
          
          {selectedId && (
            <div style={{ 
              position: 'absolute', top: '1rem', right: '1rem', 
              background: 'white', padding: '1rem', 
              width: '300px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <h4 style={{marginTop:0}}>Edit Practice</h4>
              <form onSubmit={handleSave}>
                <div style={{marginBottom:'1rem'}}>
                  <label>Status</label>
                  <select value={editStatus} onChange={e => setEditStatus(e.target.value)} style={{width:'100%'}}>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
                <div style={{marginBottom:'1rem'}}>
                  <label>Radius (mi)</label>
                  <input 
                    type="number" 
                    value={editRadius} 
                    onChange={e => {
                      const val = parseFloat(e.target.value);
                      setEditRadius(val);
                      const p = practices.find(x => x.id === selectedId);
                      if (p) checkOverlaps(p.lat, p.lng, val);
                    }} 
                    style={{width:'100%'}}
                  />
                </div>
                
                {overlaps.length > 0 && (
                  <div style={{background:'#fff3cd', padding:'0.5rem', marginBottom:'1rem', borderRadius:'4px'}}>
                    <strong>Warning: {overlaps.length} overlaps</strong>
                    {overlaps.slice(0, 3).map((o: any) => (
                      <div key={o.practice_id} style={{fontSize:'0.85rem'}}>
                        {o.name}: {o.distance_miles}mi
                      </div>
                    ))}
                  </div>
                )}
                
                <button type="submit" style={{width:'100%', background:'#007bff', color:'white', border:'none', padding:'0.5rem'}}>Save</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
