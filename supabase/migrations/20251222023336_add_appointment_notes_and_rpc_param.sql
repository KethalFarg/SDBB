-- Add notes column to appointments table and update admin_create_appointment RPC

-- 1. Add nullable notes column
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS notes text;

-- 2. Extend admin_create_appointment with p_notes
CREATE OR REPLACE FUNCTION public.admin_create_appointment(
  p_practice_id uuid,
  p_lead_id uuid,
  p_start_time timestamptz,
  p_end_time timestamptz,
  p_source text,
  p_created_by text,
  p_notes text DEFAULT NULL
)
RETURNS public.appointments
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tz text;
  v_start_wall timestamp;
  v_end_wall timestamp;
  v_day_of_week int;
  v_has_availability boolean;
  v_overlap_count int;
  v_appt public.appointments;
BEGIN
  -- Get the practice timezone
  SELECT timezone INTO v_tz FROM public.practices WHERE id = p_practice_id;
  IF v_tz IS NULL THEN 
    v_tz := 'America/New_York'; 
  END IF;

  -- Convert to local wall-clock time
  v_start_wall := p_start_time AT TIME ZONE v_tz;
  v_end_wall := p_end_time AT TIME ZONE v_tz;
  
  -- Determine day of week (0 = Sunday) from local time
  v_day_of_week := EXTRACT(DOW FROM v_start_wall);

  -- Availability enforcement: must fall entirely inside an 'available' or 'new_patient' block
  SELECT EXISTS (
    SELECT 1
    FROM public.availability_blocks ab
    WHERE ab.practice_id = p_practice_id
      AND ab.day_of_week = v_day_of_week
      AND ab.type IN ('available', 'new_patient')
      AND v_start_wall::time >= ab.start_time
      AND v_end_wall::time <= ab.end_time
  )
  INTO v_has_availability;

  IF NOT v_has_availability THEN
    RAISE EXCEPTION 'Time slot outside availability'
      USING ERRCODE = 'P0001';
  END IF;

  -- Overlap prevention
  SELECT COUNT(*)
    INTO v_overlap_count
  FROM public.appointments a
  WHERE a.practice_id = p_practice_id
    AND (
      (a.status != 'canceled' AND a.status != 'hold')
      OR (a.status = 'hold' AND (a.expires_at IS NULL OR a.expires_at > NOW()))
    )
    AND tstzrange(a.start_time, a.end_time, '[)')
        && tstzrange(p_start_time, p_end_time, '[)');

  IF v_overlap_count > 0 THEN
    RAISE EXCEPTION 'Time slot unavailable (overlap)'
      USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.appointments (
    practice_id,
    lead_id,
    start_time,
    end_time,
    status,
    source,
    created_by,
    notes
  )
  VALUES (
    p_practice_id,
    p_lead_id,
    p_start_time,
    p_end_time,
    'scheduled',
    p_source,
    p_created_by,
    p_notes
  )
  RETURNING * INTO v_appt;

  RETURN v_appt;
END;
$$;

