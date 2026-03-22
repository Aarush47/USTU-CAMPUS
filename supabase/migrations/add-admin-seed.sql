-- Seed an initial admin account placeholder
-- Replace with your real admin email and run in Supabase SQL Editor

insert into public.users (email, name, role, email_verified, domain_verified)
values ('admin@ustu.edu.in', 'System Admin', 'admin', true, true)
on conflict (email)
do update set
  role = 'admin',
  email_verified = true,
  domain_verified = true;
