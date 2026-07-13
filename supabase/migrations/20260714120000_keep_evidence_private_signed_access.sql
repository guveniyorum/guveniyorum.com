-- Public complaint dossiers use short-lived signed URLs.
-- The bucket stays private; RLS only permits signed access for evidence linked to a published complaint.

update storage.buckets
set public = false
where id = 'complaint-evidence';

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
      and attachment.moderation_status <> 'rejected'
      and complaint.public_visibility = 'published'
  )
);
