-- Add order tokens for the canteen flow

begin;

create sequence if not exists public.canteen_order_token_seq;

create table if not exists public.canteen_orders (
  id bigint generated always as identity primary key,
  token_number bigint not null unique default nextval('public.canteen_order_token_seq'),
  clerk_user_id text not null,
  customer_name text,
  email text,
  items jsonb not null,
  subtotal numeric(10,2) not null,
  gst numeric(10,2) not null,
  total numeric(10,2) not null,
  status text not null default 'pending' check (status in ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_canteen_orders_token_number on public.canteen_orders(token_number desc);
create index if not exists idx_canteen_orders_status_created_at on public.canteen_orders(status, created_at desc);
create index if not exists idx_canteen_orders_clerk_user_id on public.canteen_orders(clerk_user_id);

alter table public.canteen_orders enable row level security;

drop policy if exists "canteen_orders_select_own" on public.canteen_orders;
create policy "canteen_orders_select_own" on public.canteen_orders
for select using (
  true
);

drop policy if exists "canteen_orders_insert_own" on public.canteen_orders;
create policy "canteen_orders_insert_own" on public.canteen_orders
for insert with check (
  true
);

drop policy if exists "canteen_orders_update_staff" on public.canteen_orders;
create policy "canteen_orders_update_staff" on public.canteen_orders
for update using (
  true
) with check (
  true
);

create or replace function public.create_canteen_order(
  p_clerk_user_id text,
  p_customer_name text,
  p_email text,
  p_items jsonb,
  p_subtotal numeric,
  p_gst numeric,
  p_total numeric
) returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_token bigint;
begin
  insert into public.canteen_orders (
    clerk_user_id,
    customer_name,
    email,
    items,
    subtotal,
    gst,
    total,
    status
  )
  values (
    p_clerk_user_id,
    p_customer_name,
    p_email,
    p_items,
    p_subtotal,
    p_gst,
    p_total,
    'pending'
  )
  returning token_number into v_token;

  return v_token;
end;
$$;

grant execute on function public.create_canteen_order(text, text, text, jsonb, numeric, numeric, numeric) to anon, authenticated;

commit;