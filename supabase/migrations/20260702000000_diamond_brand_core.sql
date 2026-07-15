create extension if not exists pgcrypto;

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  category text,
  trust_score numeric default 80,
  user_experience_score numeric default 4.0,
  resolution_rate numeric default 80,
  avg_response_hours numeric default 6,
  complaint_count integer default 0,
  open_complaint_count integer default 0,
  solved_complaint_count integer default 0,
  risk_level text default 'İzleniyor',
  trend text default '+0%',
  status text default 'Yayında',
  sponsor_pool text default '₺0',
  short_insight text default 'Stabil görünüm',
  admin_note text default '',
  visible boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.brands drop constraint if exists brands_status_check;
alter table public.brands alter column trust_score type numeric using trust_score::numeric;
alter table public.brands alter column trust_score set default 80;
alter table public.brands add column if not exists user_experience_score numeric default 4.0;
alter table public.brands add column if not exists resolution_rate numeric default 80;
alter table public.brands add column if not exists avg_response_hours numeric default 6;
alter table public.brands add column if not exists open_complaint_count integer default 0;
alter table public.brands add column if not exists solved_complaint_count integer default 0;
alter table public.brands add column if not exists risk_level text default 'İzleniyor';
alter table public.brands add column if not exists trend text default '+0%';
alter table public.brands alter column status set default 'Yayında';
alter table public.brands add column if not exists sponsor_pool text default '₺0';
alter table public.brands add column if not exists short_insight text default 'Stabil görünüm';
alter table public.brands add column if not exists admin_note text default '';
alter table public.brands add column if not exists visible boolean default true;

