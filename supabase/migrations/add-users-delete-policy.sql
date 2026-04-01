-- Add delete policy for users table (required for permanent delete from admin UI)
-- Run this in Supabase SQL Editor

begin;

alter table public.users enable row level security;

drop policy if exists "users_delete_ustu" on public.users;
create policy "users_delete_ustu" on public.users
for delete using (
  email ilike '%@ustu.edu.in'
);

commit;
