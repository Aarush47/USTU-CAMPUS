-- Add admin approval status for user onboarding
-- Run this in Supabase SQL Editor

begin;

alter table public.users
  add column if not exists is_approved boolean not null default true;

create index if not exists idx_users_is_approved on public.users(is_approved);

commit;
