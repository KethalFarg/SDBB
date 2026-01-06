// @ts-nocheck
import React, { useEffect, useState, useRef } from 'react';

const ADMIN_API_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api`;

interface Message {
  id: string;
  conversation_id: string;
  sender_user_id: string | null;
  sender_role: 'admin' | 'practice' | 'system' | 'assistant';
  body: string;
  created_at: string;
}

interface PracticeChatProps {
  practiceId: string;
  mode: 'admin' | 'practice';
  supabase: any; // Supabase client for session/auth
}

export const PracticeChat = ({ practiceId, mode, supabase }: PracticeChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [, setConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  if (!practiceId) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', background: '#f8f9fa', borderRadius: '8px' }}>
        Practice context unavailable.
      </div>
    );
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversation = async (token: string) => {
    try {
      const res = await fetch(`${ADMIN_API_BASE}/admin/practices/${practiceId}/conversation`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setConversationId(data.conversation_id);
      }
    } catch (err) {
      console.error('Failed to fetch conversation:', err);
    }
  };

  const fetchMessages = async (token: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${ADMIN_API_BASE}/admin/practices/${practiceId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch messages');
      const json = await res.json();
      setMessages(json.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('No auth session');

      const res = await fetch(`${ADMIN_API_BASE}/admin/practices/${practiceId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ body: newMessage.trim() })
      });

      if (!res.ok) throw new Error('Failed to send message');
      
      setNewMessage('');
      await fetchMessages(token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    let channel: any;

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token || !mounted) return;

      // 1. Fetch/Create conversation via API
      let currentConvId: string | null = null;
      try {
        const res = await fetch(`${ADMIN_API_BASE}/admin/practices/${practiceId}/conversation`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          currentConvId = data.conversation_id;
          setConversationId(currentConvId);
        }
      } catch (err) {
        console.error('Failed to init conversation:', err);
      }

      // 2. Fetch initial messages
      await fetchMessages(token);

      if (!currentConvId || !mounted) return;

      // 3. Setup Realtime using the ID we just got
      channel = supabase
        .channel(`chat:${currentConvId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${currentConvId}`
          },
          (payload: any) => {
            console.log('[PracticeChat] New message received via Realtime', payload);
            setMessages((prev) => {
              if (prev.find(m => m.id === payload.new.id)) return prev;
              return [...prev, payload.new];
            });
          }
        )
        .subscribe();
    };

    init();

    return () => {
      mounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [practiceId, mode]);

  return (
    <div className="practice-chat-container" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      background: '#fff',
      overflow: 'hidden'
    }}>
      {/* Messages Area */}
      <div className="messages-list" style={{
        flex: 1,
        padding: '1rem',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        {loading && messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#888', fontSize: '0.9rem' }}>Loading messages...</div>
        )}
        
        {!loading && messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#aaa', fontSize: '0.9rem', marginTop: '2rem' }}>
            No messages yet. Start the conversation!
          </div>
        )}

        {messages.map((msg: Message) => {
          const isAdmin = msg.sender_role === 'admin';
          const isPractice = msg.sender_role === 'practice';
          const isSystem = msg.sender_role === 'system' || msg.sender_role === 'assistant';

          let alignment: 'flex-start' | 'flex-end' | 'center' = 'flex-start';
          let bgColor = '#f0f0f0';
          let textColor = '#333';

          if (isAdmin) {
            alignment = 'flex-end';
            bgColor = '#2563eb';
            textColor = '#fff';
          } else if (isPractice) {
            alignment = 'flex-start';
            bgColor = '#16a34a';
            textColor = '#fff';
          } else if (isSystem) {
            alignment = 'center';
            bgColor = '#e5e7eb';
            textColor = '#4b5563';
          }

          return (
            <div key={msg.id} style={{
              alignSelf: alignment,
              maxWidth: isSystem ? '90%' : '70%',
              padding: '8px 12px',
              borderRadius: '8px',
              backgroundColor: bgColor,
              color: textColor,
              fontSize: '0.9rem',
              lineHeight: '1.4',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              textAlign: isSystem ? 'center' : 'left'
            }}>
              <div>{msg.body}</div>
              <div style={{ 
                fontSize: '0.7rem', 
                opacity: 0.7, 
                marginTop: '4px',
                textAlign: isAdmin ? 'right' : 'left'
              }}>
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="input-area" style={{
        padding: '1rem',
        borderTop: '1px solid #e0e0e0',
        background: '#f8f9fa',
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'flex-end'
      }}>
        <textarea
          value={newMessage}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: '0.5rem',
            borderRadius: '4px',
            border: '1px solid #ccc',
            resize: 'none',
            fontSize: '0.9rem',
            minHeight: '40px',
            maxHeight: '120px'
          }}
          onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button
          onClick={handleSend}
          disabled={!newMessage.trim() || sending}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            opacity: (!newMessage.trim() || sending) ? 0.5 : 1
          }}
        >
          {sending ? '...' : 'Send'}
        </button>
      </div>

      {error && (
        <div style={{
          padding: '0.5rem',
          background: '#f8d7da',
          color: '#721c24',
          fontSize: '0.8rem',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}
    </div>
  );
};
