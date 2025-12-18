create or replace function public.public_get_slots_by_zip(
  p_zip text,
  p_date date,
  p_slot_minutes integer default 30
)
returns table (
  slot_start timestamptz,
  slot_end timestamptz
)
language plpgsql
security definer
as $$
declare
  v_zip_lat double precision;
  v_zip_lng double precision;
  v_practice_id uuid;
  v_day_of_week int;
begin
  -- 1. ZIP -> practice resolution
  select lat, lng into v_zip_lat, v_zip_lng
  from public.zip_geo
  where zip = p_zip;

  if not found then
    raise exception 'No practice available for ZIP'
      using errcode = 'P0001';
  end if;

  -- Select ONE practice within radius
  select id into v_practice_id
  from public.practices
  where status = 'active'
    and lat is not null
    and lng is not null
    and radius_miles is not null
    and (
      3958.8 * acos(
        least(1.0, greatest(-1.0, 
          cos(radians(v_zip_lat)) * cos(radians(lat)) *
          cos(radians(lng) - radians(v_zip_lng)) +
          sin(radians(v_zip_lat)) * sin(radians(lat))
        ))
      ) <= radius_miles
    )
  limit 1;

  if v_practice_id is null then
    raise exception 'No practice available for ZIP'
      using errcode = 'P0001';
  end if;

  -- 2. Availability source
  v_day_of_week := extract(dow from p_date);

  -- 3 & 4. Slot generation and exclusion
  return query
  with availability as (
    select 
      (p_date + start_time)::timestamptz as block_start,
      (p_date + end_time)::timestamptz as block_end
    from public.availability_blocks
    where practice_id = v_practice_id
      and type = 'available'
      and day_of_week = v_day_of_week
  ),
  slots as (
    select 
      s as slot_start,
      s + (p_slot_minutes || ' minutes')::interval as slot_end
    from availability,
    generate_series(block_start, block_end - (p_slot_minutes || ' minutes')::interval, (p_slot_minutes || ' minutes')::interval) s
  )
  select s.slot_start, s.slot_end
  from slots s
  where not exists (
    select 1
    from public.appointments a
    where a.practice_id = v_practice_id
      and (
        -- Overlaps a scheduled appointment
        a.status = 'scheduled'
        -- Overlaps an ACTIVE hold
        or (a.status = 'hold' and (a.expires_at is null or a.expires_at > now()))
      )
      and tstzrange(a.start_time, a.end_time, '[)') 
          && tstzrange(s.slot_start, s.slot_end, '[)')
  )
  order by s.slot_start;
end;
$$;

