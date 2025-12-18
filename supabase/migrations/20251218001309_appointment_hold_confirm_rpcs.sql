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
  v_day_of_week int;
  v_has_availability boolean;
  v_overlap_count int;
  v_appt public.appointments;
begin
  v_day_of_week := extract(dow from p_start_time);

  -- Must be inside an 'available' block
  select exists (
    select 1
    from public.availability_blocks ab
    where ab.practice_id = p_practice_id
      and ab.day_of_week = v_day_of_week
      and ab.type = 'available'
      and p_start_time::time >= ab.start_time
      and p_end_time::time <= ab.end_time
  )
  into v_has_availability;

  if not v_has_availability then
    raise exception 'Time slot outside availability'
      using errcode = 'P0001';
  end if;

  -- Block if overlaps an existing scheduled appt OR a non-expired hold
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


create or replace function public.admin_confirm_appointment_hold(
  p_appointment_id uuid
)
returns public.appointments
language plpgsql
security definer
as $$
declare
  v_appt public.appointments;
  v_overlap_count int;
begin
  select *
    into v_appt
  from public.appointments
  where id = p_appointment_id;

  if not found then
    raise exception 'Hold not found'
      using errcode = 'P0001';
  end if;

  if v_appt.status != 'hold' then
    raise exception 'Appointment is not a hold'
      using errcode = 'P0001';
  end if;

  if v_appt.expires_at is null or v_appt.expires_at <= now() then
    raise exception 'Hold expired'
      using errcode = 'P0001';
  end if;

  -- Re-check overlap at confirm time (another booking could have happened)
  select count(*)
    into v_overlap_count
  from public.appointments a
  where a.practice_id = v_appt.practice_id
    and a.id <> v_appt.id
    and (
      (a.status != 'canceled' and a.status != 'hold')
      or (a.status = 'hold' and a.expires_at is not null and a.expires_at > now())
    )
    and tstzrange(a.start_time, a.end_time, '[)')
        && tstzrange(v_appt.start_time, v_appt.end_time, '[)');

  if v_overlap_count > 0 then
    raise exception 'Time slot unavailable (overlap)'
      using errcode = 'P0001';
  end if;

  update public.appointments
     set status = 'scheduled',
         expires_at = null
   where id = v_appt.id
   returning * into v_appt;

  return v_appt;
end;
$$;

