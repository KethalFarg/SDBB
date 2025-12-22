import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '../supabaseClient';

const VITE_MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

if (VITE_MAPBOX_TOKEN) {
  mapboxgl.accessToken = VITE_MAPBOX_TOKEN;
}

interface PracticeCoverageMiniMapProps {
  practiceId: string;
  height?: number;
}

export function PracticeCoverageMiniMap({ practiceId, height = 220 }: PracticeCoverageMiniMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [practice, setPractice] = useState<any>(null);

  useEffect(() => {
    async function fetchPractice() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('practices')
          .select('id, name, lat, lng, radius_miles, status')
          .eq('id', practiceId)
          .single();

        if (error) throw error;
        if (!data.lat || !data.lng) {
          setError('Practice missing coordinates');
        } else {
          setPractice(data);
          setError(null);
        }
      } catch (err: any) {
        console.error('Error fetching practice for map:', err);
        setError('Failed to load practice data');
      } finally {
        setLoading(false);
      }
    }

    if (practiceId) {
      fetchPractice();
    }
  }, [practiceId]);

  useEffect(() => {
    if (!VITE_MAPBOX_TOKEN) {
      setError('Mapbox token missing');
      return;
    }

    if (loading || error || !practice || !mapContainer.current) return;

    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [practice.lng, practice.lat],
        zoom: 9,
        scrollZoom: false,
        attributionControl: false
      });

      map.current.on('load', () => {
        if (!map.current || !practice) return;

        // Add Marker
        const el = document.createElement('div');
        el.style.backgroundColor = practice.status === 'active' ? '#28a745' : '#ffc107';
        el.style.width = '12px';
        el.style.height = '12px';
        el.style.borderRadius = '50%';
        el.style.border = '2px solid white';
        el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';

        new mapboxgl.Marker(el)
          .setLngLat([practice.lng, practice.lat])
          .addTo(map.current);

        // Add Circle
        const circleGeojson = createGeoJSONCircle([practice.lng, practice.lat], practice.radius_miles || 10);
        
        map.current.addSource('practice-radius', {
          type: 'geojson',
          data: circleGeojson as any
        });

        map.current.addLayer({
          id: 'practice-radius-fill',
          type: 'fill',
          source: 'practice-radius',
          paint: {
            'fill-color': '#1d4ed8',
            'fill-opacity': 0.1
          }
        });

        map.current.addLayer({
          id: 'practice-radius-outline',
          type: 'line',
          source: 'practice-radius',
          paint: {
            'line-color': '#1d4ed8',
            'line-width': 2,
            'line-opacity': 0.5
          }
        });

        // Fit bounds
        const bounds = getBounds(circleGeojson.geometry.coordinates[0]);
        map.current.fitBounds(bounds, { padding: 20, animate: false });
      });
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [loading, error, practice]);

  // Helper to create a circle polygon without turf
  function createGeoJSONCircle(center: [number, number], radiusMiles: number, points: number = 64) {
    const coords = {
      latitude: center[1],
      longitude: center[0]
    };

    const km = radiusMiles * 1.609344;
    const ret = [];
    const distanceX = km / (111.32 * Math.cos(coords.latitude * Math.PI / 180));
    const distanceY = km / 110.574;

    let theta, x, y;
    for (let i = 0; i < points; i++) {
      theta = (i / points) * (2 * Math.PI);
      x = distanceX * Math.cos(theta);
      y = distanceY * Math.sin(theta);

      ret.push([coords.longitude + x, coords.latitude + y]);
    }
    ret.push(ret[0]);

    return {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [ret]
      },
      properties: {}
    };
  }

  function getBounds(coordinates: number[][]): mapboxgl.LngLatBoundsLike {
    const bounds = new mapboxgl.LngLatBounds();
    coordinates.forEach(([lng, lat]) => {
      bounds.extend([lng, lat]);
    });
    return bounds;
  }

  if (loading) {
    return (
      <div style={{ height, backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Loading map...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ height, backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', textAlign: 'center' }}>
        <span style={{ fontSize: '0.875rem', color: '#991b1b' }}>{error}</span>
      </div>
    );
  }

  return (
    <div>
      <div ref={mapContainer} style={{ height, width: '100%', borderRadius: '8px', overflow: 'hidden' }} />
      {practice && (
        <div style={{ marginTop: '0.75rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)', display: 'flex', justifyContent: 'space-between' }}>
          <span><strong>{practice.name}</strong></span>
          <span>{practice.radius_miles} mile radius</span>
        </div>
      )}
    </div>
  );
}

