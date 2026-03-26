-- Create shared academic tables that connect teacher and student portals
-- Run this in Supabase SQL Editor

begin;

create table if not exists public.class_enrollments (
  id bigint generated always as identity primary key,
  class_id bigint not null references public.classes(id) on delete cascade,
  student_user_id bigint not null references public.users(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  unique (class_id, student_user_id)
);

-- Compatibility for older schemas that used student_id.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'class_enrollments'
      and column_name = 'student_id'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'class_enrollments'
      and column_name = 'student_user_id'
  ) then
    alter table public.class_enrollments rename column student_id to student_user_id;
  end if;
end $$;

create index if not exists idx_class_enrollments_class_id on public.class_enrollments(class_id);
create index if not exists idx_class_enrollments_student_user_id on public.class_enrollments(student_user_id);

create table if not exists public.attendance_records (
  id bigint generated always as identity primary key,
  class_id bigint not null references public.classes(id) on delete cascade,
  student_user_id bigint not null references public.users(id) on delete cascade,
  marked_by_teacher_id bigint not null references public.users(id) on delete cascade,
  date date not null,
  status text not null check (status in ('Present', 'Absent', 'Late')),
  created_at timestamptz not null default now(),
  unique (class_id, student_user_id, date)
);

-- Compatibility for older schemas that used student_id/teacher_id.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'attendance_records'
      and column_name = 'student_id'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'attendance_records'
      and column_name = 'student_user_id'
  ) then
    alter table public.attendance_records rename column student_id to student_user_id;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'attendance_records'
      and column_name = 'teacher_id'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'attendance_records'
      and column_name = 'marked_by_teacher_id'
  ) then
    alter table public.attendance_records rename column teacher_id to marked_by_teacher_id;
  end if;
end $$;

-- Repair legacy attendance_records table shape if it already existed
-- with columns like: subject, status, time (without relational IDs).
alter table public.attendance_records
  add column if not exists class_id bigint,
  add column if not exists student_user_id bigint,
  add column if not exists marked_by_teacher_id bigint;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'attendance_records_class_id_fkey'
      and conrelid = 'public.attendance_records'::regclass
  ) then
    alter table public.attendance_records
      add constraint attendance_records_class_id_fkey
      foreign key (class_id) references public.classes(id) on delete cascade;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'attendance_records_student_user_id_fkey'
      and conrelid = 'public.attendance_records'::regclass
  ) then
    alter table public.attendance_records
      add constraint attendance_records_student_user_id_fkey
      foreign key (student_user_id) references public.users(id) on delete cascade;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'attendance_records_marked_by_teacher_id_fkey'
      and conrelid = 'public.attendance_records'::regclass
  ) then
    alter table public.attendance_records
      add constraint attendance_records_marked_by_teacher_id_fkey
      foreign key (marked_by_teacher_id) references public.users(id) on delete cascade;
  end if;
end $$;

create unique index if not exists idx_attendance_records_class_student_date_unique
on public.attendance_records(class_id, student_user_id, date);

create index if not exists idx_attendance_records_student_user_id on public.attendance_records(student_user_id);
create index if not exists idx_attendance_records_class_id on public.attendance_records(class_id);
create index if not exists idx_attendance_records_date on public.attendance_records(date desc);

