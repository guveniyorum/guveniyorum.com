-- Link evidence uploads to a client-reserved complaint UUID in either race order.
-- This lets the existing uploader begin immediately while the central case RPC completes.

create or replace function public.link_attachment_to_complaint_case()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  parsed_case_id uuid;
begin
  if new.complaint_id is not null or new.local_complaint_id is null then
    return new;
  end if;

  begin
    parsed_case_id := new.local_complaint_id::uuid;
  exception when invalid_text_representation then
    return new;
  end;

  select complaint.id into new.complaint_id
  from public.complaints complaint
  where complaint.id = parsed_case_id
    and complaint.user_id = new.user_id
  limit 1;

  return new;
end;
$$;

drop trigger if exists complaint_attachments_link_case on public.complaint_attachments;
create trigger complaint_attachments_link_case
before insert or update of local_complaint_id, complaint_id on public.complaint_attachments
for each row execute function public.link_attachment_to_complaint_case();

create or replace function public.link_existing_attachments_after_complaint_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.complaint_attachments
  set complaint_id = new.id
  where complaint_id is null
    and user_id = new.user_id
    and local_complaint_id = new.id::text;
  return new;
end;
$$;

drop trigger if exists complaints_link_existing_attachments on public.complaints;
create trigger complaints_link_existing_attachments
after insert on public.complaints
for each row execute function public.link_existing_attachments_after_complaint_insert();

update public.complaint_attachments attachment
set complaint_id = complaint.id
from public.complaints complaint
where attachment.complaint_id is null
  and attachment.user_id = complaint.user_id
  and attachment.local_complaint_id = complaint.id::text;

drop function if exists public.create_complaint_case(uuid, text, text, text, text, text);

create or replace function public.create_complaint_case(
  p_case_id uuid,
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
  reserved_case_id uuid := coalesce(p_case_id, gen_random_uuid());
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
  if exists (select 1 from public.complaints where id = reserved_case_id) then
    raise exception 'CASE_ID_ALREADY_EXISTS' using errcode = '23505';
  end if;

  if p_brand_id is not null then
    select name into safe_brand_name
    from public.brands
    where id = p_brand_id
    limit 1;
  end if;

  insert into public.complaints (
    id,
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
    reserved_case_id,
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

revoke all on function public.create_complaint_case(uuid, uuid, text, text, text, text, text) from public;
grant execute on function public.create_complaint_case(uuid, uuid, text, text, text, text, text) to authenticated;
