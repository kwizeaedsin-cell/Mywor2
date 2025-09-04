-- seed_user_roles.sql
-- Usage: Run this in the Supabase SQL editor or via psql against your database.
-- Replace the emails with real user emails that exist in your `profiles` table.
-- This script finds the user id from `profiles.email` then inserts/upserts into `user_roles`.

-- Upsert admin role for admin@example.com
WITH u AS (
  SELECT id FROM public.profiles WHERE email = 'admin@example.com' LIMIT 1
)
INSERT INTO public.user_roles (user_id, role, is_active, created_by, created_at)
SELECT u.id, 'admin', true, u.id, now() FROM u
ON CONFLICT (user_id, role) DO UPDATE
  SET is_active = EXCLUDED.is_active, created_by = EXCLUDED.created_by, created_at = EXCLUDED.created_at;

-- Upsert agent role for agent@example.com
WITH u AS (
  SELECT id FROM public.profiles WHERE email = 'agent@example.com' LIMIT 1
)
INSERT INTO public.user_roles (user_id, role, is_active, created_by, created_at)
SELECT u.id, 'agent', true, u.id, now() FROM u
ON CONFLICT (user_id, role) DO UPDATE
  SET is_active = EXCLUDED.is_active, created_by = EXCLUDED.created_by, created_at = EXCLUDED.created_at;

-- Example: set a demo client role (optional)
WITH u AS (
  SELECT id FROM public.profiles WHERE email = 'client@example.com' LIMIT 1
)
INSERT INTO public.user_roles (user_id, role, is_active, created_by, created_at)
SELECT u.id, 'client', true, u.id, now() FROM u
ON CONFLICT (user_id, role) DO UPDATE
  SET is_active = EXCLUDED.is_active, created_by = EXCLUDED.created_by, created_at = EXCLUDED.created_at;

-- If your `profiles` table uses a different schema or the table is named differently, update the FROM clause above.
-- You can add as many inserts as you need by copying the pattern.

-- OPTIONAL: If you don't have profiles yet, you can manually create users in Supabase Auth and then run the above after they appear in `profiles`.