create table if not exists public.assignments (
  id bigint generated always as identity primary key,
  class_id bigint not null references public.classes(id) on delete cascade,
  created_by_teacher_id bigint not null references public.users(id) on delete cascade,
  title text not null,
  description text,
  due_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_assignments_class_id on public.assignments(class_id);
create index if not exists idx_assignments_due_date on public.assignments(due_date);
create index if not exists idx_assignments_created_by_teacher on public.assignments(created_by_teacher_id);

create table if not exists public.learning_resources (
  id bigint generated always as identity primary key,
  class_id bigint not null references public.classes(id) on delete cascade,
  uploaded_by_teacher_id bigint not null references public.users(id) on delete cascade,
  title text not null,
  description text,
  resource_type text not null default 'link',
  url text,
  created_at timestamptz not null default now()
);

create index if not exists idx_learning_resources_class_id on public.learning_resources(class_id);
create index if not exists idx_learning_resources_created_at on public.learning_resources(created_at desc);

create table if not exists public.student_marks (
  id bigint generated always as identity primary key,
  student_user_id bigint not null references public.users(id) on delete cascade,
  class_id bigint references public.classes(id) on delete set null,
  subject text not null,
  semester int not null default 1,
  internal1 numeric not null default 0,
  internal2 numeric not null default 0,
  internal3 numeric not null default 0,
  assignment numeric not null default 0,
  total numeric not null default 0,
  max_marks numeric not null default 100,
  grade text not null default 'NA',
  created_by_teacher_id bigint references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Compatibility for older schemas that used student_id.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'student_marks'
      and column_name = 'student_id'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'student_marks'
      and column_name = 'student_user_id'
  ) then
    alter table public.student_marks rename column student_id to student_user_id;
  end if;
end $$;

create index if not exists idx_student_marks_student_user_id on public.student_marks(student_user_id);
create index if not exists idx_student_marks_semester on public.student_marks(semester desc);

alter table public.class_enrollments enable row level security;
alter table public.attendance_records enable row level security;
alter table public.assignments enable row level security;
alter table public.learning_resources enable row level security;
alter table public.student_marks enable row level security;

-- Reads are open to app users; write operations are constrained by role checks.
drop policy if exists "class_enrollments_select" on public.class_enrollments;
create policy "class_enrollments_select" on public.class_enrollments
for select using (true);

drop policy if exists "class_enrollments_insert" on public.class_enrollments;
create policy "class_enrollments_insert" on public.class_enrollments
for insert with check (
  exists (
    select 1
    from public.classes c
    join public.users teacher on teacher.id = c.teacher_id
    join public.users student on student.id = student_user_id
    where c.id = class_id
      and teacher.role in ('teacher', 'admin')
      and student.role = 'student'
      and student.is_active = true
  )
);

drop policy if exists "class_enrollments_delete" on public.class_enrollments;
create policy "class_enrollments_delete" on public.class_enrollments
for delete using (
  exists (
    select 1
    from public.classes c
    join public.users teacher on teacher.id = c.teacher_id
    where c.id = class_id
      and teacher.role in ('teacher', 'admin')
  )
);

drop policy if exists "attendance_select" on public.attendance_records;
create policy "attendance_select" on public.attendance_records
for select using (true);

drop policy if exists "attendance_upsert" on public.attendance_records;
create policy "attendance_upsert" on public.attendance_records
for insert with check (
  exists (
    select 1
    from public.users teacher
    where teacher.id = marked_by_teacher_id
      and teacher.role in ('teacher', 'admin')
      and teacher.is_active = true
  )
);

drop policy if exists "attendance_update" on public.attendance_records;
create policy "attendance_update" on public.attendance_records
for update using (
  exists (
    select 1
    from public.users teacher
    where teacher.id = marked_by_teacher_id
      and teacher.role in ('teacher', 'admin')
      and teacher.is_active = true
  )
) with check (
  exists (
    select 1
    from public.users teacher
    where teacher.id = marked_by_teacher_id
      and teacher.role in ('teacher', 'admin')
      and teacher.is_active = true
  )
);

drop policy if exists "assignments_select" on public.assignments;
create policy "assignments_select" on public.assignments
for select using (true);

drop policy if exists "assignments_insert" on public.assignments;
create policy "assignments_insert" on public.assignments
for insert with check (
  exists (
    select 1
    from public.users teacher
    where teacher.id = created_by_teacher_id
      and teacher.role in ('teacher', 'admin')
      and teacher.is_active = true
  )
);

drop policy if exists "assignments_update" on public.assignments;
create policy "assignments_update" on public.assignments
for update using (
  exists (
    select 1
    from public.users teacher
    where teacher.id = created_by_teacher_id
      and teacher.role in ('teacher', 'admin')
      and teacher.is_active = true
  )
) with check (
  exists (
    select 1
    from public.users teacher
    where teacher.id = created_by_teacher_id
      and teacher.role in ('teacher', 'admin')
      and teacher.is_active = true
  )
);

drop policy if exists "assignments_delete" on public.assignments;
create policy "assignments_delete" on public.assignments
for delete using (
  exists (
    select 1
    from public.users teacher
    where teacher.id = created_by_teacher_id
      and teacher.role in ('teacher', 'admin')
      and teacher.is_active = true
  )
);

drop policy if exists "learning_resources_select" on public.learning_resources;
create policy "learning_resources_select" on public.learning_resources
for select using (true);

drop policy if exists "learning_resources_insert" on public.learning_resources;
create policy "learning_resources_insert" on public.learning_resources
for insert with check (
  exists (
    select 1
    from public.users teacher
    where teacher.id = uploaded_by_teacher_id
      and teacher.role in ('teacher', 'admin')
      and teacher.is_active = true
  )
);

drop policy if exists "learning_resources_delete" on public.learning_resources;
create policy "learning_resources_delete" on public.learning_resources
for delete using (
  exists (
    select 1
    from public.users teacher
    where teacher.id = uploaded_by_teacher_id
      and teacher.role in ('teacher', 'admin')
      and teacher.is_active = true
  )
);

drop policy if exists "student_marks_select" on public.student_marks;
create policy "student_marks_select" on public.student_marks
for select using (true);

drop policy if exists "student_marks_insert" on public.student_marks;
create policy "student_marks_insert" on public.student_marks
for insert with check (
  created_by_teacher_id is null
  or exists (
    select 1
    from public.users teacher
    where teacher.id = created_by_teacher_id
      and teacher.role in ('teacher', 'admin')
      and teacher.is_active = true
  )
);

drop policy if exists "student_marks_update" on public.student_marks;
create policy "student_marks_update" on public.student_marks
for update using (
  created_by_teacher_id is null
  or exists (
    select 1
    from public.users teacher
    where teacher.id = created_by_teacher_id
      and teacher.role in ('teacher', 'admin')
      and teacher.is_active = true
  )
) with check (
  created_by_teacher_id is null
  or exists (
    select 1
    from public.users teacher
    where teacher.id = created_by_teacher_id
      and teacher.role in ('teacher', 'admin')
      and teacher.is_active = true
  )
);

commit;
