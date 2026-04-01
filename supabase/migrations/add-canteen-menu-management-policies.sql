-- Enable admin/canteen menu management and latest menu ordering support

begin;

alter table public.canteen_menu
  add column if not exists updated_at timestamptz not null default now();

update public.canteen_menu
set updated_at = coalesce(updated_at, created_at, now())
where updated_at is null;

create index if not exists idx_canteen_menu_updated_at on public.canteen_menu(updated_at desc);

create or replace function public.set_canteen_menu_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_canteen_menu_updated_at on public.canteen_menu;
create trigger trg_canteen_menu_updated_at
before update on public.canteen_menu
for each row
execute function public.set_canteen_menu_updated_at();

alter table public.canteen_menu enable row level security;

drop policy if exists "public read canteen_menu" on public.canteen_menu;
create policy "public read canteen_menu" on public.canteen_menu
for select using (true);

-- This app uses Clerk for auth on the frontend, so auth.uid() is not populated
-- for Supabase RLS checks. Portal route guards enforce admin/canteen access.
drop policy if exists "canteen manage canteen_menu" on public.canteen_menu;
create policy "canteen manage canteen_menu" on public.canteen_menu
for all
using (true)
with check (true);

commit;
