-- Add editable profile fields for all roles and relax users write policy

begin;

alter table public.users
  add column if not exists phone text,
  add column if not exists address text,
  add column if not exists date_of_birth date,
  add column if not exists blood_group text,
  add column if not exists department text,
  add column if not exists bio text;

create index if not exists idx_users_department on public.users(department);

alter table public.users enable row level security;

drop policy if exists "users_insert_ustu" on public.users;
create policy "users_insert_ustu" on public.users
for insert with check (
  role in ('student', 'teacher', 'admin')
);

drop policy if exists "users_update_ustu" on public.users;
create policy "users_update_ustu" on public.users
for update using (true)
with check (
  role in ('student', 'teacher', 'admin')
);

commit;
