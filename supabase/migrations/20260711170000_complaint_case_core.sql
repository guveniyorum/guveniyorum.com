-- Central complaint case core.
-- Persists complaint text, server-generated public IDs, ownership, brand assignment and status history.

create table if not exists public.complaint_public_id_counters (
  year integer primary key,
  last_value bigint not null default 0 check (last_value >= 0),
  updated_at timestamptz not null default now()
);

alter table public.complaint_public_id_counters enable row level security;
revoke all on table public.complaint_public_id_counters from anon, authenticated;

create table if not exists public.complaints (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid references auth.users(id) on delete set null,
  title text not null,
  description text not null,
  status text not null default 'submitted'
);

alter table public.complaints
  add column if not exists public_id text,
  add column if not exists brand_id uuid,
  add column if not exists brand_name text,
  add column if not exists category text,
  add column if not exists requested_solution text,
  add column if not exists priority text not null default 'normal',
  add column if not exists source text not null default 'web',
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists closed_at timestamptz,
  add column if not exists last_actor_user_id uuid references auth.users(id) on delete set null,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

update public.complaints
set brand_name = coalesce(nullif(brand_name, ''), 'Bilinmeyen Marka'),
    category = coalesce(nullif(category, ''), 'Genel bildirim'),
    updated_at = coalesce(updated_at, created_at, now())
where brand_name is null
   or category is null
   or updated_at is null;

create or replace function public.next_complaint_public_id()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  current_year integer := extract(year from timezone('utc', now()))::integer;
  next_value bigint;
begin
  insert into public.complaint_public_id_counters (year, last_value, updated_at)
  values (current_year, 1, now())
  on conflict (year) do update
    set last_value = public.complaint_public_id_counters.last_value + 1,
        updated_at = now()
  returning last_value into next_value;

  return format('GVN-%s-%s', current_year, lpad(next_value::text, 6, '0'));
end;
$$;

revoke all on function public.next_complaint_public_id() from public;

do $$
declare
  complaint_row record;
begin
  for complaint_row in
    select id
    from public.complaints
    where public_id is null or btrim(public_id) = ''
    order by created_at nulls first, id
  loop
    update public.complaints
    set public_id = public.next_complaint_public_id()
    where id = complaint_row.id;
  end loop;
end
$$;

create unique index if not exists complaints_public_id_uidx
  on public.complaints (public_id);
create index if not exists complaints_user_created_idx
  on public.complaints (user_id, created_at desc);
create index if not exists complaints_brand_created_idx
  on public.complaints (brand_id, created_at desc);
create index if not exists complaints_status_created_idx
  on public.complaints (status, created_at desc);

alter table public.complaints alter column public_id set not null;

create or replace function public.prepare_complaint_case()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.public_id is null or btrim(new.public_id) = '' then
    new.public_id := public.next_complaint_public_id();
  end if;
  new.updated_at := coalesce(new.updated_at, now());
  new.brand_name := coalesce(nullif(btrim(new.brand_name), ''), 'Bilinmeyen Marka');
  new.category := coalesce(nullif(btrim(new.category), ''), 'Genel bildirim');
  return new;
end;
$$;

drop trigger if exists complaints_prepare_case on public.complaints;
create trigger complaints_prepare_case
before insert or update on public.complaints
for each row execute function public.prepare_complaint_case();

do $$
begin
  if to_regclass('public.brands') is not null
     and not exists (
       select 1 from pg_constraint
       where conrelid = 'public.complaints'::regclass
         and conname = 'complaints_brand_id_fkey'
     ) then
    alter table public.complaints
      add constraint complaints_brand_id_fkey
      foreign key (brand_id) references public.brands(id) on delete set null;
  end if;
end
$$;

create table if not exists public.complaint_status_history (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  from_status text,
  to_status text not null,
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_role text not null default 'system',
  note text,
  created_at timestamptz not null default now()
);

create index if not exists complaint_status_history_case_idx
  on public.complaint_status_history (complaint_id, created_at asc);

create or replace function public.record_complaint_status_history()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  resolved_role text := 'user';
begin
  if tg_op = 'UPDATE' and new.status is not distinct from old.status then
    return new;
  end if;

  select role into resolved_role
  from public.user_roles
  where user_id = auth.uid()
  limit 1;

  insert into public.complaint_status_history (
    complaint_id,
    from_status,
    to_status,
    actor_user_id,
    actor_role
  ) values (
    new.id,
    case when tg_op = 'UPDATE' then old.status else null end,
    new.status,
    auth.uid(),
    coalesce(resolved_role, case when auth.uid() is null then 'system' else 'user' end)
  );

  return new;
end;
$$;

drop trigger if exists complaints_status_history on public.complaints;
create trigger complaints_status_history
after insert or update of status on public.complaints
for each row execute function public.record_complaint_status_history();

create or replace function public.increment_profile_for_complaint()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set complaint_count = coalesce(complaint_count, 0) + 1,
      contribution_score = coalesce(contribution_score, 0) + 2,
      points = coalesce(points, 0) + 40,
      updated_at = now()
  where user_id = new.user_id;
  return new;
end;
$$;

drop trigger if exists complaints_profile_contribution on public.complaints;
create trigger complaints_profile_contribution
after insert on public.complaints
for each row execute function public.increment_profile_for_complaint();

