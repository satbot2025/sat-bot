-- Friends relationship (direct, not auto-reciprocal) + simple invite token table

create table if not exists public.user_friends (
  id bigserial primary key,
  user_id bigint not null references public.users(id) on delete cascade,
  friend_user_id bigint not null references public.users(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, friend_user_id),
  check (user_id <> friend_user_id)
);

-- Optional invite tokens (one-time). If you don't need token invites you can ignore this.
create table if not exists public.friend_invites (
  id bigserial primary key,
  inviter_user_id bigint not null references public.users(id) on delete cascade,
  token text not null unique,
  created_at timestamptz default now(),
  consumed_at timestamptz
);

alter table public.user_friends enable row level security;
alter table public.friend_invites enable row level security;
-- No public policies; server role will manage. If later you move to client auth add RLS policies per user.

create index if not exists idx_user_friends_user on public.user_friends(user_id);
create index if not exists idx_user_friends_friend on public.user_friends(friend_user_id);
