-- Migration to add Clerk user support to existing database
-- This adds clerk_user_id column and updates RLS policies for per-user access

-- Add clerk_user_id column to student_profile if it doesn't exist
alter table if exists public.student_profile
  add column if not exists clerk_user_id text unique;

-- Add clerk_user_id column to related tables if they don't exist
alter table if exists public.academic_info
  add column if not exists clerk_user_id text;

alter table if exists public.student_skills
  add column if not exists clerk_user_id text;

alter table if exists public.student_achievements
  add column if not exists clerk_user_id text;

alter table if exists public.attendance_records
  add column if not exists clerk_user_id text;

alter table if exists public.feedback_submissions
  add column if not exists clerk_user_id text;

-- Create indexes for faster lookups
create index if not exists idx_student_profile_clerk_user_id on public.student_profile(clerk_user_id);
create index if not exists idx_academic_info_clerk_user_id on public.academic_info(clerk_user_id);
create index if not exists idx_student_skills_clerk_user_id on public.student_skills(clerk_user_id);
create index if not exists idx_student_achievements_clerk_user_id on public.student_achievements(clerk_user_id);
create index if not exists idx_attendance_records_clerk_user_id on public.attendance_records(clerk_user_id);
create index if not exists idx_feedback_submissions_clerk_user_id on public.feedback_submissions(clerk_user_id);

-- Update RLS policies for per-user access (keep read-all for other users for now)
drop policy if exists "public read student_profile" on public.student_profile;
create policy "public read student_profile" on public.student_profile for select using (true);

drop policy if exists "users can update own profile" on public.student_profile;
create policy "users can update own profile" on public.student_profile 
  for update using (clerk_user_id = current_user_id()::text) 
  with check (clerk_user_id = current_user_id()::text);

drop policy if exists "public read academic_info" on public.academic_info;
create policy "public read academic_info" on public.academic_info for select using (true);

drop policy if exists "public read student_skills" on public.student_skills;
create policy "public read student_skills" on public.student_skills for select using (true);

drop policy if exists "public read student_achievements" on public.student_achievements;
create policy "public read student_achievements" on public.student_achievements for select using (true);

drop policy if exists "public read attendance_records" on public.attendance_records;
create policy "public read attendance_records" on public.attendance_records for select using (true);

drop policy if exists "public insert feedback_submissions" on public.feedback_submissions;
create policy "public insert feedback_submissions" on public.feedback_submissions 
  for insert with check (true);

drop policy if exists "public read feedback_submissions" on public.feedback_submissions;
create policy "public read feedback_submissions" on public.feedback_submissions for select using (true);
