-- Public complaint dossier publication layer.
-- Private originals remain protected. Only staff-approved complaint text and copied evidence are exposed publicly.

alter table public.complaints
  add column if not exists public_visibility text not null default 'private',
  add column if not exists public_summary text,
  add column if not exists resolution_summary text,
  add column if not exists published_at timestamptz,
  add column if not exists published_by uuid references auth.users(id) on delete set null;

alter table public.complaint_attachments
  add column if not exists public_visibility text not null default 'private',
  add column if not exists public_file_path text,
  add column if not exists public_caption text,
  add column if not exists redaction_status text not null default 'unreviewed',
  add column if not exists published_at timestamptz,
  add column if not exists published_by uuid references auth.users(id) on delete set null;

do $$
begin
  alter table public.complaints drop constraint if exists complaints_public_visibility_check;
  alter table public.complaints
    add constraint complaints_public_visibility_check
    check (public_visibility in ('private', 'published', 'hidden'));

  alter table public.complaint_attachments drop constraint if exists complaint_attachments_public_visibility_check;
  alter table public.complaint_attachments
    add constraint complaint_attachments_public_visibility_check
    check (public_visibility in ('private', 'published'));

  alter table public.complaint_attachments drop constraint if exists complaint_attachments_redaction_status_check;
  alter table public.complaint_attachments
    add constraint complaint_attachments_redaction_status_check
    check (redaction_status in ('unreviewed', 'reviewed', 'redacted', 'blocked'));
end
$$;

create index if not exists complaints_public_feed_idx
  on public.complaints (public_visibility, published_at desc, created_at desc);
create index if not exists complaint_attachments_public_idx
  on public.complaint_attachments (complaint_id, public_visibility, created_at asc);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'complaint-public-evidence',
  'complaint-public-evidence',
  true,
  52428800,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ]::text[]
)
on conflict (id) do update
set public = true,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- The bucket is public only for files deliberately copied into it by staff.
-- Upload/update/delete remain staff-only.
drop policy if exists "Staff can read public complaint evidence objects" on storage.objects;
create policy "Staff can read public complaint evidence objects"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'complaint-public-evidence'
  and public.is_platform_staff()
);

drop policy if exists "Staff can upload public complaint evidence" on storage.objects;
create policy "Staff can upload public complaint evidence"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'complaint-public-evidence'
  and public.is_platform_staff()
);

drop policy if exists "Staff can update public complaint evidence" on storage.objects;
create policy "Staff can update public complaint evidence"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'complaint-public-evidence'
  and public.is_platform_staff()
)
with check (
  bucket_id = 'complaint-public-evidence'
  and public.is_platform_staff()
);

drop policy if exists "Staff can delete public complaint evidence" on storage.objects;
create policy "Staff can delete public complaint evidence"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'complaint-public-evidence'
  and public.is_platform_staff()
);

create or replace function public.get_public_complaint_feed(
  p_brand_name text default null,
  p_limit integer default 30,
  p_offset integer default 0
)
returns table (
  public_id text,
  brand_name text,
  category text,
  title text,
  public_summary text,
  status text,
  published_at timestamptz,
  author_nickname text,
  author_avatar_key text,
  author_trust_score integer,
  author_contribution_score integer,
  attachment_count bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    complaint.public_id,
    complaint.brand_name,
    complaint.category,
    complaint.title,
    coalesce(nullif(complaint.public_summary, ''), left(complaint.description, 800)) as public_summary,
    complaint.status,
    coalesce(complaint.published_at, complaint.updated_at, complaint.created_at) as published_at,
    coalesce(nullif(profile.nickname, ''), 'Topluluk Üyesi') as author_nickname,
    coalesce(nullif(profile.avatar_key, ''), 'neon-orbit') as author_avatar_key,
    coalesce(profile.trust_score, 70) as author_trust_score,
    coalesce(profile.contribution_score, 0) as author_contribution_score,
    (
      select count(*)
      from public.complaint_attachments attachment
      where attachment.complaint_id = complaint.id
        and attachment.public_visibility = 'published'
        and attachment.moderation_status = 'approved'
        and attachment.public_file_path is not null
    ) as attachment_count
  from public.complaints complaint
  left join public.profiles profile on profile.user_id = complaint.user_id
  where complaint.public_visibility = 'published'
    and (
      p_brand_name is null
      or btrim(p_brand_name) = ''
      or lower(complaint.brand_name) = lower(btrim(p_brand_name))
    )
  order by coalesce(complaint.published_at, complaint.updated_at, complaint.created_at) desc
  limit least(greatest(coalesce(p_limit, 30), 1), 100)
  offset greatest(coalesce(p_offset, 0), 0);
$$;

revoke all on function public.get_public_complaint_feed(text, integer, integer) from public;
grant execute on function public.get_public_complaint_feed(text, integer, integer) to anon, authenticated;

create or replace function public.get_public_complaint_stats()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'total', count(*),
    'open', count(*) filter (where complaint.status not in ('resolved', 'closed', 'rejected')),
    'resolved', count(*) filter (where complaint.status in ('resolved', 'closed')),
    'with_public_evidence', count(*) filter (
      where exists (
        select 1
        from public.complaint_attachments attachment
        where attachment.complaint_id = complaint.id
          and attachment.public_visibility = 'published'
          and attachment.moderation_status = 'approved'
          and attachment.public_file_path is not null
      )
    )
  )
  from public.complaints complaint
  where complaint.public_visibility = 'published';
$$;

revoke all on function public.get_public_complaint_stats() from public;
grant execute on function public.get_public_complaint_stats() to anon, authenticated;

