-- USTU CAMPUS Supabase bootstrap
-- Run this in Supabase SQL Editor.

begin;

create table if not exists public.student_profile (
  id bigint generated always as identity primary key,
  clerk_user_id text unique,
  name text not null,
  roll_no text unique,
  email text,
  phone text,
  address text,
  date_of_birth date,
  blood_group text,
  department text,
  semester text,
  batch text,
  admission_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.academic_info (
  id bigint generated always as identity primary key,
  student_id bigint references public.student_profile(id) on delete cascade,
  current_cgpa numeric(3,2),
  total_credits integer,
  attendance text,
  rank text,
  created_at timestamptz not null default now()
);

create table if not exists public.student_skills (
  id bigint generated always as identity primary key,
  student_id bigint references public.student_profile(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.student_achievements (
  id bigint generated always as identity primary key,
  student_id bigint references public.student_profile(id) on delete cascade,
  title text not null,
  date date,
  type text,
  created_at timestamptz not null default now()
);

create table if not exists public.notices (
  id bigint generated always as identity primary key,
  title text not null,
  content text not null,
  date date not null,
  category text not null,
  author text not null,
  pinned boolean not null default false,
  urgent boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.todays_classes (
  id bigint generated always as identity primary key,
  time text not null,
  subject text not null,
  room text not null,
  status text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.upcoming_events (
  id bigint generated always as identity primary key,
  date text not null,
  title text not null,
  type text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.timetable (
  id bigint generated always as identity primary key,
  day text not null,
  time text not null,
  subject text not null,
  room text not null,
  professor text not null,
  type text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.calendar_events (
  id bigint generated always as identity primary key,
  title text not null,
  date date not null,
  time text not null,
  location text not null,
  type text not null,
  description text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.attendance_by_subject (
  id bigint generated always as identity primary key,
  subject text not null,
  present integer not null,
  total integer not null,
  percentage numeric(5,2) not null,
  created_at timestamptz not null default now()
);

create table if not exists public.attendance_records (
  id bigint generated always as identity primary key,
  date date not null,
  subject text not null,
  status text not null,
  time text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.semester_marks (
  id bigint generated always as identity primary key,
  subject text not null,
  internal1 integer not null,
  internal2 integer not null,
  internal3 integer not null,
  assignment integer not null,
  total integer not null,
  "maxMarks" integer not null,
  grade text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.previous_semesters (
  id bigint generated always as identity primary key,
  semester integer not null,
  sgpa numeric(3,2) not null,
  subjects integer not null,
  "totalMarks" integer not null,
  "maxMarks" integer not null,
  created_at timestamptz not null default now()
);

create table if not exists public.fee_structure (
  id bigint generated always as identity primary key,
  category text not null,
  amount numeric(12,2) not null,
  status text not null,
  date date,
  created_at timestamptz not null default now()
);

create table if not exists public.payment_history (
  id text primary key,
  description text not null,
  amount numeric(12,2) not null,
  date date not null,
  method text not null,
  status text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.issued_books (
  id bigint generated always as identity primary key,
  title text not null,
  author text not null,
  isbn text not null,
  "issueDate" date not null,
  "dueDate" date not null,
  status text not null,
  fine numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.available_books (
  id bigint generated always as identity primary key,
  title text not null,
  author text not null,
  isbn text not null,
  category text not null,
  copies integer not null,
  shelf text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.canteen_menu (
  id bigint generated always as identity primary key,
  name text not null,
  category text not null,
  price numeric(10,2) not null,
  image text not null,
  rating numeric(3,2) not null,
  "isVeg" boolean not null,
  available boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.feedback_subjects (
  id bigint generated always as identity primary key,
  name text not null,
  professor text not null,
  submitted boolean not null default false,
  created_at timestamptz not null default now(),
  unique (name, professor)
);

create table if not exists public.feedback_categories (
  id bigint generated always as identity primary key,
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.feedback_submissions (
  id bigint generated always as identity primary key,
  subject text not null,
  professor text not null,
  ratings jsonb not null,
  comment text,
  created_at timestamptz not null default now()
);

-- RLS policies for frontend anon-key access
alter table public.student_profile enable row level security;
alter table public.academic_info enable row level security;
alter table public.student_skills enable row level security;
alter table public.student_achievements enable row level security;
alter table public.notices enable row level security;
alter table public.todays_classes enable row level security;
alter table public.upcoming_events enable row level security;
alter table public.timetable enable row level security;
alter table public.calendar_events enable row level security;
alter table public.attendance_by_subject enable row level security;
alter table public.attendance_records enable row level security;
alter table public.semester_marks enable row level security;
alter table public.previous_semesters enable row level security;
alter table public.fee_structure enable row level security;
alter table public.payment_history enable row level security;
alter table public.issued_books enable row level security;
alter table public.available_books enable row level security;
alter table public.canteen_menu enable row level security;
alter table public.feedback_subjects enable row level security;
alter table public.feedback_categories enable row level security;
alter table public.feedback_submissions enable row level security;

drop policy if exists "public read student_profile" on public.student_profile;
create policy "public read student_profile" on public.student_profile for select using (true);
drop policy if exists "public read academic_info" on public.academic_info;
create policy "public read academic_info" on public.academic_info for select using (true);
drop policy if exists "public read student_skills" on public.student_skills;
create policy "public read student_skills" on public.student_skills for select using (true);
drop policy if exists "public read student_achievements" on public.student_achievements;
create policy "public read student_achievements" on public.student_achievements for select using (true);
drop policy if exists "public read notices" on public.notices;
create policy "public read notices" on public.notices for select using (true);
drop policy if exists "public read todays_classes" on public.todays_classes;
create policy "public read todays_classes" on public.todays_classes for select using (true);
drop policy if exists "public read upcoming_events" on public.upcoming_events;
create policy "public read upcoming_events" on public.upcoming_events for select using (true);
drop policy if exists "public read timetable" on public.timetable;
create policy "public read timetable" on public.timetable for select using (true);
drop policy if exists "public read calendar_events" on public.calendar_events;
create policy "public read calendar_events" on public.calendar_events for select using (true);
drop policy if exists "public read attendance_by_subject" on public.attendance_by_subject;
create policy "public read attendance_by_subject" on public.attendance_by_subject for select using (true);
drop policy if exists "public read attendance_records" on public.attendance_records;
create policy "public read attendance_records" on public.attendance_records for select using (true);
drop policy if exists "public read semester_marks" on public.semester_marks;
create policy "public read semester_marks" on public.semester_marks for select using (true);
drop policy if exists "public read previous_semesters" on public.previous_semesters;
create policy "public read previous_semesters" on public.previous_semesters for select using (true);
drop policy if exists "public read fee_structure" on public.fee_structure;
create policy "public read fee_structure" on public.fee_structure for select using (true);
drop policy if exists "public read payment_history" on public.payment_history;
create policy "public read payment_history" on public.payment_history for select using (true);
drop policy if exists "public read issued_books" on public.issued_books;
create policy "public read issued_books" on public.issued_books for select using (true);
drop policy if exists "public read available_books" on public.available_books;
create policy "public read available_books" on public.available_books for select using (true);
drop policy if exists "public read canteen_menu" on public.canteen_menu;
create policy "public read canteen_menu" on public.canteen_menu for select using (true);
drop policy if exists "public read feedback_subjects" on public.feedback_subjects;
create policy "public read feedback_subjects" on public.feedback_subjects for select using (true);
drop policy if exists "public read feedback_categories" on public.feedback_categories;
create policy "public read feedback_categories" on public.feedback_categories for select using (true);
drop policy if exists "public insert feedback_submissions" on public.feedback_submissions;
create policy "public insert feedback_submissions" on public.feedback_submissions for insert with check (true);
drop policy if exists "public read feedback_submissions" on public.feedback_submissions;
create policy "public read feedback_submissions" on public.feedback_submissions for select using (true);

commit;
