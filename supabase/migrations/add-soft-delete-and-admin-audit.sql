-- Add soft-delete support and admin audit logs
-- Run this in Supabase SQL Editor on existing projects

begin;

alter table public.users add column if not exists is_active boolean not null default true;
create index if not exists idx_users_is_active on public.users(is_active);

create table if not exists public.admin_audit_logs (
  id bigint generated always as identity primary key,
  actor_user_id bigint not null references public.users(id) on delete cascade,
  target_user_id bigint references public.users(id) on delete set null,
  action text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_admin_audit_actor on public.admin_audit_logs(actor_user_id);
create index if not exists idx_admin_audit_target on public.admin_audit_logs(target_user_id);
create index if not exists idx_admin_audit_created_at on public.admin_audit_logs(created_at desc);

alter table public.admin_audit_logs enable row level security;

drop policy if exists "admin_audit_select" on public.admin_audit_logs;
create policy "admin_audit_select" on public.admin_audit_logs
for select using (
  exists (
    select 1
    from public.users u
    where u.id = actor_user_id
      and u.role = 'admin'
  )
);

drop policy if exists "admin_audit_insert" on public.admin_audit_logs;
create policy "admin_audit_insert" on public.admin_audit_logs
for insert with check (
  exists (
    select 1
    from public.users u
    where u.id = actor_user_id
      and u.role = 'admin'
  )
);

commit;
