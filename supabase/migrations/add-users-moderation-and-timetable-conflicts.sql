-- Add user moderation controls and enforce timetable overlap constraints

begin;

alter table public.users
  add column if not exists is_banned boolean not null default false,
  add column if not exists requested_at timestamptz not null default now(),
  add column if not exists approved_at timestamptz,
  add column if not exists banned_at timestamptz;

create index if not exists idx_users_is_banned on public.users(is_banned);
create index if not exists idx_users_requested_at on public.users(requested_at desc);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'class_timetables_valid_time_range'
      and conrelid = 'public.class_timetables'::regclass
  ) then
    alter table public.class_timetables
      add constraint class_timetables_valid_time_range
      check (start_time < end_time);
  end if;
end $$;

create or replace function public.prevent_class_timetable_overlaps()
returns trigger
language plpgsql
as $$
begin
  if exists (
    select 1
    from public.class_timetables t
    where t.id <> coalesce(new.id, -1)
      and t.day_of_week = new.day_of_week
      and t.class_id = new.class_id
      and new.start_time < t.end_time
      and new.end_time > t.start_time
  ) then
    raise exception 'Timetable conflict: class already has another slot in this time range on %', new.day_of_week;
  end if;

  if new.created_by_user_id is not null and exists (
    select 1
    from public.class_timetables t
    where t.id <> coalesce(new.id, -1)
      and t.day_of_week = new.day_of_week
      and t.created_by_user_id = new.created_by_user_id
      and new.start_time < t.end_time
      and new.end_time > t.start_time
  ) then
    raise exception 'Timetable conflict: teacher already assigned to another class in this time range on %', new.day_of_week;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_prevent_class_timetable_overlaps on public.class_timetables;
create trigger trg_prevent_class_timetable_overlaps
before insert or update on public.class_timetables
for each row
execute function public.prevent_class_timetable_overlaps();

commit;
