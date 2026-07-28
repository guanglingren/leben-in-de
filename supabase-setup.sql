-- AKTENLEBEN visitor counter and guestbook
-- Run once in Supabase Dashboard → SQL Editor.

create table if not exists public.site_stats (
  id text primary key check (id = 'main'),
  total_visits bigint not null default 0,
  updated_at timestamptz not null default now()
);

insert into public.site_stats (id, total_visits)
values ('main', 0)
on conflict (id) do nothing;

alter table public.site_stats enable row level security;
revoke all on table public.site_stats from anon, authenticated;
grant select on table public.site_stats to anon, authenticated;

drop policy if exists "Public can read site stats" on public.site_stats;
create policy "Public can read site stats"
on public.site_stats for select
to anon, authenticated
using (id = 'main');

create or replace function public.register_visit()
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  new_total bigint;
begin
  update public.site_stats
  set total_visits = total_visits + 1, updated_at = now()
  where id = 'main'
  returning total_visits into new_total;
  return new_total;
end;
$$;

revoke all on function public.register_visit() from public;
grant execute on function public.register_visit() to anon, authenticated;

create table if not exists public.guestbook (
  id bigint generated always as identity primary key,
  nickname varchar(24) not null check (char_length(trim(nickname)) between 1 and 24),
  message varchar(300) not null check (char_length(trim(message)) between 1 and 300),
  language varchar(5) not null default 'zh' check (language in ('zh','de')),
  created_at timestamptz not null default now(),
  is_visible boolean not null default true
);

create index if not exists guestbook_visible_created_idx
on public.guestbook (is_visible, created_at desc);

alter table public.guestbook enable row level security;
revoke all on table public.guestbook from anon, authenticated;
grant select, insert on table public.guestbook to anon, authenticated;
grant usage, select on sequence public.guestbook_id_seq to anon, authenticated;

drop policy if exists "Public can read visible guestbook messages" on public.guestbook;
create policy "Public can read visible guestbook messages"
on public.guestbook for select
to anon, authenticated
using (is_visible = true);

drop policy if exists "Public can add valid guestbook messages" on public.guestbook;
create policy "Public can add valid guestbook messages"
on public.guestbook for insert
to anon, authenticated
with check (
  is_visible = true
  and char_length(trim(nickname)) between 1 and 24
  and char_length(trim(message)) between 1 and 300
  and language in ('zh','de')
);
