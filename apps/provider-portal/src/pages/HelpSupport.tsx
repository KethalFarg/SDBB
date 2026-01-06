import { supabase } from '../supabaseClient';
import { usePracticeId } from '../hooks/usePracticeId';
import { PageShell } from '../components/PageShell';
import { PracticeChat } from '../../../shared/components/PracticeChat';
import { LoadingState } from '../components/LoadingState';

export function HelpSupport() {
  const { practiceId, practice, loading } = usePracticeId();

  if (loading) return <LoadingState />;

  return (
    <PageShell 
      title="Help & Support" 
      subtitle={practice?.name || "Support Channel"}
    >
      <div style={{ 
        background: 'white', 
        borderRadius: '8px', 
        border: '1px solid #ddd', 
        overflow: 'hidden',
        height: 'calc(100vh - 250px)',
        minHeight: '600px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ 
          padding: '1rem 1.5rem', 
          borderBottom: '1px solid #eee', 
          background: '#f8fafb',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></div>
          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#4b5563' }}>Platform Support (Online)</span>
        </div>
        
        <div style={{ flex: 1, minHeight: 0 }}>
          <PracticeChat 
            practiceId={practiceId || ''} 
            mode="practice" 
            supabase={supabase} 
          />
        </div>
      </div>
    </PageShell>
  );
}
