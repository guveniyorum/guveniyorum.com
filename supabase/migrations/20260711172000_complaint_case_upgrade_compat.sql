-- Normalize historical complaint schemas before the central case API is used.
-- Older installs stored profile IDs in complaints.user_id and used a narrower status vocabulary.

-- Convert legacy profile ownership to auth.users ownership, then replace the FK.
update public.complaints complaint
set user_id = profile.user_id
from public.profiles profile
where complaint.user_id = profile.id
  and profile.user_id is not null
  and complaint.user_id is distinct from profile.user_id;

do $$
declare
  fk record;
begin
  for fk in
    select distinct constraint_row.conname
    from pg_constraint constraint_row
    join unnest(constraint_row.conkey) as key_column(attnum) on true
    join pg_attribute attribute_row
      on attribute_row.attrelid = constraint_row.conrelid
     and attribute_row.attnum = key_column.attnum
    where constraint_row.conrelid = 'public.complaints'::regclass
      and constraint_row.contype = 'f'
      and attribute_row.attname = 'user_id'
  loop
    execute format('alter table public.complaints drop constraint %I', fk.conname);
  end loop;
end
$$;

update public.complaints complaint
set user_id = null
where complaint.user_id is not null
  and not exists (
    select 1 from auth.users auth_user where auth_user.id = complaint.user_id
  );

alter table public.complaints
  add constraint complaints_user_id_auth_fkey
  foreign key (user_id) references auth.users(id) on delete set null;

-- Replace any historical status check with a vocabulary that accepts old and new lifecycle values.
do $$
declare
  check_constraint record;
begin
  for check_constraint in
    select conname
    from pg_constraint
    where conrelid = 'public.complaints'::regclass
      and contype = 'c'
      and position('status' in lower(pg_get_constraintdef(oid))) > 0
  loop
    execute format('alter table public.complaints drop constraint %I', check_constraint.conname);
  end loop;
end
$$;

alter table public.complaints alter column status set default 'submitted';

update public.complaints
set status = 'submitted'
where status is null
   or status not in (
     'draft',
     'pending',
     'submitted',
     'pending_review',
     'in_review',
     'approved',
     'rejected',
     'need_evidence',
     'brand_waiting',
     'user_action',
     'resolution_offered',
     'in_resolution',
     'resolved',
     'solved',
     'closed',
     'unverified'
   );

alter table public.complaints
  add constraint complaints_status_check
  check (status in (
    'draft',
    'pending',
    'submitted',
    'pending_review',
    'in_review',
    'approved',
    'rejected',
    'need_evidence',
    'brand_waiting',
    'user_action',
    'resolution_offered',
    'in_resolution',
    'resolved',
    'solved',
    'closed',
    'unverified'
  ));

-- Upgrade the historical history table shape without discarding actor data.
alter table public.complaint_status_history
  add column if not exists actor_user_id uuid,
  add column if not exists actor_role text not null default 'system',
  add column if not exists note text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists from_status text,
  add column if not exists to_status text;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'complaint_status_history'
      and column_name = 'actor_id'
  ) then
    execute $migration$
      update public.complaint_status_history history
      set actor_user_id = profile.user_id
      from public.profiles profile
      where history.actor_user_id is null
        and history.actor_id = profile.id
        and profile.user_id is not null
    $migration$;
  end if;
end
$$;

update public.complaint_status_history history
set actor_role = coalesce(role_row.role, 'user')
from public.user_roles role_row
where history.actor_user_id = role_row.user_id
  and history.actor_role = 'system';

update public.complaint_status_history
set to_status = 'submitted'
where to_status is null or btrim(to_status) = '';

alter table public.complaint_status_history alter column to_status set not null;

do $$
declare
  fk record;
begin
  for fk in
    select distinct constraint_row.conname
    from pg_constraint constraint_row
    join unnest(constraint_row.conkey) as key_column(attnum) on true
    join pg_attribute attribute_row
      on attribute_row.attrelid = constraint_row.conrelid
     and attribute_row.attnum = key_column.attnum
    where constraint_row.conrelid = 'public.complaint_status_history'::regclass
      and constraint_row.contype = 'f'
      and attribute_row.attname = 'actor_user_id'
  loop
    execute format('alter table public.complaint_status_history drop constraint %I', fk.conname);
  end loop;
end
$$;

update public.complaint_status_history history
set actor_user_id = null
where history.actor_user_id is not null
  and not exists (
    select 1 from auth.users auth_user where auth_user.id = history.actor_user_id
  );

alter table public.complaint_status_history
  add constraint complaint_status_history_actor_user_fkey
  foreign key (actor_user_id) references auth.users(id) on delete set null;
