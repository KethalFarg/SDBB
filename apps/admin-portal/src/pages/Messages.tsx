import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { PracticeChat } from '../../../shared/components/PracticeChat';

const API_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api`;

export function Messages() {
  const [practices, setPractices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'paused'>('active');

  useEffect(() => {
    fetchPractices();
  }, []);

  const fetchPractices = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`${API_BASE}/admin/practices`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      
      if (!res.ok) throw new Error('Failed to fetch practices');
      
      const json = await res.json();
      setPractices(json.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredPractices = useMemo(() => {
    return practices.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [practices, searchQuery, statusFilter]);

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{ 
        width: '350px', 
        borderRight: '1px solid #e2e8f0', 
        background: '#f8fafc', 
        display: 'flex', 
        flexDirection: 'column' 
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', background: 'white' }}>
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 700 }}>Messages</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input 
              type="text"
              placeholder="Search practices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '0.6rem', 
                borderRadius: '6px', 
                border: '1px solid #cbd5e1',
                boxSizing: 'border-box'
              }}
            />
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {(['active', 'pending', 'paused', 'all'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  style={{
                    flex: 1,
                    padding: '0.4rem',
                    fontSize: '0.75rem',
                    borderRadius: '4px',
                    border: '1px solid',
                    borderColor: statusFilter === status ? '#0c4c54' : '#e2e8f0',
                    background: statusFilter === status ? '#0c4c54' : 'white',
                    color: statusFilter === status ? 'white' : '#64748b',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    fontWeight: statusFilter === status ? 600 : 400
                  }}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading && <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading practices...</div>}
          {error && <div style={{ padding: '2rem', textAlign: 'center', color: '#dc2626' }}>{error}</div>}
          
          {!loading && filteredPractices.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>
              No practices found.
            </div>
          )}

          {filteredPractices.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              style={{
                padding: '1rem 1.5rem',
                cursor: 'pointer',
                borderBottom: '1px solid #f1f5f9',
                background: selectedId === p.id ? '#e7f5ff' : 'transparent',
                transition: 'background 0.2s'
              }}
            >
              <div style={{ fontWeight: 600, color: '#1e293b' }}>{p.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                <span style={{ 
                  fontSize: '0.7rem', 
                  padding: '2px 6px', 
                  borderRadius: '4px', 
                  background: p.status === 'active' ? '#e6fffa' : p.status === 'pending' ? '#fffbeb' : '#fff5f5',
                  color: p.status === 'active' ? '#047857' : p.status === 'pending' ? '#b45309' : '#b91c1c',
                  textTransform: 'capitalize'
                }}>
                  {p.status}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  {p.profile_payload?.city || 'No city'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, background: '#fff', display: 'flex', flexDirection: 'column' }}>
        {selectedId ? (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ 
              padding: '1rem 2rem', 
              borderBottom: '1px solid #e2e8f0', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between' 
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
                  {practices.find(p => p.id === selectedId)?.name}
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Support Channel</span>
              </div>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <PracticeChat practiceId={selectedId} mode="admin" supabase={supabase} />
            </div>
          </div>
        ) : (
          <div style={{ 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: '#94a3b8',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{ fontSize: '3rem' }}>💬</div>
            <p>Select a practice from the sidebar to start messaging.</p>
          </div>
        )}
      </div>
    </div>
  );
}