create or replace function public.get_public_complaint_dossier(p_public_id text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'case', jsonb_build_object(
      'public_id', complaint.public_id,
      'brand_name', complaint.brand_name,
      'category', complaint.category,
      'title', complaint.title,
      'summary', coalesce(nullif(complaint.public_summary, ''), complaint.description),
      'resolution_summary', complaint.resolution_summary,
      'status', complaint.status,
      'created_at', complaint.created_at,
      'updated_at', complaint.updated_at,
      'published_at', complaint.published_at
    ),
    'author', jsonb_build_object(
      'nickname', coalesce(nullif(profile.nickname, ''), 'Topluluk Üyesi'),
      'avatar_key', coalesce(nullif(profile.avatar_key, ''), 'neon-orbit'),
      'trust_score', coalesce(profile.trust_score, 70),
      'contribution_score', coalesce(profile.contribution_score, 0),
      'complaint_count', coalesce(profile.complaint_count, 0),
      'joined_at', profile.created_at
    ),
    'attachments', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', attachment.id,
          'media_kind', attachment.media_kind,
          'mime_type', attachment.mime_type,
          'public_file_path', attachment.public_file_path,
          'caption', coalesce(nullif(attachment.public_caption, ''), 'Doğrulanmış kanıt'),
          'created_at', attachment.created_at
        ) order by attachment.created_at asc
      )
      from public.complaint_attachments attachment
      where attachment.complaint_id = complaint.id
        and attachment.public_visibility = 'published'
        and attachment.moderation_status = 'approved'
        and attachment.public_file_path is not null
    ), '[]'::jsonb),
    'history', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'status', history.to_status,
          'actor_role', history.actor_role,
          'note', history.note,
          'created_at', history.created_at
        ) order by history.created_at asc
      )
      from public.complaint_status_history history
      where history.complaint_id = complaint.id
    ), '[]'::jsonb)
  )
  from public.complaints complaint
  left join public.profiles profile on profile.user_id = complaint.user_id
  where complaint.public_id = p_public_id
    and complaint.public_visibility = 'published'
  limit 1;
$$;

revoke all on function public.get_public_complaint_dossier(text) from public;
grant execute on function public.get_public_complaint_dossier(text) to anon, authenticated;

create or replace function public.set_complaint_publication(
  p_complaint_id uuid,
  p_publish boolean,
  p_public_summary text default null,
  p_resolution_summary text default null
)
returns public.complaints
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_case public.complaints;
begin
  if not public.is_platform_staff() then
    raise exception 'STAFF_REQUIRED' using errcode = '42501';
  end if;

  if p_publish and char_length(btrim(coalesce(p_public_summary, ''))) < 12 then
    raise exception 'PUBLIC_SUMMARY_REQUIRED' using errcode = '22023';
  end if;

  update public.complaints
  set public_visibility = case when p_publish then 'published' else 'private' end,
      public_summary = case when p_public_summary is null then public_summary else nullif(btrim(p_public_summary), '') end,
      resolution_summary = case when p_resolution_summary is null then resolution_summary else nullif(btrim(p_resolution_summary), '') end,
      published_at = case when p_publish then coalesce(published_at, now()) else null end,
      published_by = case when p_publish then auth.uid() else null end,
      updated_at = now()
  where id = p_complaint_id
  returning * into updated_case;

  if updated_case.id is null then
    raise exception 'COMPLAINT_NOT_FOUND' using errcode = 'P0002';
  end if;

  return updated_case;
end;
$$;

revoke all on function public.set_complaint_publication(uuid, boolean, text, text) from public;
grant execute on function public.set_complaint_publication(uuid, boolean, text, text) to authenticated;

create or replace function public.set_complaint_attachment_publication(
  p_attachment_id uuid,
  p_publish boolean,
  p_public_file_path text default null,
  p_public_caption text default null,
  p_redaction_status text default 'reviewed'
)
returns public.complaint_attachments
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_attachment public.complaint_attachments;
  current_moderation text;
begin
  if not public.is_platform_staff() then
    raise exception 'STAFF_REQUIRED' using errcode = '42501';
  end if;

  select moderation_status into current_moderation
  from public.complaint_attachments
  where id = p_attachment_id;

  if current_moderation is null then
    raise exception 'ATTACHMENT_NOT_FOUND' using errcode = 'P0002';
  end if;

  if p_publish and current_moderation <> 'approved' then
    raise exception 'ATTACHMENT_MUST_BE_APPROVED' using errcode = '22023';
  end if;

  if p_publish and nullif(btrim(coalesce(p_public_file_path, '')), '') is null then
    raise exception 'PUBLIC_FILE_PATH_REQUIRED' using errcode = '22023';
  end if;

  update public.complaint_attachments
  set public_visibility = case when p_publish then 'published' else 'private' end,
      public_file_path = case when p_publish then btrim(p_public_file_path) else null end,
      public_caption = case when p_publish then nullif(btrim(coalesce(p_public_caption, '')), '') else public_caption end,
      redaction_status = case when p_publish then coalesce(nullif(btrim(p_redaction_status), ''), 'reviewed') else redaction_status end,
      published_at = case when p_publish then now() else null end,
      published_by = case when p_publish then auth.uid() else null end
  where id = p_attachment_id
  returning * into updated_attachment;

  return updated_attachment;
end;
$$;

revoke all on function public.set_complaint_attachment_publication(uuid, boolean, text, text, text) from public;
grant execute on function public.set_complaint_attachment_publication(uuid, boolean, text, text, text) to authenticated;

grant usage on schema public to anon, authenticated;
