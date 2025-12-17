# Provider Portal (MVP, Read-Only)

React + Vite app for practice users to log in and view their leads (RLS-enforced).

## Env
Create `apps/provider-portal/.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Run
```
cd apps/provider-portal
npm install
npm run dev
```

## Routes
- `/login` – email/password auth
- `/leads` – read-only leads list (RLS enforced)
- `/leads/:id` – read-only lead detail
- `/appointments` – placeholder

## Notes
- Uses anon key + user session; never uses service role key.
- No write operations beyond auth.
- RLS must be enabled on the backend to restrict to the user’s practice.

