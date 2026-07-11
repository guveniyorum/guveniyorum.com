-- Secure staff access for complaint evidence.
-- Public users never receive evidence object access. Complaint owners keep owner-only access.

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user' check (role in ('user', 'brand', 'moderator', 'admin')),
  brand_id uuid null references public.brands(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_roles enable row level security;
revoke all on table public.user_roles from anon, authenticated;
grant select on table public.user_roles to authenticated;

create or replace function public.is_platform_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = (select auth.uid())
      and role in ('admin', 'moderator')
  );
$$;

revoke all on function public.is_platform_staff() from public;
grant execute on function public.is_platform_staff() to authenticated;

drop policy if exists "Users can read own platform role" on public.user_roles;
create policy "Users can read own platform role"
on public.user_roles
for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Staff can read platform roles" on public.user_roles;
create policy "Staff can read platform roles"
on public.user_roles
for select
to authenticated
using (public.is_platform_staff());

-- Keep the official operations account usable in fresh environments.
insert into public.user_roles (user_id, role)
select id, 'admin'
from auth.users
where lower(email) = 'destek@guveniyorum.com'
on conflict (user_id) do update
set role = excluded.role,
    updated_at = now();

alter table public.complaint_attachments
  add column if not exists admin_note text,
  add column if not exists reviewed_by uuid references auth.users(id) on delete set null,
  add column if not exists reviewed_at timestamptz;

create index if not exists complaint_attachments_moderation_idx
  on public.complaint_attachments (moderation_status, created_at desc);

revoke all on table public.complaint_attachments from anon;
grant select, update on table public.complaint_attachments to authenticated;

drop policy if exists "Staff can read all complaint attachments" on public.complaint_attachments;
create policy "Staff can read all complaint attachments"
on public.complaint_attachments
for select
to authenticated
using (public.is_platform_staff());

drop policy if exists "Staff can moderate complaint attachments" on public.complaint_attachments;
create policy "Staff can moderate complaint attachments"
on public.complaint_attachments
for update
to authenticated
using (public.is_platform_staff())
with check (public.is_platform_staff());

-- Staff may read the uploader's safe profile identity inside the operations panel.
drop policy if exists "Staff can read user profiles" on public.profiles;
create policy "Staff can read user profiles"
on public.profiles
for select
to authenticated
using (public.is_platform_staff());

-- Staff can inspect and update complaint records. Existing owner/public policies remain unchanged in this phase.
grant select, update on table public.complaints to authenticated;

drop policy if exists "Staff can read all complaints" on public.complaints;
create policy "Staff can read all complaints"
on public.complaints
for select
to authenticated
using (public.is_platform_staff());

drop policy if exists "Staff can update all complaints" on public.complaints;
create policy "Staff can update all complaints"
on public.complaints
for update
to authenticated
using (public.is_platform_staff())
with check (public.is_platform_staff());

-- The bucket stays private. Signed URLs work only for users allowed by this SELECT policy.
drop policy if exists "Staff can read all complaint evidence" on storage.objects;
create policy "Staff can read all complaint evidence"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'complaint-evidence'
  and public.is_platform_staff()
);
