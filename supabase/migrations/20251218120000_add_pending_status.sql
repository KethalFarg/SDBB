ALTER TABLE practices DROP CONSTRAINT practices_status_check;
ALTER TABLE practices ADD CONSTRAINT practices_status_check CHECK (status IN ('active', 'paused', 'pending'));
ALTER TABLE practices ALTER COLUMN status SET DEFAULT 'pending';

