-- Create classes table for teacher portal
-- Run this in Supabase SQL Editor

begin;

create table if not exists public.classes (
  id bigint generated always as identity primary key,
  teacher_id bigint not null references public.users(id) on delete cascade,
  name text not null,
  subject text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_classes_teacher_id on public.classes(teacher_id);
create index if not exists idx_classes_created_at on public.classes(created_at desc);

alter table public.classes enable row level security;

-- Read classes
drop policy if exists "classes_read" on public.classes;
create policy "classes_read" on public.classes
for select using (true);

-- Insert classes (teacher/admin only by teacher_id mapping)
drop policy if exists "classes_insert" on public.classes;
create policy "classes_insert" on public.classes
for insert with check (
  exists (
    select 1
    from public.users u
    where u.id = teacher_id
      and u.role in ('teacher', 'admin')
  )
);

-- Update classes (teacher/admin only)
drop policy if exists "classes_update" on public.classes;
create policy "classes_update" on public.classes
for update using (
  exists (
    select 1
    from public.users u
    where u.id = teacher_id
      and u.role in ('teacher', 'admin')
  )
) with check (
  exists (
    select 1
    from public.users u
    where u.id = teacher_id
      and u.role in ('teacher', 'admin')
  )
);

-- Delete classes (teacher/admin only)
drop policy if exists "classes_delete" on public.classes;
create policy "classes_delete" on public.classes
for delete using (
  exists (
    select 1
    from public.users u
    where u.id = teacher_id
      and u.role in ('teacher', 'admin')
  )
);

commit;
