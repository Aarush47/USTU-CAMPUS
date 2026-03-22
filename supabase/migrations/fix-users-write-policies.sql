-- Fix users table write permissions for client-side Clerk sync
-- Run this in Supabase SQL Editor if add-users-table.sql was already applied

begin;

alter table public.users enable row level security;

-- Read policies (idempotent)
drop policy if exists "users_read_own" on public.users;
create policy "users_read_own" on public.users for select using (
  auth.uid()::text = clerk_user_id OR role = 'admin'
);

drop policy if exists "users_read_by_email" on public.users;
create policy "users_read_by_email" on public.users for select using (true);

-- Missing write policies
drop policy if exists "users_insert_ustu" on public.users;
create policy "users_insert_ustu" on public.users for insert with check (
  email ilike '%@ustu.edu.in'
  and role in ('student', 'teacher', 'admin')
);

drop policy if exists "users_update_ustu" on public.users;
create policy "users_update_ustu" on public.users for update using (
  email ilike '%@ustu.edu.in'
) with check (
  email ilike '%@ustu.edu.in'
  and role in ('student', 'teacher', 'admin')
);

commit;
