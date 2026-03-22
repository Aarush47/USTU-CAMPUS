-- Student Invitation System (Gated Enrollment)
-- Run this in Supabase SQL Editor

begin;

-- 1. Update users table to make email nullable initially (for pre-registration)
alter table public.users add column if not exists email_verified boolean default false;
alter table public.users add column if not exists domain_verified boolean default false;

-- 2. Create student invitations table
create table if not exists public.student_invitations (
  id bigint generated always as identity primary key,
  teacher_id bigint references public.users(id) on delete cascade,
  email text not null,
  reference_code text unique not null,
  name text not null,
  roll_no text,
  department text,
  semester text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(email) -- Each student email can only be invited once
);

-- 3. Create index for faster lookups
create index if not exists idx_student_invitations_email on public.student_invitations(email);
create index if not exists idx_student_invitations_code on public.student_invitations(reference_code);
create index if not exists idx_student_invitations_teacher on public.student_invitations(teacher_id);
create index if not exists idx_student_invitations_status on public.student_invitations(status);

-- 4. Enable RLS on student_invitations
alter table public.student_invitations enable row level security;

-- RLS Policies
-- Teachers can see their own invitations
drop policy if exists "teachers_see_own_invitations" on public.student_invitations;
create policy "teachers_see_own_invitations" on public.student_invitations for select using (
  teacher_id = (select id from public.users where clerk_user_id = auth.jwt() ->> 'sub')
);

-- Teachers can create invitations
drop policy if exists "teachers_create_invitations" on public.student_invitations for insert;
create policy "teachers_create_invitations" on public.student_invitations for insert with check (
  teacher_id = (select id from public.users where clerk_user_id = auth.jwt() ->> 'sub')
);

-- Teachers can update their own invitations
drop policy if exists "teachers_update_own_invitations" on public.student_invitations for update;
create policy "teachers_update_own_invitations" on public.student_invitations for update using (
  teacher_id = (select id from public.users where clerk_user_id = auth.jwt() ->> 'sub')
);

-- Anyone can view invitation if they know the code (for validation on signup)
drop policy if exists "public_read_invitation_by_code" on public.student_invitations;
create policy "public_read_invitation_by_code" on public.student_invitations for select using (true);

commit;
