import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import * as turf from '@turf/turf';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '../lib/supabase';

const VITE_MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const API_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api`;

if (VITE_MAPBOX_TOKEN) {
  mapboxgl.accessToken = VITE_MAPBOX_TOKEN;
}

interface PracticeCoverageMiniMapProps {
  practiceId?: string;
  height?: number;
}

export function PracticeCoverageMiniMap({ 
  practiceId = "11111111-1111-1111-1111-111111111111", 
  height = 220 
}: PracticeCoverageMiniMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [practice, setPractice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPractice();
  }, [practiceId]);

  const fetchPractice = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`${API_BASE}/admin/map/practices?include_missing=false`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      
      const json = await res.json();
      const practices = json.data || [];
      const found = practices.find((p: any) => p.id === practiceId);
      
      if (found && found.lat && found.lng) {
        setPractice(found);
        setError(null);
      } else {
        setPractice(null);
        setError('Practice missing coordinates.');
      }
    } catch (err) {
      console.error(err);
      setError('Error loading practice data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!mapContainer.current || !VITE_MAPBOX_TOKEN || !practice) return;

    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [practice.lng, practice.lat],
        zoom: 9,
        scrollZoom: false
      });

      map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

      map.current.on('load', () => {
        renderPracticeOnMap();
      });
    } else {
      map.current.setCenter([practice.lng, practice.lat]);
      renderPracticeOnMap();
    }

    return () => {
      // We don't necessarily want to destroy the map on every re-render, 
      // but if the component unmounts, we should.
    };
  }, [practice]);

  const renderPracticeOnMap = () => {
    if (!map.current || !practice) return;

    // Marker
    if (markerRef.current) markerRef.current.remove();
    
    const el = document.createElement('div');
    el.style.backgroundColor = practice.status === 'active' ? '#28a745' : '#ffc107';
    el.style.width = '15px';
    el.style.height = '15px';
    el.style.borderRadius = '50%';
    el.style.border = '2px solid white';
    
    markerRef.current = new mapboxgl.Marker(el)
      .setLngLat([practice.lng, practice.lat])
      .addTo(map.current);

    // Radius Circle
    ensureRadiiLayers(map.current);
    const source = map.current.getSource('practice-radii') as mapboxgl.GeoJSONSource;
    if (source) {
      const circle = turf.circle([practice.lng, practice.lat], practice.radius_miles || 10, { steps: 64, units: 'miles' });
      source.setData({
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: circle.geometry,
          properties: {}
        }]
      } as any);

      // Fit bounds
      const bbox = turf.bbox(circle);
      map.current.fitBounds(bbox as [number, number, number, number], { padding: 40, animate: false });
    }
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

  if (!VITE_MAPBOX_TOKEN) {
    return (
      <div style={{ height, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.875rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        Mapbox token missing.
      </div>
    );
  }

  if (loading) {
    return <div style={{ height, background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }} />;
  }

  if (error) {
    return (
      <div style={{ height, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.875rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        {error}
      </div>
    );
  }

  return (
    <div>
      <div 
        ref={mapContainer} 
        style={{ width: '100%', height, borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }} 
      />
      {practice && (
        <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: '#475569' }}>
          <strong>{practice.name}</strong> • {practice.radius_miles} mile radius
        </div>
      )}
    </div>
  );
}


