create extension if not exists pgcrypto;

create table if not exists public.complaint_attachments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  complaint_id uuid null,
  local_complaint_id text null,
  file_path text not null unique,
  file_name text not null,
  file_size bigint not null default 0 check (file_size >= 0),
  mime_type text not null check (mime_type in (
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  )),
  media_kind text not null default 'image' check (media_kind in ('image', 'document', 'video')),
  evidence_type text not null default 'screenshot',
  upload_status text not null default 'uploaded',
  scan_status text not null default 'pending',
  moderation_status text not null default 'pending',
  duration_seconds integer null check (duration_seconds is null or duration_seconds >= 0),
  thumbnail_path text null,
  created_at timestamptz not null default now(),
  constraint complaint_attachment_target_check check (complaint_id is not null or local_complaint_id is not null)
);

create index if not exists complaint_attachments_user_id_idx on public.complaint_attachments (user_id);
create index if not exists complaint_attachments_complaint_id_idx on public.complaint_attachments (complaint_id);
create index if not exists complaint_attachments_local_complaint_id_idx on public.complaint_attachments (local_complaint_id);
create index if not exists complaint_attachments_created_at_idx on public.complaint_attachments (created_at desc);

alter table public.complaint_attachments enable row level security;

grant usage on schema public to authenticated;
grant select, insert, delete on public.complaint_attachments to authenticated;

drop policy if exists "Users can read own complaint attachments" on public.complaint_attachments;
create policy "Users can read own complaint attachments"
on public.complaint_attachments
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can add own complaint attachments" on public.complaint_attachments;
create policy "Users can add own complaint attachments"
on public.complaint_attachments
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own complaint attachments" on public.complaint_attachments;
create policy "Users can delete own complaint attachments"
on public.complaint_attachments
for delete
to authenticated
using ((select auth.uid()) = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'complaint-evidence',
  'complaint-evidence',
  false,
  52428800,
  array['image/jpeg','image/png','image/webp','application/pdf','video/mp4','video/webm','video/quicktime']::text[]
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can upload own complaint evidence" on storage.objects;
create policy "Users can upload own complaint evidence"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'complaint-evidence'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "Users can read own complaint evidence" on storage.objects;
create policy "Users can read own complaint evidence"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'complaint-evidence'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "Users can delete own complaint evidence" on storage.objects;
create policy "Users can delete own complaint evidence"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'complaint-evidence'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);
