-- Add appointment holds support
-- 1. Add expires_at column
-- 2. Update status check constraint to include 'hold'

ALTER TABLE public.appointments
ADD COLUMN expires_at timestamptz;

-- Drop old constraint and add new one
ALTER TABLE public.appointments
DROP CONSTRAINT appointments_status_check;

ALTER TABLE public.appointments
ADD CONSTRAINT appointments_status_check
CHECK (status IN ('scheduled', 'show', 'no_show', 'pending', 'canceled', 'hold'));

