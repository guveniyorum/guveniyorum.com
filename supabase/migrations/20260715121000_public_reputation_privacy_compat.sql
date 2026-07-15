-- Privacy and compatibility hardening for the public reputation platform.

-- Keep the six-argument API used by current clients available in every environment.
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
  generated_public_id text;
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

  generated_public_id := 'GVN-'
    || extract(year from now())::integer
    || '-'
    || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));

  insert into public.complaints (
    user_id,
    public_id,
    brand_id,
    brand_name,
    category,
    title,
    description,
    requested_solution,
    status,
    priority,
    updated_at,
    public_visibility,
    public_summary,
    published_at
  ) values (
    current_user_id,
    generated_public_id,
    p_brand_id,
    coalesce(nullif(btrim(p_brand_name), ''), 'Bilinmeyen Marka'),
    coalesce(nullif(btrim(p_category), ''), 'Genel bildirim'),
    btrim(p_title),
    btrim(p_description),
    nullif(btrim(coalesce(p_requested_solution, '')), ''),
    'submitted',
    'normal',
    now(),
    'published',
    btrim(p_description),
    now()
  )
  returning * into created_case;

  if not exists (
    select 1 from public.complaint_status_history history
    where history.complaint_id = created_case.id
  ) then
    insert into public.complaint_status_history (
      complaint_id,
      to_status,
      actor_user_id,
      actor_role
    ) values (
      created_case.id,
      created_case.status,
      current_user_id,
      'user'
    );
  end if;

  return created_case;
end;
$$;

-- Preserve the historical seven-argument overload as a compatibility adapter.
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
begin
  return public.create_complaint_case(
    p_brand_id,
    p_brand_name,
    p_category,
    p_title,
    p_description,
    p_requested_solution
  );
end;
$$;

revoke all on function public.create_complaint_case(uuid, text, text, text, text, text) from public;
revoke all on function public.create_complaint_case(uuid, uuid, text, text, text, text, text) from public;
grant execute on function public.create_complaint_case(uuid, text, text, text, text, text) to authenticated;
grant execute on function public.create_complaint_case(uuid, uuid, text, text, text, text, text) to authenticated;

