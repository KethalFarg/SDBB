-- Migration: Add RPC for fetching appointments by date and timezone
-- Description: Robust way to fetch practice appointments for a specific day in its local timezone.

CREATE OR REPLACE FUNCTION public.admin_get_appointments_for_date(
  p_practice_id uuid,
  p_date date,
  p_tz text DEFAULT 'America/New_York'
)
RETURNS SETOF public.appointments
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT a.*
  FROM public.appointments a
  WHERE a.practice_id = p_practice_id
    AND a.status <> 'canceled'
    AND ((a.start_time AT TIME ZONE p_tz)::date = p_date)
  ORDER BY a.start_time ASC;
$$;




