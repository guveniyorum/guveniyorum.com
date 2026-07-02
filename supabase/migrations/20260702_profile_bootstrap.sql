create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique,
  email text,
  display_name text not null default 'Yeni Kullanıcı',
  role text not null default 'user',
  level integer not null default 1,
  xp integer not null default 0,
  points integer not null default 0,
  trust_score integer not null default 70,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists nickname text;
alter table public.profiles add column if not exists avatar_key text default 'neon-orbit';
alter table public.profiles add column if not exists bio text default '';
alter table public.profiles add column if not exists contribution_score integer default 0;
alter table public.profiles add column if not exists review_count integer default 0;
alter table public.profiles add column if not exists complaint_count integer default 0;
alter table public.profiles add column if not exists solved_contribution_count integer default 0;
alter table public.profiles add column if not exists helpful_votes integer default 0;
alter table public.profiles add column if not exists last_seen_at timestamptz;
alter table public.profiles add column if not exists onboarding_completed boolean default false;

update public.profiles
set avatar_key = 'neon-orbit'
where avatar_key is null;

alter table public.profiles alter column avatar_key set default 'neon-orbit';
alter table public.profiles alter column avatar_key set not null;
alter table public.profiles alter column bio set default '';
alter table public.profiles alter column contribution_score set default 0;
alter table public.profiles alter column review_count set default 0;
alter table public.profiles alter column complaint_count set default 0;
alter table public.profiles alter column solved_contribution_count set default 0;
alter table public.profiles alter column helpful_votes set default 0;
alter table public.profiles alter column onboarding_completed set default false;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and conname = 'profiles_nickname_length_check'
  ) then
    alter table public.profiles
      add constraint profiles_nickname_length_check
      check (nickname is null or char_length(nickname) between 3 and 24);
  end if;
end $$;

create unique index if not exists profiles_nickname_unique_idx
on public.profiles (nickname)
where nickname is not null;

create index if not exists profiles_user_id_idx on public.profiles (user_id);
create index if not exists profiles_nickname_idx on public.profiles (nickname);

alter table public.profiles enable row level security;

grant usage on schema public to authenticated;
grant select, insert, update on public.profiles to authenticated;

drop policy if exists "Profiles are selectable by owner" on public.profiles;
create policy "Profiles are selectable by owner"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Profiles are insertable by owner" on public.profiles;
create policy "Profiles are insertable by owner"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Profiles are updateable by owner" on public.profiles;
create policy "Profiles are updateable by owner"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
