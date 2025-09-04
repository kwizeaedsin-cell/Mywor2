Seed instructions: assign admin and agent roles

1) Create the users
- In Supabase > Authentication, create user accounts for the admin and agent emails you want to use (e.g. admin@example.com, agent@example.com).
- After creating them, the `profiles` table should contain rows with their `id` and `email`.

2) Run seed SQL
- Open Supabase > SQL Editor and paste the SQL from `seed_user_roles.sql`.
- Update the emails in the SQL to match the users you created if needed.
- Run the query. It will upsert rows into `user_roles` for the specified users.

3) Verify
- Check the `user_roles` table to confirm the `admin` and `agent` rows exist and `is_active` is true.

Notes
- The script uses `profiles.email` to find the right `user_id`. If your project uses a different table or schema for profiles, update the query accordingly.
- For automation, you can run the SQL via the Supabase CLI or psql.
