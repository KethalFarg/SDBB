-- Fix for "Time slot outside availability" by ensuring wall-clock comparisons in the practice timezone

-- 1. Fix admin_create_appointment
create or replace function public.admin_create_appointment(
  p_practice_id uuid,
  p_lead_id uuid,
  p_start_time timestamptz,
  p_end_time timestamptz,
  p_source text,
  p_created_by text
)
returns public.appointments
language plpgsql
security definer
as $$
declare
  v_tz text;
  v_start_wall timestamp;
  v_end_wall timestamp;
  v_day_of_week int;
  v_has_availability boolean;
  v_overlap_count int;
  v_appt public.appointments;
begin
  -- Get the practice timezone
  select timezone into v_tz from public.practices where id = p_practice_id;
  if v_tz is null then 
    v_tz := 'America/New_York'; 
  end if;

  -- Convert to local wall-clock time
  v_start_wall := p_start_time at time zone v_tz;
  v_end_wall := p_end_time at time zone v_tz;
  
  -- Determine day of week (0 = Sunday) from local time
  v_day_of_week := extract(dow from v_start_wall);

  -- TEMP DEBUG LOG
  raise log '[admin_create_appointment] tz=%, start_wall=%, end_wall=%, dow=%, start_time_only=%, end_time_only=%, p_start=%, p_end=%',
    v_tz, v_start_wall, v_end_wall, v_day_of_week, v_start_wall::time, v_end_wall::time, p_start_time, p_end_time;

  -- Availability enforcement: must fall entirely inside an 'available' or 'new_patient' block
  select exists (
    select 1
    from public.availability_blocks ab
    where ab.practice_id = p_practice_id
      and ab.day_of_week = v_day_of_week
      and ab.type in ('available', 'new_patient')
      and v_start_wall::time >= ab.start_time
      and v_end_wall::time <= ab.end_time
  )
  into v_has_availability;

  if not v_has_availability then
    raise exception 'Time slot outside availability'
      using errcode = 'P0001';
  end if;

  -- Overlap prevention
  select count(*)
    into v_overlap_count
  from public.appointments a
  where a.practice_id = p_practice_id
    and (
      (a.status != 'canceled' and a.status != 'hold')
      or (a.status = 'hold' and (a.expires_at is null or a.expires_at > now()))
    )
    and tstzrange(a.start_time, a.end_time, '[)')
        && tstzrange(p_start_time, p_end_time, '[)');

  if v_overlap_count > 0 then
    raise exception 'Time slot unavailable (overlap)'
      using errcode = 'P0001';
  end if;

  insert into public.appointments (
    practice_id,
    lead_id,
    start_time,
    end_time,
    status,
    source,
    created_by
  )
  values (
    p_practice_id,
    p_lead_id,
    p_start_time,
    p_end_time,
    'scheduled',
    p_source,
    p_created_by
  )
  returning * into v_appt;

  return v_appt;
end;
$$;

-- 2. Fix admin_create_appointment_hold
create or replace function public.admin_create_appointment_hold(
  p_practice_id uuid,
  p_lead_id uuid,
  p_start_time timestamptz,
  p_end_time timestamptz,
  p_source text,
  p_created_by text,
  p_hold_minutes int default 10
)
returns public.appointments
language plpgsql
security definer
as $$
declare
  v_tz text;
  v_start_wall timestamp;
  v_end_wall timestamp;
  v_day_of_week int;
  v_has_availability boolean;
  v_overlap_count int;
  v_appt public.appointments;
begin
  -- Get the practice timezone
  select timezone into v_tz from public.practices where id = p_practice_id;
  if v_tz is null then 
    v_tz := 'America/New_York'; 
  end if;

  -- Convert to local wall-clock time
  v_start_wall := p_start_time at time zone v_tz;
  v_end_wall := p_end_time at time zone v_tz;
  
  -- Determine day of week (0 = Sunday) from local time
  v_day_of_week := extract(dow from v_start_wall);

  -- TEMP DEBUG LOG
  raise log '[admin_create_appointment_hold] tz=%, start_wall=%, end_wall=%, dow=%, start_time_only=%, end_time_only=%, p_start=%, p_end=%',
    v_tz, v_start_wall, v_end_wall, v_day_of_week, v_start_wall::time, v_end_wall::time, p_start_time, p_end_time;

  -- Availability enforcement: must fall entirely inside an 'available' or 'new_patient' block
  select exists (
    select 1
    from public.availability_blocks ab
    where ab.practice_id = p_practice_id
      and ab.day_of_week = v_day_of_week
      and ab.type in ('available', 'new_patient')
      and v_start_wall::time >= ab.start_time
      and v_end_wall::time <= ab.end_time
  )
  into v_has_availability;

  if not v_has_availability then
    raise exception 'Time slot outside availability'
      using errcode = 'P0001';
  end if;

  -- Overlap prevention
  select count(*)
    into v_overlap_count
  from public.appointments a
  where a.practice_id = p_practice_id
    and (
      (a.status != 'canceled' and a.status != 'hold')
      or (a.status = 'hold' and a.expires_at is not null and a.expires_at > now())
    )
    and tstzrange(a.start_time, a.end_time, '[)')
        && tstzrange(p_start_time, p_end_time, '[)');

  if v_overlap_count > 0 then
    raise exception 'Time slot unavailable (overlap)'
      using errcode = 'P0001';
  end if;

  insert into public.appointments (
    practice_id,
    lead_id,
    start_time,
    end_time,
    status,
    source,
    created_by,
    expires_at
  )
  values (
    p_practice_id,
    p_lead_id,
    p_start_time,
    p_end_time,
    'hold',
    p_source,
    p_created_by,
    now() + make_interval(mins => p_hold_minutes)
  )
  returning * into v_appt;

  return v_appt;
end;
$$;
