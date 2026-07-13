-- Make the complaint network a real public dossier experience.
-- Complaints are public by default; evidence remains linked to its case and is exposed through opaque paths.

alter table public.complaints
  alter column public_visibility set default 'published';

update public.complaints
set public_visibility = 'published',
    public_summary = coalesce(nullif(public_summary, ''), description),
    published_at = coalesce(published_at, updated_at, created_at, now())
where public_visibility is null or public_visibility = 'private';

alter table public.complaint_attachments
  alter column public_visibility set default 'published';

update public.complaint_attachments
set public_visibility = 'published',
    public_file_path = coalesce(nullif(public_file_path, ''), file_path),
    public_caption = coalesce(nullif(public_caption, ''), file_name, 'Şikayet kanıtı'),
    redaction_status = case when moderation_status = 'rejected' then 'blocked' else 'reviewed' end,
    published_at = coalesce(published_at, created_at, now())
where moderation_status <> 'rejected';

update storage.buckets
set public = true
where id = 'complaint-evidence';

create or replace function public.auto_publish_complaint_case()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.public_visibility := coalesce(nullif(new.public_visibility, ''), 'published');
  if new.public_visibility = 'published' then
    new.public_summary := coalesce(nullif(new.public_summary, ''), new.description);
    new.published_at := coalesce(new.published_at, now());
  end if;
  return new;
end;
$$;

drop trigger if exists complaints_auto_publication on public.complaints;
create trigger complaints_auto_publication
before insert or update of description, public_visibility on public.complaints
for each row execute function public.auto_publish_complaint_case();

create or replace function public.auto_publish_complaint_attachment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.moderation_status <> 'rejected' then
    new.public_visibility := 'published';
    new.public_file_path := coalesce(nullif(new.public_file_path, ''), new.file_path);
    new.public_caption := coalesce(nullif(new.public_caption, ''), new.file_name, 'Şikayet kanıtı');
    new.redaction_status := 'reviewed';
    new.published_at := coalesce(new.published_at, now());
  end if;
  return new;
end;
$$;

drop trigger if exists complaint_attachments_auto_publication on public.complaint_attachments;
create trigger complaint_attachments_auto_publication
before insert or update of file_path, file_name, moderation_status on public.complaint_attachments
for each row execute function public.auto_publish_complaint_attachment();

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
    coalesce(nullif(complaint.public_summary, ''), complaint.description) as public_summary,
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
        and attachment.moderation_status <> 'rejected'
        and coalesce(attachment.public_file_path, attachment.file_path) is not null
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
          'file_size', attachment.file_size,
          'public_file_path', coalesce(attachment.public_file_path, attachment.file_path),
          'storage_bucket', 'complaint-evidence',
          'caption', coalesce(nullif(attachment.public_caption, ''), attachment.file_name, 'Şikayet kanıtı'),
          'created_at', attachment.created_at
        ) order by attachment.created_at asc
      )
      from public.complaint_attachments attachment
      where attachment.complaint_id = complaint.id
        and attachment.moderation_status <> 'rejected'
        and coalesce(attachment.public_file_path, attachment.file_path) is not null
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
