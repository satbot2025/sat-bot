-- Supabase schema for SAT Bot
-- Run in the SQL editor of your Supabase project

create table if not exists public.users (
  id bigserial primary key,
  username text unique not null,
  password_hash text not null,
  zipcode text,
  school_city text,
  school_state text,
  created_at timestamp with time zone default now()
);

create table if not exists public.practice_tests (
  id bigserial primary key,
  title text not null,
  description text,
  created_at timestamp with time zone default now()
);

create table if not exists public.practice_attempts (
  id bigserial primary key,
  user_id bigint not null references public.users(id) on delete cascade,
  test_id bigint not null references public.practice_tests(id) on delete cascade,
  started_at timestamp with time zone default now()
);

-- Helpful indexes
create index if not exists idx_users_username on public.users (username);
create index if not exists idx_users_zipcode on public.users (zipcode);
create index if not exists idx_users_school_state on public.users (school_state);
create index if not exists idx_attempts_user on public.practice_attempts (user_id);
create index if not exists idx_attempts_test on public.practice_attempts (test_id);

-- Row Level Security (RLS)
-- NOTE: Our app uses Supabase service role key on the server to perform writes.
-- The service role bypasses RLS automatically, so policies below are conservative.

alter table public.users enable row level security;
-- Do NOT expose user table publicly; no public select policy.
-- Server code with service role can read/write without an explicit policy.

alter table public.practice_tests enable row level security;
-- Allow anonymous/public read access to tests so the app can list them client-side.
create policy "Public can read tests" on public.practice_tests for select using (true);

alter table public.practice_attempts enable row level security;
-- Attempts are sensitive; no public policies. Service role will handle CRUD.
-- If later you want signed-in users to read their own attempts from the client,
-- you can add: using (auth.uid()::text = (select u.id::text from public.users u where u.id = user_id))
-- but only after you align IDs to auth users.

-- Seed example tests
insert into public.practice_tests (title, description)
values ('Math Practice Set 1', 'Algebra & Functions'), ('Reading Practice Set 1', 'Comprehension & Evidence')
on conflict do nothing;
