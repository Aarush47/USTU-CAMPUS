-- Fix student_invitations RLS for Clerk + Supabase anon-key architecture
-- Run this in Supabase SQL Editor on existing projects

begin;

alter table public.student_invitations enable row level security;

-- Remove old JWT-based policies
 drop policy if exists "teachers_see_own_invitations" on public.student_invitations;
 drop policy if exists "teachers_create_invitations" on public.student_invitations;
 drop policy if exists "teachers_update_own_invitations" on public.student_invitations;
 drop policy if exists "teachers_delete_own_invitations" on public.student_invitations;
 drop policy if exists "public_read_invitation_by_code" on public.student_invitations;

-- Read policy (needed for invitation validation during student signup)
create policy "teachers_see_own_invitations" on public.student_invitations
for select using (true);

-- Insert policy (teacher/admin id must exist)
create policy "teachers_create_invitations" on public.student_invitations
for insert with check (
  email ilike '%@ustu.edu.in'
  and status = 'pending'
  and exists (
    select 1
    from public.users u
    where u.id = teacher_id
      and u.role in ('teacher', 'admin')
  )
);

-- Update policy
create policy "teachers_update_own_invitations" on public.student_invitations
for update using (
  exists (
    select 1
    from public.users u
    where u.id = teacher_id
      and u.role in ('teacher', 'admin')
  )
) with check (
  email ilike '%@ustu.edu.in'
  and exists (
    select 1
    from public.users u
    where u.id = teacher_id
      and u.role in ('teacher', 'admin')
  )
);

-- Delete policy
create policy "teachers_delete_own_invitations" on public.student_invitations
for delete using (
  exists (
    select 1
    from public.users u
    where u.id = teacher_id
      and u.role in ('teacher', 'admin')
  )
);

-- Keep the explicit validation-read policy for compatibility
create policy "public_read_invitation_by_code" on public.student_invitations
for select using (true);

commit;
