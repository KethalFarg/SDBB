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
  v_day_of_week int;
  v_has_availability boolean;
  v_overlap_count int;
  v_appt public.appointments;
begin
  -- Determine day of week (0 = Sunday)
  v_day_of_week := extract(dow from p_start_time);

  -- Availability enforcement: must fall entirely inside an 'available' block
  select exists (
    select 1
    from public.availability_blocks ab
    where ab.practice_id = p_practice_id
      and ab.day_of_week = v_day_of_week
      and ab.type = 'available'
      and p_start_time::time >= ab.start_time
      and p_end_time::time < ab.end_time
  )
  into v_has_availability;

  if not v_has_availability then
    raise exception 'Time slot outside availability'
      using errcode = 'P0001';
  end if;

  -- Overlap prevention (ignore canceled)
  select count(*)
    into v_overlap_count
  from public.appointments a
  where a.practice_id = p_practice_id
    and a.status != 'canceled'
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

