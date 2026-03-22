-- Add Users table for role-based access control
-- Run this in Supabase SQL Editor

begin;

create table if not exists public.users (
  id bigint generated always as identity primary key,
  clerk_user_id text unique,
  email text unique not null,
  name text,
  role text not null default 'student' check (role in ('student', 'teacher', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create index for faster lookups
create index if not exists idx_users_email on public.users(email);
create index if not exists idx_users_clerk_user_id on public.users(clerk_user_id);
create index if not exists idx_users_role on public.users(role);

-- Enable RLS
alter table public.users enable row level security;

-- RLS Policy: Users can read their own profile
drop policy if exists "users_read_own" on public.users;
create policy "users_read_own" on public.users for select using (
  auth.uid()::text = clerk_user_id OR role = 'admin'
);

-- RLS Policy: Allow anon to check role (for public read)
drop policy if exists "users_read_by_email" on public.users;
create policy "users_read_by_email" on public.users for select using (true);

commit;
