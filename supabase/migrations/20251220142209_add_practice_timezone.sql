ALTER TABLE practices
ADD COLUMN IF NOT EXISTS timezone text;

UPDATE practices
SET timezone = 'America/New_York'
WHERE timezone IS NULL;
