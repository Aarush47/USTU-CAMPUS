-- Add feedback submission system for course feedback

begin;

create table if not exists public.feedback_submissions (
  id bigint generated always as identity primary key,
  class_id bigint not null references public.classes(id) on delete cascade,
  student_user_id bigint not null references public.users(id) on delete cascade,
  ratings jsonb not null default '{}',
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (class_id, student_user_id)
);

create index if not exists idx_feedback_submissions_class_id on public.feedback_submissions(class_id);
create index if not exists idx_feedback_submissions_student_user_id on public.feedback_submissions(student_user_id);
create index if not exists idx_feedback_submissions_created_at on public.feedback_submissions(created_at desc);

alter table public.feedback_submissions enable row level security;

-- Allow all authenticated users to read feedback
drop policy if exists "feedback_submissions_select" on public.feedback_submissions;
create policy "feedback_submissions_select" on public.feedback_submissions
for select using (true);

-- Allow students to insert feedback for their enrolled classes
drop policy if exists "feedback_submissions_insert" on public.feedback_submissions;
create policy "feedback_submissions_insert" on public.feedback_submissions
for insert with check (
  exists (
    select 1
    from public.class_enrollments ce
    where ce.class_id = feedback_submissions.class_id
      and ce.student_user_id = feedback_submissions.student_user_id
  )
);

-- Allow students to update their own feedback
drop policy if exists "feedback_submissions_update" on public.feedback_submissions;
create policy "feedback_submissions_update" on public.feedback_submissions
for update using (
  student_user_id = (select id from public.users where clerk_user_id = current_user_id()::text)
) with check (
  student_user_id = (select id from public.users where clerk_user_id = current_user_id()::text)
);

-- Allow students to delete their own feedback
drop policy if exists "feedback_submissions_delete" on public.feedback_submissions;
create policy "feedback_submissions_delete" on public.feedback_submissions
for delete using (
  student_user_id = (select id from public.users where clerk_user_id = current_user_id()::text)
);

commit;
