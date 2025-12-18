import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const API_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api`;

export function PracticeOnboarding() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    status: 'active'
  });

  useEffect(() => {
    if (id) {
      fetchPractice(id);
    }
  }, [id]);

  const fetchPractice = async (practiceId: string) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession() as { data: { session: any } };
      const res = await fetch(`${API_BASE}/admin/practices`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
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
      const { data: { session } } = await supabase.auth.getSession() as { data: { session: any } };
      
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

      navigate(`/admin/onboarding/${newId}/access`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading practice data...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0 }}>{id ? 'Edit Practice' : 'New Practice Onboarding'}</h2>
        {id && (
          <button 
            onClick={() => navigate(`/admin/onboarding/${id}/access`)}
            style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
          >
            Manage Access &rarr;
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ background: 'white', padding: '2rem', borderRadius: '8px', border: '1px solid #ddd' }}>
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
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Phone</label>
            <input 
              name="phone" value={formData.phone} onChange={handleChange}
              style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Status</label>
            <select 
              name="status" value={formData.status} onChange={handleChange}
              style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }}
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
            </select>
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
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
          <button 
            type="submit" disabled={saving}
            style={{ 
              flex: 1, padding: '0.8rem', background: '#0c4c54', color: 'white', 
              border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' 
            }}
          >
            {saving ? 'Saving...' : id ? 'Update Practice' : 'Create Practice & Continue'}
          </button>
          <button 
            type="button" onClick={() => navigate('/admin/map')}
            style={{ padding: '0.8rem 1.5rem', background: 'transparent', border: '1px solid #ddd', cursor: 'pointer' }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