create or replace function public.create_complaint_case(
  p_brand_id uuid,
  p_brand_name text,
  p_category text,
  p_title text,
  p_description text,
  p_requested_solution text default null
)
returns public.complaints
language plpgsql
security definer
set search_path = public
as $$
declare
  created_case public.complaints;
  current_user_id uuid := auth.uid();
  safe_brand_name text := nullif(btrim(coalesce(p_brand_name, '')), '');
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;
  if char_length(btrim(coalesce(p_title, ''))) < 4 then
    raise exception 'TITLE_TOO_SHORT' using errcode = '22023';
  end if;
  if char_length(btrim(coalesce(p_description, ''))) < 12 then
    raise exception 'DESCRIPTION_TOO_SHORT' using errcode = '22023';
  end if;

  if p_brand_id is not null and to_regclass('public.brands') is not null then
    select name into safe_brand_name
    from public.brands
    where id = p_brand_id
    limit 1;
  end if;

  insert into public.complaints (
    user_id,
    brand_id,
    brand_name,
    category,
    title,
    description,
    requested_solution,
    status,
    priority,
    source,
    last_actor_user_id
  ) values (
    current_user_id,
    p_brand_id,
    coalesce(safe_brand_name, 'Bilinmeyen Marka'),
    coalesce(nullif(btrim(p_category), ''), 'Genel bildirim'),
    btrim(p_title),
    btrim(p_description),
    nullif(btrim(coalesce(p_requested_solution, '')), ''),
    'submitted',
    'normal',
    'web',
    current_user_id
  )
  returning * into created_case;

  return created_case;
end;
$$;

revoke all on function public.create_complaint_case(uuid, text, text, text, text, text) from public;
grant execute on function public.create_complaint_case(uuid, text, text, text, text, text) to authenticated;

create or replace function public.can_access_complaint(p_complaint_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.complaints complaint
    where complaint.id = p_complaint_id
      and (
        complaint.user_id = auth.uid()
        or public.is_platform_staff()
        or exists (
          select 1
          from public.user_roles role_row
          where role_row.user_id = auth.uid()
            and role_row.role = 'brand'
            and role_row.brand_id is not null
            and role_row.brand_id = complaint.brand_id
        )
      )
  );
$$;

revoke all on function public.can_access_complaint(uuid) from public;
grant execute on function public.can_access_complaint(uuid) to authenticated;

alter table public.complaints enable row level security;
revoke all on table public.complaints from anon;
grant select, insert, update on table public.complaints to authenticated;

drop policy if exists "Complaints are publicly readable" on public.complaints;
drop policy if exists "Users can read own complaints" on public.complaints;
create policy "Users can read own complaints"
on public.complaints for select to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can insert own complaints" on public.complaints;
create policy "Users can insert own complaints"
on public.complaints for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists "Users can update own complaints" on public.complaints;

drop policy if exists "Staff can read all complaint cases" on public.complaints;
create policy "Staff can read all complaint cases"
on public.complaints for select to authenticated
using (public.is_platform_staff());

drop policy if exists "Staff can update all complaint cases" on public.complaints;
create policy "Staff can update all complaint cases"
on public.complaints for update to authenticated
using (public.is_platform_staff())
with check (public.is_platform_staff());

drop policy if exists "Assigned brands can read complaint cases" on public.complaints;
create policy "Assigned brands can read complaint cases"
on public.complaints for select to authenticated
using (
  exists (
    select 1 from public.user_roles role_row
    where role_row.user_id = auth.uid()
      and role_row.role = 'brand'
      and role_row.brand_id is not null
      and role_row.brand_id = complaints.brand_id
  )
);

alter table public.complaint_status_history enable row level security;
revoke all on table public.complaint_status_history from anon, authenticated;
grant select on table public.complaint_status_history to authenticated;

drop policy if exists "Case participants can read complaint history" on public.complaint_status_history;
create policy "Case participants can read complaint history"
on public.complaint_status_history for select to authenticated
using (public.can_access_complaint(complaint_id));

alter table public.complaint_attachments
  add column if not exists complaint_id uuid;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.complaint_attachments'::regclass
      and conname = 'complaint_attachments_complaint_id_fkey'
  ) then
    alter table public.complaint_attachments
      add constraint complaint_attachments_complaint_id_fkey
      foreign key (complaint_id) references public.complaints(id) on delete cascade;
  end if;
end
$$;

create index if not exists complaint_attachments_case_idx
  on public.complaint_attachments (complaint_id, created_at asc);

drop policy if exists "Case participants can read complaint attachments" on public.complaint_attachments;
create policy "Case participants can read complaint attachments"
on public.complaint_attachments for select to authenticated
using (complaint_id is not null and public.can_access_complaint(complaint_id));

drop policy if exists "Case participants can read complaint evidence objects" on storage.objects;
create policy "Case participants can read complaint evidence objects"
on storage.objects for select to authenticated
using (
  bucket_id = 'complaint-evidence'
  and exists (
    select 1
    from public.complaint_attachments attachment
    where attachment.file_path = name
      and attachment.complaint_id is not null
      and public.can_access_complaint(attachment.complaint_id)
  )
);

grant usage on schema public to authenticated;
grant select on table public.brands to authenticated;
