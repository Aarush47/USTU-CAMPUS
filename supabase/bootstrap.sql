-- USTU CAMPUS Supabase bootstrap
-- Run this in Supabase SQL Editor.

begin;

create table if not exists public.student_profile (
  id bigint generated always as identity primary key,
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

insert into public.student_profile (name, roll_no, email, phone, address, date_of_birth, blood_group, department, semester, batch, admission_date)
select 'Arjun Sharma', 'CS2023001', 'arjun.sharma@ustu.edu', '+91 98765 43210', 'Green Park, New Delhi', '2004-08-15', 'O+', 'Computer Science', '6th Semester', '2023-2027', '2023-07-15'
where not exists (select 1 from public.student_profile where roll_no = 'CS2023001');

insert into public.academic_info (student_id, current_cgpa, total_credits, attendance, rank)
select sp.id, 8.60, 120, '92%', '12 / 120'
from public.student_profile sp
where sp.roll_no = 'CS2023001'
  and not exists (select 1 from public.academic_info ai where ai.student_id = sp.id);

insert into public.student_skills (student_id, name)
select sp.id, s.name
from public.student_profile sp
cross join (values
  ('React.js'), ('Node.js'), ('Python'), ('Java'), ('C++'), ('SQL'),
  ('Machine Learning'), ('Data Structures'), ('Algorithms')
) as s(name)
where sp.roll_no = 'CS2023001'
  and not exists (
    select 1 from public.student_skills x where x.student_id = sp.id and x.name = s.name
  );

insert into public.student_achievements (student_id, title, date, type)
select sp.id, a.title, a.date::date, a.type
from public.student_profile sp
cross join (values
  ('First Prize - Hackathon 2025', '2025-12-10', 'academic'),
  ('Best Project Award - DSA', '2025-11-14', 'academic'),
  ('Research Paper Published', '2025-09-05', 'research')
) as a(title, date, type)
where sp.roll_no = 'CS2023001'
  and not exists (
    select 1 from public.student_achievements x
    where x.student_id = sp.id and x.title = a.title
  );

insert into public.notices (title, content, date, category, author, pinned, urgent)
select * from (values
  ('Mid-Semester Exam Schedule', 'Mid-sem exams begin next Monday. Check your department timetable.', current_date + 5, 'Examinations', 'Exam Cell', true, true),
  ('Hackathon Registration Open', 'Register before Friday for USTU annual hackathon.', current_date + 2, 'Events', 'Innovation Club', false, false),
  ('Library Timings Updated', 'Library is now open from 8:00 AM to 9:00 PM.', current_date - 1, 'Facilities', 'Library Admin', false, false)
) as v(title, content, date, category, author, pinned, urgent)
where not exists (select 1 from public.notices);

insert into public.todays_classes (time, subject, room, status)
select * from (values
  ('09:00 AM', 'Data Structures', 'C-301', 'completed'),
  ('11:00 AM', 'DBMS', 'C-204', 'ongoing'),
  ('02:00 PM', 'Operating Systems', 'C-402', 'upcoming')
) as v(time, subject, room, status)
where not exists (select 1 from public.todays_classes);

insert into public.upcoming_events (date, title, type)
select * from (values
  (to_char(current_date + 3, 'DD Mon'), 'Assignment 3 Deadline', 'deadline'),
  (to_char(current_date + 6, 'DD Mon'), 'Internal Exam - DBMS', 'exam'),
  (to_char(current_date + 10, 'DD Mon'), 'Tech Fest Opening', 'event')
) as v(date, title, type)
where not exists (select 1 from public.upcoming_events);

insert into public.timetable (day, time, subject, room, professor, type)
select * from (values
  ('Monday', '09:00 AM', 'Data Structures', 'C-301', 'Dr. Mehta', 'Lecture'),
  ('Monday', '11:00 AM', 'DBMS Lab', 'Lab-2', 'Prof. Verma', 'Lab'),
  ('Tuesday', '10:00 AM', 'Operating Systems', 'C-402', 'Dr. Rao', 'Lecture'),
  ('Wednesday', '01:00 PM', 'Project Work', 'Innovation Hub', 'Prof. Kapoor', 'Project')
) as v(day, time, subject, room, professor, type)
where not exists (select 1 from public.timetable);

insert into public.calendar_events (title, date, time, location, type, description)
select * from (values
  ('DBMS Internal Exam', current_date + 6, '10:00 AM', 'Exam Hall 2', 'exam', 'Internal assessment for DBMS.'),
  ('Assignment Submission', current_date + 3, '11:59 PM', 'Online Portal', 'assignment', 'Submit OS assignment 3.'),
  ('Cultural Event', current_date + 12, '04:00 PM', 'Main Auditorium', 'event', 'Annual cultural showcase.'),
  ('Festival Holiday', current_date + 15, 'All Day', 'Campus', 'holiday', 'College closed for festival holiday.')
) as v(title, date, time, location, type, description)
where not exists (select 1 from public.calendar_events);

insert into public.attendance_by_subject (subject, present, total, percentage)
select * from (values
  ('Data Structures', 22, 25, 88.00),
  ('DBMS', 24, 26, 92.31),
  ('Operating Systems', 20, 24, 83.33)
) as v(subject, present, total, percentage)
where not exists (select 1 from public.attendance_by_subject);

insert into public.attendance_records (date, subject, status, time)
select * from (values
  (current_date - 1, 'Data Structures', 'Present', '09:00 AM'),
  (current_date - 1, 'DBMS', 'Late', '11:10 AM'),
  (current_date - 2, 'Operating Systems', 'Absent', '-')
) as v(date, subject, status, time)
where not exists (select 1 from public.attendance_records);

insert into public.semester_marks (subject, internal1, internal2, internal3, assignment, total, "maxMarks", grade)
select * from (values
  ('Data Structures', 21, 22, 23, 9, 75, 85, 'A'),
  ('DBMS', 20, 21, 22, 8, 71, 85, 'A'),
  ('Operating Systems', 18, 20, 21, 8, 67, 85, 'B+')
) as v(subject, internal1, internal2, internal3, assignment, total, maxmarks, grade)
where not exists (select 1 from public.semester_marks);

insert into public.previous_semesters (semester, sgpa, subjects, "totalMarks", "maxMarks")
select * from (values
  (5, 8.30, 6, 498, 600),
  (4, 8.10, 6, 486, 600),
  (3, 7.90, 6, 474, 600)
) as v(semester, sgpa, subjects, totalmarks, maxmarks)
where not exists (select 1 from public.previous_semesters);

insert into public.fee_structure (category, amount, status, date)
select * from (values
  ('Tuition Fee', 45000, 'Paid', current_date - 45),
  ('Library Fee', 3000, 'Paid', current_date - 40),
  ('Lab Fee', 5000, 'Pending', null)
) as v(category, amount, status, date)
where not exists (select 1 from public.fee_structure);

insert into public.payment_history (id, description, amount, date, method, status)
select * from (values
  ('TXN1001', 'Semester 6 Tuition Fee', 45000, current_date - 45, 'UPI', 'Success'),
  ('TXN1002', 'Library Fee', 3000, current_date - 40, 'Card', 'Success')
) as v(id, description, amount, date, method, status)
on conflict (id) do nothing;

insert into public.issued_books (title, author, isbn, "issueDate", "dueDate", status, fine)
select * from (values
  ('Clean Code', 'Robert C. Martin', '9780132350884', current_date - 10, current_date + 10, 'Active', 0),
  ('Operating System Concepts', 'Silberschatz', '9781118063330', current_date - 30, current_date - 2, 'Overdue', 120)
) as v(title, author, isbn, issuedate, duedate, status, fine)
where not exists (select 1 from public.issued_books);

insert into public.available_books (title, author, isbn, category, copies, shelf)
select * from (values
  ('Design Patterns', 'GoF', '9780201633610', 'Programming', 4, 'P-12'),
  ('Introduction to Algorithms', 'CLRS', '9780262046305', 'Computer Science', 2, 'CS-04'),
  ('Database System Concepts', 'Korth', '9780078022159', 'Databases', 3, 'DB-03')
) as v(title, author, isbn, category, copies, shelf)
where not exists (select 1 from public.available_books);

insert into public.canteen_menu (name, category, price, image, rating, "isVeg", available)
select * from (values
  ('Masala Dosa', 'South Indian', 70, '🥞', 4.5, true, true),
  ('Veg Burger', 'Fast Food', 60, '🍔', 4.2, true, true),
  ('Chicken Roll', 'Snacks', 90, '🌯', 4.4, false, true)
) as v(name, category, price, image, rating, isveg, available)
where not exists (select 1 from public.canteen_menu);

insert into public.feedback_subjects (name, professor, submitted)
select * from (values
  ('Data Structures', 'Dr. Mehta', false),
  ('DBMS', 'Prof. Verma', false),
  ('Operating Systems', 'Dr. Rao', false)
) as v(name, professor, submitted)
on conflict (name, professor) do nothing;

insert into public.feedback_categories (name)
select v.name
from (values
  ('Teaching Quality'),
  ('Course Content'),
  ('Practical Relevance'),
  ('Evaluation Fairness'),
  ('Overall Satisfaction')
) as v(name)
on conflict (name) do nothing;

-- RLS policies for frontend anon-key access (demo-friendly)
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
