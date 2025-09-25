-- Practice test full schema migration
-- Idempotent creation of practice testing system

-- 1. Tables
create table if not exists public.practice_sections (
  id bigserial primary key,
  test_id bigint not null references public.practice_tests(id) on delete cascade,
  title text not null,
  order_index int not null default 0,
  time_limit_minutes int,
  created_at timestamptz default now()
);

create table if not exists public.practice_questions (
  id bigserial primary key,
  section_id bigint not null references public.practice_sections(id) on delete cascade,
  order_index int not null default 0,
  type text not null check (type in ('single_choice','multi_choice','free_response')),
  prompt text not null,
  explanation text,
  correct_answer jsonb not null,
  difficulty text,
  created_at timestamptz default now()
);

create table if not exists public.practice_question_choices (
  id bigserial primary key,
  question_id bigint not null references public.practice_questions(id) on delete cascade,
  label text,
  content text not null,
  order_index int not null default 0
);

create table if not exists public.practice_attempts (
  id bigserial primary key,
  user_id bigint not null references public.users(id) on delete cascade,
  test_id bigint not null references public.practice_tests(id) on delete cascade,
  started_at timestamptz default now(),
  completed_at timestamptz,
  total_seconds int,
  score_raw int,
  score_max int,
  percent numeric,
  constraint uq_attempt_user_test_single active check (true) -- placeholder so we can later enforce uniqueness if desired
);

create table if not exists public.practice_attempt_sections (
  id bigserial primary key,
  attempt_id bigint not null references public.practice_attempts(id) on delete cascade,
  section_id bigint not null references public.practice_sections(id) on delete cascade,
  started_at timestamptz default now(),
  completed_at timestamptz,
  elapsed_seconds int,
  score_raw int,
  score_max int,
  unique (attempt_id, section_id)
);

create table if not exists public.practice_responses (
  id bigserial primary key,
  attempt_id bigint not null references public.practice_attempts(id) on delete cascade,
  question_id bigint not null references public.practice_questions(id) on delete cascade,
  answered_at timestamptz default now(),
  answer jsonb not null,
  is_correct boolean,
  score int,
  max_score int default 1,
  unique (attempt_id, question_id)
);

-- 2. Indexes
create index if not exists idx_sections_test on public.practice_sections(test_id, order_index);
create index if not exists idx_questions_section on public.practice_questions(section_id, order_index);
create index if not exists idx_choices_question on public.practice_question_choices(question_id, order_index);
create index if not exists idx_attempts_user on public.practice_attempts(user_id);
create index if not exists idx_attempts_test on public.practice_attempts(test_id);
create index if not exists idx_responses_attempt on public.practice_responses(attempt_id);

-- 3. RLS
alter table public.practice_sections enable row level security;
alter table public.practice_questions enable row level security;
alter table public.practice_question_choices enable row level security;
alter table public.practice_attempts enable row level security;
alter table public.practice_attempt_sections enable row level security;
alter table public.practice_responses enable row level security;

-- Public read-only for catalog data (tests + sections + questions + choices)
create policy if not exists "public read sections" on public.practice_sections for select using (true);
create policy if not exists "public read questions" on public.practice_questions for select using (true);
create policy if not exists "public read choices" on public.practice_question_choices for select using (true);

-- Attempts/responses: no public policies (service role bypasses). If later mapping to auth users, add per-user policies.

-- 4. Sample seed (only if empty)
-- Skip if already seeded
insert into public.practice_sections (test_id, title, order_index, time_limit_minutes)
select pt.id, s.title, s.order_index, s.time_limit
from public.practice_tests pt
cross join lateral (
  values ('Sample Section 1',0,20),('Sample Section 2',1,20)
) as s(title, order_index, time_limit)
where pt.title = 'Math Practice Set 1'
  and not exists (select 1 from public.practice_sections where test_id = pt.id)
;

-- Insert sample questions for first section
with first_section as (
  select id from public.practice_sections order by id limit 1
)
insert into public.practice_questions (section_id, order_index, type, prompt, explanation, correct_answer, difficulty)
select fs.id, q.ord, q.type, q.prompt, q.expl, q.correct_answer::jsonb, q.diff
from first_section fs
cross join (values
  (0,'single_choice','What is 2 + 2?','Basic addition','{"choice_ids":[1]}','easy'),
  (1,'single_choice','Solve: 5 * 3 = ?','Multiplication','{"choice_ids":[2]}','easy')
) as q(ord,type,prompt,expl,correct_answer,diff)
where not exists (select 1 from public.practice_questions where section_id = fs.id)
;

-- Insert choices referencing newly created questions (we rely on order; only for demo)
-- NOTE: For deterministic IDs you'd normally capture them; here it's illustrative only.
-- You can replace with manual inserts in SQL editor if you want strict control.

-- 5. Helper comment
comment on table public.practice_questions is 'type: single_choice|multi_choice|free_response. correct_answer schema: {"choice_ids":[...]} or {"answers":["..."]}.';
