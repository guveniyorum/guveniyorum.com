-- Guveniyorum Trust Platform database schema
-- Run this file in Supabase SQL Editor after creating the project.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique,
  email text,
  display_name text not null default 'Yeni Kullanıcı',
  role text not null default 'user' check (role in ('user','admin','brand_owner','moderator')),
  level integer not null default 1,
  xp integer not null default 0,
  points integer not null default 0,
  trust_score integer not null default 70,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  domain text,
  category text not null default 'Marka',
  status text not null default 'under_review' check (status in ('trusted','under_review','high_risk','blacklisted')),
  license_status text not null default 'unknown',
  trust_score integer not null default 70,
  response_time_hours integer not null default 24,
  complaint_count integer not null default 0,
  solved_count integer not null default 0,
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.brand_score_events (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  source_type text not null,
  source_id uuid,
  delta integer not null default 0,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.complaints (
  id uuid primary key default gen_random_uuid(),
  public_id text unique not null,
  user_id uuid references public.profiles(id) on delete set null,
  brand_id uuid references public.brands(id) on delete set null,
  brand_name text,
  title text not null,
  category text not null,
  description text not null,
  amount numeric,
  payment_method text,
  requested_solution text,
  status text not null default 'pending_review' check (status in ('draft','pending_review','approved','rejected','need_evidence','brand_waiting','in_resolution','solved','unverified')),
  evidence_level text not null default 'none' check (evidence_level in ('none','low','medium','high')),
  admin_note text,
  reward_status text not null default 'pending' check (reward_status in ('pending','approved','rejected','paid')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.complaint_evidence (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  file_url text,
  file_name text,
  file_type text,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.complaint_status_history (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  from_status text,
  to_status text not null,
  actor_id uuid references public.profiles(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.complaint_comments (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  author_role text not null default 'user',
  body text not null,
  visibility text not null default 'public' check (visibility in ('public','private','admin_only')),
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  brand_id uuid references public.brands(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  body text,
  status text not null default 'pending_review' check (status in ('pending_review','approved','rejected')),
  created_at timestamptz not null default now()
);

create table if not exists public.psychology_test_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  risk_level text not null check (risk_level in ('low','medium','high','critical')),
  score integer not null default 0,
  answers jsonb not null default '{}'::jsonb,
  recommendations jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.point_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  source_type text not null,
  source_id uuid,
  points integer not null default 0,
  xp integer not null default 0,
  status text not null default 'pending' check (status in ('pending','approved','rejected','paid')),
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.rewards (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  points_required integer not null default 0,
  status text not null default 'active' check (status in ('active','paused','archived')),
  created_at timestamptz not null default now()
);

create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  rule_key text unique,
  created_at timestamptz not null default now()
);

create table if not exists public.user_badges (
  user_id uuid not null references public.profiles(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  body text,
  type text not null default 'system',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.certification_applications (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references public.brands(id) on delete cascade,
  applicant_id uuid references public.profiles(id) on delete set null,
  level text not null default 'basic' check (level in ('basic','advanced','premium')),
  status text not null default 'pending_review' check (status in ('pending_review','approved','rejected','needs_info')),
  admin_note text,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_actions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.profiles(id) on delete set null,
  action_type text not null,
  target_type text not null,
  target_id uuid,
  note text,
  created_at timestamptz not null default now()
);

create or replace function public.next_complaint_public_id()
returns text
language plpgsql
as $$
declare
  next_num integer;
begin
  select coalesce(count(*),0) + 1 into next_num from public.complaints;
  return 'GVN-' || extract(year from now())::text || '-' || lpad(next_num::text, 4, '0');
end;
$$;

create or replace function public.set_complaint_public_id()
returns trigger
language plpgsql
as $$
begin
  if new.public_id is null or new.public_id = '' then
    new.public_id := public.next_complaint_public_id();
  end if;
  return new;
end;
$$;

drop trigger if exists complaints_public_id_trigger on public.complaints;
create trigger complaints_public_id_trigger
before insert on public.complaints
for each row execute function public.set_complaint_public_id();

create or replace function public.apply_point_transaction()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'approved' then
    update public.profiles
    set points = points + new.points,
        xp = xp + new.xp,
        level = greatest(1, floor((xp + new.xp) / 1000) + 1),
        updated_at = now()
    where id = new.user_id;
  end if;
  return new;
end;
$$;

drop trigger if exists point_transaction_apply_trigger on public.point_transactions;
create trigger point_transaction_apply_trigger
after insert on public.point_transactions
for each row execute function public.apply_point_transaction();

insert into public.brands (name, slug, domain, category, status, trust_score, response_time_hours, summary)
values
  ('SafeMark', 'safemark', 'safemark.example', 'Marka', 'trusted', 98, 2, 'Yüksek şeffaflık ve hızlı yanıt performansı.'),
  ('GüvenMark', 'guvenmark', 'guvenmark.example', 'Marka', 'under_review', 88, 5, 'Genel güven seviyesi yüksek, dönemsel yanıt gecikmeleri izleniyor.'),
  ('RiskMark', 'riskmark', 'riskmark.example', 'Marka', 'high_risk', 52, 36, 'Risk sinyalleri nedeniyle yakın takipte.')
on conflict (slug) do nothing;

-- RLS can be enabled after connecting Supabase Auth.
-- alter table public.profiles enable row level security;
-- alter table public.complaints enable row level security;
