-- Run in Supabase → SQL Editor. Replace <ISSUER> with the issuer URL from the
-- Tausi dashboard (your project → Connectors), e.g.
--   https://auth.tausi.app/api/v1/oidc/abc123...
--
-- Tausi user ids aren't UUIDs: user_id is text, and policies compare
-- auth.jwt() ->> 'sub' (auth.uid() casts to uuid and would fail).

create table if not exists public.todos (
  id bigint generated always as identity primary key,
  user_id text not null default (auth.jwt() ->> 'sub'),
  title text not null check (char_length(title) between 1 and 200),
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists todos_user_id_idx on public.todos (user_id, created_at);

alter table public.todos enable row level security;

-- Only tokens from this Tausi project count (a Supabase project can trust several issuers).
drop policy if exists "Own todos" on public.todos;
create policy "Own todos" on public.todos
  for all to authenticated
  using (user_id = (auth.jwt() ->> 'sub') and (auth.jwt() ->> 'iss') = '<ISSUER>')
  with check (user_id = (auth.jwt() ->> 'sub') and (auth.jwt() ->> 'iss') = '<ISSUER>');

-- Signed-out visitors (the anon role) get nothing.
revoke all on public.todos from anon;
grant select, insert, update, delete on public.todos to authenticated;
