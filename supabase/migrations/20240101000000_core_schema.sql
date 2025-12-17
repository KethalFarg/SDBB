/*
  # 001_core_schema.sql

  1. New Tables
    - practices
    - practice_users (Option A: user mapping for RLS)
    - zip_geo
    - routing_rules
    - leads
    - assessments
    - availability_blocks
    - appointments
    - designation_review
    - audit_log

  2. Security
    - Enable RLS on all tables
    - Add policies for:
      - Admin (service_role/superuser) access to everything
      - Practice users access to their own practice data
      - Public/Anon access where needed (none specified yet, mostly authenticated)
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. practices
CREATE TABLE practices (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  address text,
  lat double precision,
  lng double precision,
  radius_miles numeric,
  status text CHECK (status IN ('active', 'paused')) NOT NULL DEFAULT 'active',
  profile_payload jsonb DEFAULT '{}'::jsonb,
  booking_settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 1b. practice_users (For RLS - Option A)
CREATE TABLE practice_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  practice_id uuid NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  role text CHECK (role IN ('practice_user')) DEFAULT 'practice_user',
  created_at timestamptz DEFAULT now()
);

-- Index for querying users by practice
CREATE INDEX idx_practice_users_practice_id ON practice_users(practice_id);

-- 2. zip_geo
CREATE TABLE zip_geo (
  zip text PRIMARY KEY,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  source text,
  updated_at timestamptz DEFAULT now()
);

-- 3. routing_rules
CREATE TABLE routing_rules (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_id uuid NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  radius_miles numeric NOT NULL,
  exclusivity boolean DEFAULT true,
  priority int DEFAULT 1,
  status text CHECK (status IN ('active', 'paused')) NOT NULL DEFAULT 'active',
  effective_from timestamptz DEFAULT now(),
  effective_to timestamptz,
  created_by uuid, -- references auth.users(id) theoretically, but kept loose for now
  created_at timestamptz DEFAULT now()
);

-- 4. leads
CREATE TABLE leads (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_id uuid REFERENCES practices(id) ON DELETE SET NULL,
  routing_outcome text CHECK (routing_outcome IN ('assigned', 'designation')),
  designation_reason text,
  first_name text,
  last_name text,
  email text,
  phone text,
  zip text,
  source text CHECK (source IN ('website', 'quiz', 'ads', 'manual', 'other')),
  routing_snapshot jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- 5. assessments
CREATE TABLE assessments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  practice_id uuid NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  responses jsonb DEFAULT '{}'::jsonb,
  report_payload jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- 6. availability_blocks
CREATE TABLE availability_blocks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_id uuid NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  day_of_week int CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  type text DEFAULT 'new_patient',
  created_at timestamptz DEFAULT now()
);

-- 7. appointments
CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  practice_id uuid NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status text CHECK (status IN ('scheduled', 'show', 'no_show', 'pending', 'canceled')) DEFAULT 'pending',
  sales_outcome text CHECK (sales_outcome IN ('won', 'lost', 'pending')),
  objection text,
  source text CHECK (source IN ('call_center', 'website', 'ai_agent')),
  created_by text, -- user_id or agent_key_id
  created_at timestamptz DEFAULT now()
);

-- 8. designation_review
CREATE TABLE designation_review (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  reason_code text,
  notes text,
  assigned_practice_id uuid REFERENCES practices(id) ON DELETE SET NULL,
  resolved_by uuid, -- auth.users(id)
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 9. audit_log
CREATE TABLE audit_log (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  action text NOT NULL,
  performed_by text, -- admin user id / agent key
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_leads_zip ON leads(zip);
CREATE INDEX idx_leads_practice_created ON leads(practice_id, created_at);
CREATE INDEX idx_appointments_practice_start ON appointments(practice_id, start_time);
CREATE INDEX idx_zip_geo_zip ON zip_geo(zip);
CREATE INDEX idx_practices_status ON practices(status);


-- ENABLE RLS
ALTER TABLE practices ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE zip_geo ENABLE ROW LEVEL SECURITY;
ALTER TABLE routing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE designation_review ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's practice_id (single)
CREATE OR REPLACE FUNCTION get_my_practice_id()
RETURNS uuid
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT practice_id FROM practice_users WHERE user_id = auth.uid() LIMIT 1
$$;

-- RLS POLICIES

-- practices:
-- Admin (service role) has full access (implicit bypass)
-- Users can view their own practice
CREATE POLICY "Users can view assigned practice" ON practices
  FOR SELECT USING (id = (SELECT get_my_practice_id()));

-- practice_users:
-- Users can view their own assignment
CREATE POLICY "Users can view own assignment" ON practice_users
  FOR SELECT USING (user_id = auth.uid());

-- zip_geo:
-- Publicly readable for routing (or restricted to auth users if preferred, assuming auth for now)
CREATE POLICY "Authenticated users can read zip_geo" ON zip_geo
  FOR SELECT TO authenticated USING (true);

-- routing_rules:
-- Visible to Admin only (no policy for regular users implies no access)
-- Note: Service role bypasses RLS, so no specific policy needed for admin unless we use a claim.
-- PRD says: "No visibility into routing rules" for practice users.

-- leads:
-- Practice users can view leads assigned to their practice
CREATE POLICY "Practice users view assigned leads" ON leads
  FOR SELECT USING (practice_id = (SELECT get_my_practice_id()));

-- assessments:
-- Practice users view assessments for their practice
CREATE POLICY "Practice users view assigned assessments" ON assessments
  FOR SELECT USING (practice_id = (SELECT get_my_practice_id()));

-- availability_blocks:
-- Practice users manage their own blocks
CREATE POLICY "Practice users manage availability" ON availability_blocks
  FOR ALL USING (practice_id = (SELECT get_my_practice_id()))
  WITH CHECK (practice_id = (SELECT get_my_practice_id()));

-- appointments:
-- Practice users manage their appointments
CREATE POLICY "Practice users manage appointments" ON appointments
  FOR ALL USING (practice_id = (SELECT get_my_practice_id()))
  WITH CHECK (practice_id = (SELECT get_my_practice_id()));

-- designation_review:
-- "Leads in designation_review visible only to admin"
-- So no policy for authenticated users.

-- audit_log:
-- "Admin views audit logs"
-- No policy for standard users.

