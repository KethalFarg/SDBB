import { usePracticeId } from '../hooks/usePracticeId';
import { PageShell } from '../components/PageShell';
import { PracticeChat } from '../../../shared/components/PracticeChat';
import { supabase } from '../supabaseClient';

export function Messages() {
  const { practiceId } = usePracticeId();

  return (
    <PageShell 
      title="Messages" 
      subtitle="Direct communication with the SD Admin team"
    >
      <div style={{ height: 'calc(100vh - 250px)', minHeight: '500px' }}>
        {practiceId ? (
          <PracticeChat 
            practiceId={practiceId} 
            mode="practice" 
            supabase={supabase} 
          />
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p>Loading practice context...</p>
          </div>
        )}
      </div>
    </PageShell>
  );
}

