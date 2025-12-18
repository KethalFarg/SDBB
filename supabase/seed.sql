-- Supabase Seed Data (Local-Only)
-- Safe to re-run via ON CONFLICT DO NOTHING

-- 1. Create a primary test practice
INSERT INTO public.practices (
  id,
  name,
  address,
  lat,
  lng,
  radius_miles,
  status
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Local Test Practice',
  '123 Main St, New York, NY 10001',
  40.7128,
  -74.0060,
  25,
  'active'
) ON CONFLICT (id) DO NOTHING;

-- 2. Create a test lead assigned to that practice
INSERT INTO public.leads (
  id,
  practice_id,
  routing_outcome,
  first_name,
  last_name,
  email,
  phone,
  zip,
  source
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'assigned',
  'Test',
  'User',
  'test@example.com',
  '555-0100',
  '10001',
  'website'
) ON CONFLICT (id) DO NOTHING;

-- 3. Create a weekly availability block (Tuesday 09:00 - 17:00)
-- day_of_week: 0=Sunday, 1=Monday, 2=Tuesday, ...
INSERT INTO public.availability_blocks (
  id,
  practice_id,
  day_of_week,
  start_time,
  end_time,
  type
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  2,
  '09:00:00',
  '17:00:00',
  'available'
) ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------------
-- ZIP routing seed data (for ZIP -> practice resolution)
-- -------------------------------------------------------------------

-- Ensure the local test practice has coordinates + radius + active status
-- (Miami Beach-ish coords as example; any consistent coords are fine)
UPDATE public.practices
SET
  lat = 25.790654,
  lng = -80.1300455,
  radius_miles = 25,
  status = 'active'
WHERE id = '11111111-1111-1111-1111-111111111111';

-- Seed a ZIP centroid near the practice (example: 33139)
INSERT INTO public.zip_geo (zip, lat, lng, source)
VALUES ('33139', 25.790654, -80.1300455, 'seed')
ON CONFLICT (zip) DO UPDATE
SET lat = EXCLUDED.lat,
    lng = EXCLUDED.lng,
    source = EXCLUDED.source;

