-- Add school_city and school_state columns if missing (idempotent)
alter table public.users
  add column if not exists school_city text,
  add column if not exists school_state text;

create index if not exists idx_users_school_state on public.users (school_state);