create table if not exists public.brand_links (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  website_url text,
  tracking_url text,
  redirect_label text default 'Siteyi İncele',
  link_status text default 'Pasif',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.brand_scores (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  score_type text not null,
  score_value numeric not null default 0,
  source text default 'manual',
  note text default '',
  created_at timestamptz default now()
);

create table if not exists public.brand_badges (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  badge text not null,
  created_at timestamptz default now()
);

create table if not exists public.brand_admin_events (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references public.brands(id) on delete cascade,
  event_type text not null,
  event_label text not null,
  note text default '',
  created_at timestamptz default now()
);

create unique index if not exists brand_links_brand_id_idx on public.brand_links(brand_id);
create index if not exists brands_visible_idx on public.brands(visible);
create index if not exists brand_links_link_status_idx on public.brand_links(link_status);
create index if not exists brand_scores_brand_id_idx on public.brand_scores(brand_id);
create index if not exists brand_badges_brand_id_idx on public.brand_badges(brand_id);
create index if not exists brand_admin_events_brand_id_idx on public.brand_admin_events(brand_id);

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists update_brands_updated_at on public.brands;
create trigger update_brands_updated_at
before update on public.brands
for each row execute function public.update_updated_at_column();

drop trigger if exists update_brand_links_updated_at on public.brand_links;
create trigger update_brand_links_updated_at
before update on public.brand_links
for each row execute function public.update_updated_at_column();

alter table public.brands enable row level security;
alter table public.brand_links enable row level security;
alter table public.brand_scores enable row level security;
alter table public.brand_badges enable row level security;
alter table public.brand_admin_events enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.brands, public.brand_links, public.brand_scores, public.brand_badges to anon, authenticated;

drop policy if exists "Public brands are readable" on public.brands;
create policy "Public brands are readable"
on public.brands for select
to anon, authenticated
using (visible = true);

drop policy if exists "Active brand links are readable" on public.brand_links;
create policy "Active brand links are readable"
on public.brand_links for select
to anon, authenticated
using (link_status = 'Aktif');

drop policy if exists "Brand badges are readable" on public.brand_badges;
create policy "Brand badges are readable"
on public.brand_badges for select
to anon, authenticated
using (true);

drop policy if exists "Brand scores are readable" on public.brand_scores;
create policy "Brand scores are readable"
on public.brand_scores for select
to anon, authenticated
using (true);

insert into public.brands (
  slug, name, category, trust_score, user_experience_score, resolution_rate,
  avg_response_hours, complaint_count, open_complaint_count, solved_complaint_count,
  risk_level, trend, status, sponsor_pool, short_insight, visible
)
values
  ('betsafe', 'BetSafe', 'Spor & Casino', 98, 4.8, 98, 2.8, 12, 1, 11, 'Düşük Risk', '+12%', 'Yayında', '₺120K', 'Çözüm performansı güçlü', true),
  ('meritroyal', 'MeritRoyal', 'Casino', 96, 4.7, 94, 3.4, 16, 2, 14, 'Düşük Risk', '+9%', 'Yayında', '₺95K', 'Kullanıcı deneyimi yükselişte', true),
  ('royalwin', 'RoyalWin', 'Spor', 94, 4.6, 92, 4.1, 19, 3, 16, 'İzleniyor', '+7%', 'Yayında', '₺88K', 'Yanıt süresi izleniyor', true),
  ('turkbahis', 'TürkBahis', 'Spor & Casino', 95, 4.6, 95, 4, 12, 1, 11, 'Düşük Risk', '+18%', 'Yayında', '₺70K', 'Çözüm performansı güçlü', true),
  ('grandbet', 'GrandBet', 'Spor', 91, 4.4, 88, 5.2, 24, 4, 20, 'İzleniyor', '+4%', 'Yayında', '₺64K', 'Yanıt bekleyen dosya var', true),
  ('primeplay', 'PrimePlay', 'Casino', 93, 4.5, 90, 3.8, 18, 2, 16, 'Düşük Risk', '+8%', 'Yayında', '₺76K', 'Stabil görünüm', true),
  ('megabahis', 'MegaBahis', 'Spor', 87, 4.1, 82, 7.2, 36, 7, 29, 'İzleniyor', '-2%', 'Yayında', '₺40K', 'Risk görünürlüğü arttı', true),
  ('casinomax', 'CasinoMax', 'Casino', 89, 4.2, 84, 6.4, 31, 5, 26, 'İzleniyor', '+1%', 'Yayında', '₺48K', 'Yanıt süresi izleniyor', true),
  ('betroyal', 'BetRoyal', 'Spor & Casino', 92, 4.5, 89, 4.5, 21, 3, 18, 'Düşük Risk', '+6%', 'Yayında', '₺58K', 'Stabil görünüm', true),
  ('winarena', 'WinArena', 'Spor', 86, 4, 80, 8, 42, 8, 34, 'İzleniyor', '-4%', 'Yayında', '₺35K', 'Risk görünürlüğü arttı', true),
  ('novabet', 'NovaBet', 'Spor', 90, 4.3, 86, 5.8, 27, 4, 23, 'İzleniyor', '+5%', 'Yayında', '₺52K', 'Kullanıcı deneyimi yükselişte', true),
  ('goldenplay', 'GoldenPlay', 'Casino', 88, 4.2, 83, 6.1, 29, 5, 24, 'İzleniyor', '+3%', 'Yayında', '₺45K', 'Yanıt bekleyen dosya var', true),
  ('starbahis', 'StarBahis', 'Spor', 84, 3.9, 78, 8.8, 48, 10, 38, 'Yüksek Risk', '-7%', 'İncelemede', '₺28K', 'Risk görünürlüğü arttı', true),
  ('elitebet', 'EliteBet', 'Casino', 91, 4.4, 88, 4.9, 22, 3, 19, 'Düşük Risk', '+6%', 'Yayında', '₺62K', 'Çözüm performansı güçlü', true),
  ('bahisplus', 'BahisPlus', 'Spor', 85, 4, 79, 7.9, 39, 8, 31, 'İzleniyor', '-1%', 'Yayında', '₺34K', 'Yanıt süresi izleniyor', true),
  ('royalbet', 'RoyalBet', 'Spor & Casino', 89, 4.2, 85, 5.6, 30, 5, 25, 'İzleniyor', '+2%', 'Yayında', '₺44K', 'Stabil görünüm', true),
  ('jetcasino', 'JetCasino', 'Casino', 90, 4.3, 87, 4.7, 25, 4, 21, 'Düşük Risk', '+5%', 'Yayında', '₺50K', 'Kullanıcı deneyimi yükselişte', true),
  ('luckyzone', 'LuckyZone', 'Casino', 83, 3.8, 76, 9.5, 52, 12, 40, 'Yüksek Risk', '-8%', 'İncelemede', '₺22K', 'Risk görünürlüğü arttı', true),
  ('grandroyal', 'GrandRoyal', 'Spor & Casino', 92, 4.5, 90, 4.2, 20, 3, 17, 'Düşük Risk', '+7%', 'Yayında', '₺66K', 'Çözüm performansı güçlü', true),
  ('apexbet', 'ApexBet', 'Spor', 87, 4.1, 81, 7, 35, 7, 28, 'İzleniyor', '+1%', 'Yayında', '₺38K', 'Yanıt bekleyen dosya var', true),
  ('betline', 'BetLine', 'Spor', 86, 4, 80, 7.5, 37, 7, 30, 'İzleniyor', '+2%', 'Yayında', '₺36K', 'Yanıt süresi izleniyor', true),
  ('maxwin', 'MaxWin', 'Casino', 88, 4.2, 84, 5.9, 28, 5, 23, 'İzleniyor', '+3%', 'Yayında', '₺42K', 'Stabil görünüm', true),
  ('kingarena', 'KingArena', 'Spor', 82, 3.7, 74, 10.2, 56, 14, 42, 'Yüksek Risk', '-9%', 'İncelemede', '₺20K', 'Risk görünürlüğü arttı', true),
  ('safeplay', 'SafePlay', 'Spor & Casino', 97, 4.8, 96, 3.1, 14, 1, 13, 'Düşük Risk', '+10%', 'Yayında', '₺92K', 'Çözüm performansı güçlü', true)
on conflict (slug) do update set
  name = excluded.name,
  category = excluded.category,
  trust_score = excluded.trust_score,
  user_experience_score = excluded.user_experience_score,
  resolution_rate = excluded.resolution_rate,
  avg_response_hours = excluded.avg_response_hours,
  complaint_count = excluded.complaint_count,
  open_complaint_count = excluded.open_complaint_count,
  solved_complaint_count = excluded.solved_complaint_count,
  risk_level = excluded.risk_level,
  trend = excluded.trend,
  status = excluded.status,
  sponsor_pool = excluded.sponsor_pool,
  short_insight = excluded.short_insight,
  visible = excluded.visible;

insert into public.brand_links (brand_id)
select id from public.brands
where slug in ('betsafe','meritroyal','royalwin','turkbahis','grandbet','primeplay','megabahis','casinomax','betroyal','winarena','novabet','goldenplay','starbahis','elitebet','bahisplus','royalbet','jetcasino','luckyzone','grandroyal','apexbet','betline','maxwin','kingarena','safeplay')
on conflict (brand_id) do nothing;

with badge_seed(slug, badge) as (
  values
    ('betsafe', 'Diamond Trust'), ('betsafe', 'Hızlı Yanıt'),
    ('meritroyal', 'Premium'), ('meritroyal', 'Stabil'),
    ('royalwin', 'Hızlı Destek'), ('turkbahis', 'KYC Hızlı'),
    ('turkbahis', 'Canlı Destek'), ('grandbet', 'Takipte'),
    ('primeplay', 'Premium'), ('megabahis', 'İzleniyor'),
    ('casinomax', 'Canlı Destek'), ('betroyal', 'Stabil'),
    ('winarena', 'Takipte'), ('novabet', 'Yükselen'),
    ('goldenplay', 'Stabil'), ('starbahis', 'İncelemede'),
    ('elitebet', 'Premium'), ('bahisplus', 'Takipte'),
    ('royalbet', 'Stabil'), ('jetcasino', 'Hızlı Yanıt'),
    ('luckyzone', 'İncelemede'), ('grandroyal', 'Premium'),
    ('apexbet', 'Takipte'), ('betline', 'Stabil'),
    ('maxwin', 'Canlı Destek'), ('kingarena', 'İncelemede'),
    ('safeplay', 'Diamond Trust')
)
insert into public.brand_badges (brand_id, badge)
select brands.id, badge_seed.badge
from badge_seed
join public.brands on brands.slug = badge_seed.slug
where not exists (
  select 1 from public.brand_badges existing
  where existing.brand_id = brands.id and existing.badge = badge_seed.badge
);

with score_seed(slug, score_type, score_value) as (
  select slug, 'trust_score', trust_score from public.brands
  where slug in ('betsafe','meritroyal','royalwin','turkbahis','grandbet','primeplay','megabahis','casinomax','betroyal','winarena','novabet','goldenplay','starbahis','elitebet','bahisplus','royalbet','jetcasino','luckyzone','grandroyal','apexbet','betline','maxwin','kingarena','safeplay')
)
insert into public.brand_scores (brand_id, score_type, score_value, source, note)
select brands.id, score_seed.score_type, score_seed.score_value, 'seed', 'Phase 1 brand seed'
from score_seed
join public.brands on brands.slug = score_seed.slug
where not exists (
  select 1 from public.brand_scores existing
  where existing.brand_id = brands.id
    and existing.score_type = score_seed.score_type
    and existing.source = 'seed'
);
