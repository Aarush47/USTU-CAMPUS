-- Notice publishing, class timetable management, and digital library PDFs

begin;

alter table public.notices
  add column if not exists posted_by_user_id bigint references public.users(id) on delete set null,
  add column if not exists posted_by_role text,
  add column if not exists posted_by_name text,
  add column if not exists created_at timestamptz not null default now();

create index if not exists idx_notices_date on public.notices(date desc);
create index if not exists idx_notices_created_at on public.notices(created_at desc);

create table if not exists public.class_timetables (
  id bigint generated always as identity primary key,
  class_id bigint not null references public.classes(id) on delete cascade,
  day_of_week text not null check (day_of_week in ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')),
  start_time time not null,
  end_time time not null,
  subject text not null,
  room text not null default 'TBA',
  teacher_name text,
  session_type text not null default 'Lecture',
  created_by_user_id bigint references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create unique index if not exists idx_class_timetables_unique_slot
on public.class_timetables(class_id, day_of_week, start_time, subject);

create index if not exists idx_class_timetables_class_id on public.class_timetables(class_id);
create index if not exists idx_class_timetables_day_time on public.class_timetables(day_of_week, start_time);

create table if not exists public.library_books (
  id bigint generated always as identity primary key,
  title text not null,
  author text not null,
  category text not null default 'General',
  description text,
  pdf_url text not null,
  uploaded_by_user_id bigint references public.users(id) on delete set null,
  uploaded_by_role text,
  uploaded_by_name text,
  created_at timestamptz not null default now()
);

create index if not exists idx_library_books_created_at on public.library_books(created_at desc);
create index if not exists idx_library_books_category on public.library_books(category);

alter table public.notices enable row level security;
alter table public.class_timetables enable row level security;
alter table public.library_books enable row level security;

drop policy if exists "notices_select" on public.notices;
create policy "notices_select" on public.notices
for select using (true);

drop policy if exists "notices_insert" on public.notices;
create policy "notices_insert" on public.notices
for insert with check (coalesce(posted_by_role, '') in ('teacher', 'admin'));

drop policy if exists "notices_delete" on public.notices;
create policy "notices_delete" on public.notices
for delete using (
  posted_by_role = 'admin'
  or posted_by_role = 'teacher'
);

drop policy if exists "class_timetables_select" on public.class_timetables;
create policy "class_timetables_select" on public.class_timetables
for select using (true);

drop policy if exists "class_timetables_insert" on public.class_timetables;
create policy "class_timetables_insert" on public.class_timetables
for insert with check (created_by_user_id is not null);

drop policy if exists "class_timetables_delete" on public.class_timetables;
create policy "class_timetables_delete" on public.class_timetables
for delete using (true);

drop policy if exists "library_books_select" on public.library_books;
create policy "library_books_select" on public.library_books
for select using (true);

drop policy if exists "library_books_insert" on public.library_books;
create policy "library_books_insert" on public.library_books
for insert with check (coalesce(uploaded_by_role, '') in ('teacher', 'admin'));

drop policy if exists "library_books_delete" on public.library_books;
create policy "library_books_delete" on public.library_books
for delete using (
  uploaded_by_role = 'admin'
  or uploaded_by_role = 'teacher'
);

insert into storage.buckets (id, name, public)
values ('library-books', 'library-books', true)
on conflict (id) do nothing;

drop policy if exists "library_books_storage_select" on storage.objects;
create policy "library_books_storage_select" on storage.objects
for select using (bucket_id = 'library-books');

drop policy if exists "library_books_storage_insert" on storage.objects;
create policy "library_books_storage_insert" on storage.objects
for insert with check (bucket_id = 'library-books');

drop policy if exists "library_books_storage_delete" on storage.objects;
create policy "library_books_storage_delete" on storage.objects
for delete using (bucket_id = 'library-books');

commit;
