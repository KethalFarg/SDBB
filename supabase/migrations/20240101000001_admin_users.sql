/*
  # 002_admin_users.sql

  1. New Tables
    - admin_users: Tracks users with platform-wide admin privileges.
  
  2. Security
    - Enable RLS on admin_users.
    - Only Service Role can manage this table (implicitly, by not adding policies for users).
    - Policy: Allow authenticated users to READ their own row (to verify if they are admin client-side if needed).
*/

CREATE TABLE admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Allow users to check their own admin status
CREATE POLICY "Users can check own admin status" ON admin_users
  FOR SELECT USING (user_id = auth.uid());

