-- Add canteen access control for students

begin;

alter table public.users
  add column if not exists canteen_access boolean not null default true;

-- Update RLS policies to allow only admins to manage canteen access
drop policy if exists "users_update_canteen_access" on public.users;
create policy "users_update_canteen_access" on public.users
for update using (
  exists (
    select 1
    from public.users updater
    where updater.clerk_user_id = auth.uid()::text
      and updater.role = 'admin'
  )
) with check (
  exists (
    select 1
    from public.users updater
    where updater.clerk_user_id = auth.uid()::text
      and updater.role = 'admin'
  )
);

commit;