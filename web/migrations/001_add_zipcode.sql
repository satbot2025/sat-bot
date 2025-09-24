-- Add zipcode column to public.users if missing (idempotent)
alter table public.users
  add column if not exists zipcode text;

create index if not exists idx_users_zipcode on public.users (zipcode);
