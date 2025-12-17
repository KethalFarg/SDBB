-- Future-proofing: Availability Exceptions
-- This table is not yet used in the UI, but provided as a hook for 
-- date-specific overrides (vacations, holidays, or specific date openings).
-- Override Model: [Weekly Template] + [Date Exceptions]

CREATE TABLE availability_exceptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_id uuid NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  exception_date date NOT NULL,
  start_time time, -- if null, practice is closed for the day
  end_time time,   -- if null, practice is closed for the day
  is_available boolean DEFAULT false, -- false means 'blocked/closed'
  reason text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE availability_exceptions ENABLE ROW LEVEL SECURITY;

-- Practice users manage their exceptions
CREATE POLICY "Practice users manage availability exceptions" ON availability_exceptions
  FOR ALL USING (practice_id = (SELECT get_my_practice_id()))
  WITH CHECK (practice_id = (SELECT get_my_practice_id()));

-- Index for date queries
CREATE INDEX idx_availability_exceptions_date ON availability_exceptions(practice_id, exception_date);

