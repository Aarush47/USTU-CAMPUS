-- Add canteen role to users table

begin;

-- Update the role check constraint to include 'canteen'
alter table public.users
  drop constraint if exists users_role_check;

alter table public.users
  add constraint users_role_check
  check (role in ('student', 'teacher', 'admin', 'canteen'));

-- Update RLS policies to include canteen role
drop policy if exists "users_insert_ustu" on public.users;
create policy "users_insert_ustu" on public.users
for insert with check (
  role in ('student', 'teacher', 'admin', 'canteen')
);

drop policy if exists "users_update_ustu" on public.users;
create policy "users_update_ustu" on public.users
for update using (true)
with check (
  role in ('student', 'teacher', 'admin', 'canteen')
);

commit;