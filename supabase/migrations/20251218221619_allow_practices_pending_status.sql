-- Allow practices.status to include 'pending' for onboarding gate

ALTER TABLE practices
DROP CONSTRAINT IF EXISTS practices_status_check;

ALTER TABLE practices
ADD CONSTRAINT practices_status_check
CHECK (status IN ('active', 'paused', 'pending'));


