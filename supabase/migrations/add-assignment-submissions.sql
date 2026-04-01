begin;

create table if not exists public.assignment_submissions (
  id bigint generated always as identity primary key,
  assignment_id bigint not null references public.assignments(id) on delete cascade,
  student_user_id bigint not null references public.users(id) on delete cascade,
  submission_text text,
  submission_url text,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (assignment_id, student_user_id)
);

create index if not exists idx_assignment_submissions_assignment_id
  on public.assignment_submissions(assignment_id);

create index if not exists idx_assignment_submissions_student_user_id
  on public.assignment_submissions(student_user_id);

alter table public.assignment_submissions enable row level security;

drop policy if exists "assignment_submissions_select" on public.assignment_submissions;
create policy "assignment_submissions_select" on public.assignment_submissions
for select using (true);

drop policy if exists "assignment_submissions_insert" on public.assignment_submissions;
create policy "assignment_submissions_insert" on public.assignment_submissions
for insert with check (
  exists (
    select 1
    from public.users student
    where student.id = student_user_id
      and student.role = 'student'
      and student.is_active = true
  )
);

drop policy if exists "assignment_submissions_update" on public.assignment_submissions;
create policy "assignment_submissions_update" on public.assignment_submissions
for update using (
  exists (
    select 1
    from public.users student
    where student.id = student_user_id
      and student.role = 'student'
      and student.is_active = true
  )
) with check (
  exists (
    select 1
    from public.users student
    where student.id = student_user_id
      and student.role = 'student'
      and student.is_active = true
  )
);

drop policy if exists "assignment_submissions_delete" on public.assignment_submissions;
create policy "assignment_submissions_delete" on public.assignment_submissions
for delete using (
  exists (
    select 1
    from public.users student
    where student.id = student_user_id
      and student.role = 'student'
      and student.is_active = true
  )
);

commit;
