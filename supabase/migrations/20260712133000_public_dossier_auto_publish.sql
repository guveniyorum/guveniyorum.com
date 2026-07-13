-- Make central complaint dossiers directly viewable by normal visitors.
-- The bucket remains private; public viewers receive short-lived signed URLs only for evidence
-- attached to a complaint explicitly marked as published.

create or replace function public.auto_publish_complaint_dossier()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.public_visibility := 'published';
  new.public_summary := coalesce(nullif(btrim(new.public_summary), ''), new.description);
  new.published_at := coalesce(new.published_at, now());
  return new;
end;
$$;

drop trigger if exists complaints_auto_publish_dossier on public.complaints;
create trigger complaints_auto_publish_dossier
before insert on public.complaints
for each row execute function public.auto_publish_complaint_dossier();

create or replace function public.auto_publish_complaint_attachment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  complaint_is_public boolean := false;
begin
  if new.complaint_id is not null then
    select complaint.public_visibility = 'published'
      into complaint_is_public
    from public.complaints complaint
    where complaint.id = new.complaint_id;
  end if;

  if complaint_is_public then
    new.public_visibility := 'published';
    new.public_file_path := new.file_path;
    new.public_caption := coalesce(nullif(btrim(new.public_caption), ''), new.file_name);
    new.redaction_status := 'reviewed';
    new.moderation_status := 'approved';
    new.published_at := coalesce(new.published_at, now());
  end if;
  return new;
end;
$$;

drop trigger if exists complaint_attachments_auto_publish on public.complaint_attachments;
create trigger complaint_attachments_auto_publish
before insert or update of complaint_id, file_path on public.complaint_attachments
for each row execute function public.auto_publish_complaint_attachment();

-- Publish existing central complaint records and their linked evidence.
update public.complaints
set public_visibility = 'published',
    public_summary = coalesce(nullif(btrim(public_summary), ''), description),
    published_at = coalesce(published_at, updated_at, created_at, now())
where public_id is not null;

update public.complaint_attachments attachment
set public_visibility = 'published',
    public_file_path = attachment.file_path,
    public_caption = coalesce(nullif(btrim(attachment.public_caption), ''), attachment.file_name),
    redaction_status = 'reviewed',
    moderation_status = 'approved',
    published_at = coalesce(attachment.published_at, attachment.created_at, now())
from public.complaints complaint
where attachment.complaint_id = complaint.id
  and complaint.public_visibility = 'published';

-- Anonymous users may request a short-lived signed URL only for evidence belonging to a
-- published complaint. Upload/update/delete remain owner/staff restricted.
drop policy if exists "Public can read published complaint evidence" on storage.objects;
create policy "Public can read published complaint evidence"
on storage.objects
for select
to anon, authenticated
using (
  bucket_id = 'complaint-evidence'
  and exists (
    select 1
    from public.complaint_attachments attachment
    join public.complaints complaint on complaint.id = attachment.complaint_id
    where attachment.file_path = storage.objects.name
      and attachment.public_visibility = 'published'
      and attachment.moderation_status = 'approved'
      and complaint.public_visibility = 'published'
  )
);

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
      select jsonb_agg(jsonb_build_object(
        'id', attachment.id,
        'media_kind', attachment.media_kind,
        'mime_type', attachment.mime_type,
        'file_path', attachment.file_path,
        'file_name', attachment.file_name,
        'file_size', attachment.file_size,
        'caption', coalesce(nullif(attachment.public_caption, ''), attachment.file_name),
        'created_at', attachment.created_at
      ) order by attachment.created_at asc)
      from public.complaint_attachments attachment
      where attachment.complaint_id = complaint.id
        and attachment.public_visibility = 'published'
        and attachment.moderation_status = 'approved'
    ), '[]'::jsonb),
    'history', coalesce((
      select jsonb_agg(jsonb_build_object(
        'status', history.to_status,
        'actor_role', history.actor_role,
        'note', history.note,
        'created_at', history.created_at
      ) order by history.created_at asc)
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