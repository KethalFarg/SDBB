# Admin Portal

This is the frontend admin interface for the SD System.

## Setup

1. **Environment Variables**:
   Create a file named `.env` in this directory (`apps/admin-portal/.env`).
   Add the following variables, **one per line**:

   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_MAPBOX_TOKEN=your_mapbox_token
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run**:
   ```bash
   npm run dev
   ```

## Troubleshooting

### API Errors
- **401 Unauthorized**: You are not logged in, or your session has expired. Check if `VITE_SUPABASE_ANON_KEY` is correct.
- **403 Forbidden**: You are logged in, but your user ID is not in the `admin_users` table.
  - **Fix**: Run this SQL in Supabase:
    ```sql
    INSERT INTO admin_users (user_id) VALUES ('your-user-uuid');
    ```
- **404 Not Found**: The API endpoint path is incorrect or the Edge Function is not deployed/serving.

### Map Issues
- **Map not loading**: Check `VITE_MAPBOX_TOKEN`.
- **Missing styles**: Ensure `mapbox-gl.css` is imported (should be handled in `main.tsx`).

