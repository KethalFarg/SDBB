-- Create conversations table
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id uuid NOT NULL UNIQUE REFERENCES public.practices(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create messages table
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_user_id uuid,
  sender_role text NOT NULL CHECK (sender_role IN ('admin', 'practice', 'system', 'assistant')),
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexing for performance
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_conversations_practice_id ON public.conversations(practice_id);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Conversations Policies
CREATE POLICY "Admins can view all conversations" ON public.conversations
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Practice users can view own conversation" ON public.conversations
  FOR SELECT USING (practice_id::text = (auth.jwt()->>'practice_id'));

-- Messages Policies
CREATE POLICY "Admins can view all messages" ON public.messages
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admins can insert all messages" ON public.messages
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Practice users can view messages in own conversation" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations c 
      WHERE c.id = conversation_id 
      AND c.practice_id::text = (auth.jwt()->>'practice_id')
    )
  );

CREATE POLICY "Practice users can insert messages in own conversation" ON public.messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations c 
      WHERE c.id = conversation_id 
      AND c.practice_id::text = (auth.jwt()->>'practice_id')
    )
  );