-- Public output may use only a nickname explicitly chosen by the member.
-- Never fall back to display_name, auth full_name or an email-derived value.
create or replace function public.get_public_reputation_feed(
  p_search text default null,
  p_status text default null,
  p_category text default null,
  p_brand_slug text default null,
  p_limit integer default 40,
  p_offset integer default 0
)
returns table (
  public_id text,
  brand_name text,
  brand_slug text,
  brand_logo_url text,
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
    coalesce(nullif(complaint.brand_name, ''), brand.name, 'Bilinmeyen Marka'),
    brand.slug,
    brand.logo_url,
    coalesce(nullif(complaint.category, ''), 'Genel bildirim'),
    complaint.title,
    coalesce(nullif(complaint.public_summary, ''), complaint.description),
    complaint.status,
    coalesce(complaint.published_at, complaint.updated_at, complaint.created_at),
    coalesce(nullif(profile.nickname, ''), 'Topluluk Üyesi'),
    coalesce(nullif(profile.avatar_key, ''), 'neon-orbit'),
    coalesce(profile.trust_score, 70),
    coalesce(profile.contribution_score, 0),
    (
      select count(*)
      from public.complaint_attachments attachment
      where attachment.complaint_id = complaint.id
        and attachment.public_visibility = 'published'
        and attachment.moderation_status = 'approved'
    )
  from public.complaints complaint
  left join public.brands brand
    on brand.id = complaint.brand_id
    or (
      complaint.brand_id is null
      and lower(btrim(coalesce(complaint.brand_name, ''))) = lower(btrim(brand.name))
    )
  left join public.profiles profile on profile.user_id = complaint.user_id
  where complaint.public_visibility = 'published'
    and complaint.public_id is not null
    and (
      p_search is null
      or btrim(p_search) = ''
      or complaint.title ilike '%' || btrim(p_search) || '%'
      or complaint.description ilike '%' || btrim(p_search) || '%'
      or coalesce(complaint.brand_name, brand.name, '') ilike '%' || btrim(p_search) || '%'
      or coalesce(profile.nickname, '') ilike '%' || btrim(p_search) || '%'
    )
    and (
      p_category is null
      or btrim(p_category) = ''
      or lower(coalesce(complaint.category, '')) = lower(btrim(p_category))
    )
    and (
      p_brand_slug is null
      or btrim(p_brand_slug) = ''
      or lower(coalesce(brand.slug, '')) = lower(btrim(p_brand_slug))
    )
    and (
      p_status is null
      or btrim(p_status) = ''
      or lower(p_status) = 'all'
      or (lower(p_status) = 'open' and complaint.status not in ('resolved', 'closed', 'rejected', 'solved'))
      or (lower(p_status) = 'resolved' and complaint.status in ('resolved', 'closed', 'solved'))
      or lower(complaint.status) = lower(btrim(p_status))
    )
  order by coalesce(complaint.published_at, complaint.updated_at, complaint.created_at) desc
  limit least(greatest(coalesce(p_limit, 40), 1), 100)
  offset greatest(coalesce(p_offset, 0), 0);
$$;

revoke all on function public.get_public_reputation_feed(text, text, text, text, integer, integer) from public;
grant execute on function public.get_public_reputation_feed(text, text, text, text, integer, integer) to anon, authenticated;

create or replace function public.get_public_brand_profile(p_slug text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with target_brand as (
    select brand.*
    from public.brands brand
    where lower(brand.slug) = lower(btrim(p_slug))
      and coalesce(brand.visible, true)
      and coalesce(brand.status, 'Yayında') <> 'Gizli'
    limit 1
  ),
  brand_cases as (
    select complaint.*
    from public.complaints complaint
    join target_brand brand
      on complaint.brand_id = brand.id
      or (
        complaint.brand_id is null
        and lower(btrim(coalesce(complaint.brand_name, ''))) = lower(btrim(brand.name))
      )
    where complaint.public_visibility = 'published'
  )
  select jsonb_build_object(
    'brand', jsonb_build_object(
      'id', brand.id,
      'slug', brand.slug,
      'name', brand.name,
      'category', brand.category,
      'logo_url', brand.logo_url,
      'website_url', brand.website_url,
      'description', coalesce(nullif(brand.public_description, ''), nullif(brand.short_insight, ''), 'Marka güven ve çözüm performansı topluluk verileriyle izlenir.'),
      'verified', coalesce(brand.verified, false),
      'trust_score', coalesce(brand.trust_score, 0),
      'user_experience_score', coalesce(brand.user_experience_score, 0),
      'resolution_rate', coalesce(brand.resolution_rate, 0),
      'avg_response_hours', coalesce(brand.avg_response_hours, 0),
      'risk_level', coalesce(brand.risk_level, 'İzleniyor'),
      'trend', coalesce(brand.trend, '+0%'),
      'status', coalesce(brand.status, 'Yayında')
    ),
    'metrics', jsonb_build_object(
      'total_complaints', greatest((select count(*) from brand_cases), coalesce(brand.complaint_count, 0)),
      'open_complaints', greatest((select count(*) from brand_cases where status not in ('resolved', 'closed', 'rejected', 'solved')), coalesce(brand.open_complaint_count, 0)),
      'resolved_complaints', greatest((select count(*) from brand_cases where status in ('resolved', 'closed', 'solved')), coalesce(brand.solved_complaint_count, 0)),
      'public_evidence', (
        select count(*)
        from public.complaint_attachments attachment
        join brand_cases complaint on complaint.id = attachment.complaint_id
        where attachment.public_visibility = 'published'
          and attachment.moderation_status = 'approved'
      ),
      'last_complaint_at', (select max(coalesce(published_at, updated_at, created_at)) from brand_cases)
    ),
    'categories', coalesce((
      select jsonb_agg(jsonb_build_object('name', category_name, 'count', category_count) order by category_count desc, category_name)
      from (
        select coalesce(nullif(category, ''), 'Genel bildirim') as category_name, count(*) as category_count
        from brand_cases
        group by 1
      ) category_rows
    ), '[]'::jsonb),
    'complaints', coalesce((
      select jsonb_agg(jsonb_build_object(
        'public_id', complaint.public_id,
        'title', complaint.title,
        'summary', coalesce(nullif(complaint.public_summary, ''), complaint.description),
        'category', coalesce(nullif(complaint.category, ''), 'Genel bildirim'),
        'status', complaint.status,
        'published_at', coalesce(complaint.published_at, complaint.updated_at, complaint.created_at),
        'author_nickname', coalesce(nullif(profile.nickname, ''), 'Topluluk Üyesi'),
        'author_avatar_key', coalesce(nullif(profile.avatar_key, ''), 'neon-orbit'),
        'attachment_count', (
          select count(*) from public.complaint_attachments attachment
          where attachment.complaint_id = complaint.id
            and attachment.public_visibility = 'published'
            and attachment.moderation_status = 'approved'
        )
      ) order by coalesce(complaint.published_at, complaint.updated_at, complaint.created_at) desc)
      from brand_cases complaint
      left join public.profiles profile on profile.user_id = complaint.user_id
    ), '[]'::jsonb)
  )
  from target_brand brand;
$$;

revoke all on function public.get_public_brand_profile(text) from public;
grant execute on function public.get_public_brand_profile(text) to anon, authenticated;

create or replace function public.get_public_reputation_dossier(p_public_id text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'case', jsonb_build_object(
      'public_id', complaint.public_id,
      'brand_id', complaint.brand_id,
      'brand_name', coalesce(nullif(complaint.brand_name, ''), brand.name, 'Bilinmeyen Marka'),
      'brand_slug', brand.slug,
      'brand_logo_url', brand.logo_url,
      'brand_website_url', brand.website_url,
      'category', coalesce(nullif(complaint.category, ''), 'Genel bildirim'),
      'title', complaint.title,
      'summary', coalesce(nullif(complaint.public_summary, ''), complaint.description),
      'requested_solution', complaint.requested_solution,
      'resolution_summary', complaint.resolution_summary,
      'status', complaint.status,
      'priority', complaint.priority,
      'created_at', complaint.created_at,
      'updated_at', complaint.updated_at,
      'published_at', complaint.published_at
    ),
    'author', jsonb_build_object(
      'nickname', coalesce(nullif(profile.nickname, ''), 'Topluluk Üyesi'),
      'avatar_key', coalesce(nullif(profile.avatar_key, ''), 'neon-orbit'),
      'bio', coalesce(nullif(profile.bio, ''), 'Topluluk deneyimini takma adıyla paylaşan Güveniyorum üyesi.'),
      'trust_score', coalesce(profile.trust_score, 70),
      'contribution_score', coalesce(profile.contribution_score, 0),
      'complaint_count', coalesce(profile.complaint_count, 0),
      'review_count', coalesce(profile.review_count, 0),
      'helpful_votes', coalesce(profile.helpful_votes, 0),
      'joined_at', profile.created_at
    ),
    'brand', case when brand.id is null then null else jsonb_build_object(
      'slug', brand.slug,
      'name', brand.name,
      'logo_url', brand.logo_url,
      'website_url', brand.website_url,
      'verified', coalesce(brand.verified, false),
      'trust_score', coalesce(brand.trust_score, 0),
      'user_experience_score', coalesce(brand.user_experience_score, 0),
      'resolution_rate', coalesce(brand.resolution_rate, 0),
      'avg_response_hours', coalesce(brand.avg_response_hours, 0),
      'risk_level', coalesce(brand.risk_level, 'İzleniyor')
    ) end,
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
  left join public.brands brand
    on brand.id = complaint.brand_id
    or (
      complaint.brand_id is null
      and lower(btrim(coalesce(complaint.brand_name, ''))) = lower(btrim(brand.name))
    )
  left join public.profiles profile on profile.user_id = complaint.user_id
  where complaint.public_id = p_public_id
    and complaint.public_visibility = 'published'
  limit 1;
$$;

revoke all on function public.get_public_reputation_dossier(text) from public;
grant execute on function public.get_public_reputation_dossier(text) to anon, authenticated;
