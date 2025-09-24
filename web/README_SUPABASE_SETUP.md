# Supabase Setup for SAT-Bot (Next.js + TypeScript)

This guide sets up your Supabase database and local environment for the Next.js app in `web/`.

## 1) Create a Supabase project
- Go to https://supabase.com and create a new project
- Copy the values from Settings → API:
  - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
  - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - service_role secret → `SUPABASE_SERVICE_ROLE_KEY` (keep private)

## 2) Apply the SQL schema
- In the Supabase Dashboard → SQL Editor → New query
- Paste the contents of `web/supabase.schema.sql`
- Run the query

This creates tables:
- `public.users` (custom user records)
- `public.practice_tests` (test catalog)
- `public.practice_attempts` (user attempts)

It also enables Row Level Security and allows public read of `practice_tests`. Writes are expected to come from the server using the service role key.

## 3) Configure local env (.env.local)
- Copy `web/.env.local.example` to `web/.env.local`
- Fill in all values from step 1

On Windows PowerShell, you don't need to export vars; Next.js will read `.env.local` automatically when you run the dev server inside the `web` folder.

## 4) Start the dev server
In a terminal:
- Change directory to `web` and run `npm run dev`

The app should load and connect to Supabase with your keys.

## 5) Notes on auth and RLS
- This app uses a custom `public.users` table for username/password.
- All writes (register, login password checks, attempts) should be executed on the server using the `SUPABASE_SERVICE_ROLE_KEY`. The service role bypasses RLS.
- `practice_tests` is readable from the client; other tables are server-only by default.

## 6) Next steps
- If you later want to use Supabase Auth users instead of custom `public.users`, we can migrate IDs to auth.uid and grant per-user read policies for attempts.
- Add more practice tests in `practice_tests` or seed via SQL.
