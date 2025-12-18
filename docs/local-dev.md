# Local Dev (Docker Supabase) Rules + Quickstart

## 1. TL;DR
- **Local Supabase and Cloud Supabase are separate universes.**
- If you switch `VITE_SUPABASE_URL` between cloud and `http://127.0.0.1:54321`, your logins/data will change.

## 2. Local Endpoints
- **Studio:** [http://127.0.0.1:54323](http://127.0.0.1:54323)
- **APIs Base:** `http://127.0.0.1:54321`
- **Edge Functions Base:** `http://127.0.0.1:54321/functions/v1`
- **REST Base:** `http://127.0.0.1:54321/rest/v1`

## 3. Provider Portal Env (Local)
Vite reads environment variables from `apps/provider-portal/.env.local`. Only variables prefixed with `VITE_` are exposed.

**Correct local contents:**
```bash
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<local publishable key from `supabase status`>
```
> **Note:** After changing `.env.local` you **MUST** restart `npm run dev` (Vite does not reload env vars automatically).

## 4. Website Booking Key (Local)
`WEBSITE_BOOKING_KEY` is required for public endpoints (passed via `x-sd-website-key` header).
- **Local test value:** `dev-test-key-123`
- **Location:** Lives in `supabase/functions/.env` for local functions development.

## 5. PostgREST Schema Cache Note
When you change SQL functions or RPC signatures and PostgREST cannot find them, restart the REST container to clear the cache:
```bash
docker restart supabase_rest_SD_System
```

## 6. Seed + Test IDs (Local)
The following IDs are automatically seeded:
- **Practice:** `11111111-1111-1111-1111-111111111111`
- **Lead:** `22222222-2222-2222-2222-222222222222`
- **Availability Block:** Tuesday (`day_of_week=2`), 09:00–17:00, `type='available'`

## 7. Local Provider Login (IMPORTANT)
If you switch from Cloud to Local, login will fail because Cloud users do not exist locally.

**How to log in locally:**
1. Create a user in local **Studio** -> **Auth** -> **Users** (email/password).
2. Copy the generated **User UUID**.
3. Link the user to the test practice using this SQL snippet in the SQL Editor:

```sql
insert into public.practice_users (user_id, practice_id)
values ('<AUTH_USER_ID>', '11111111-1111-1111-1111-111111111111')
on conflict do nothing;
```

## 8. Quick Test Checklist (Local)
- [ ] Run `supabase db reset` to ensure a clean state.
- [ ] Confirm **Slots** endpoint works:
  `GET /functions/v1/admin-api/public/slots?zip=33139&date=2025-12-23&slot_minutes=30` with `x-sd-website-key` header.
- [ ] Confirm **Booking Create** works.
- [ ] Confirm **Hold** -> **Confirm** flow works.

