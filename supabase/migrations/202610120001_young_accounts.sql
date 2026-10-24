-- Dedicated Young project only. Do not apply to the Business project.
create schema if not exists young_private;
revoke all on schema young_private from public, anon;
grant usage on schema young_private to authenticated;

create table young_private.staff_permissions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  permissions text[] not null default '{}'
);
revoke all on young_private.staff_permissions from public, anon, authenticated;
create table young_private.lesson_ids (lesson_id text primary key);
revoke all on young_private.lesson_ids from public, anon, authenticated;

create table public.young_profiles (
  id uuid primary key default gen_random_uuid(),
  guardian_id uuid not null references auth.users(id) on delete cascade,
  nickname text not null check (char_length(btrim(nickname)) between 1 and 40),
  disabled boolean not null default false,
  created_at timestamptz not null default now()
);
create index young_profiles_guardian_idx on public.young_profiles(guardian_id);

create table public.young_licenses (
  profile_id uuid primary key references public.young_profiles(id) on delete cascade,
  status text not null check (status in ('active','suspended','expired')),
  plan_id text not null check (plan_id in ('monthly','semiannual','annual')),
  starts_at timestamptz not null,
  expires_at timestamptz not null check (expires_at > starts_at),
  updated_at timestamptz not null default now()
);

create table public.young_progress (
  profile_id uuid primary key references public.young_profiles(id) on delete cascade,
  revision bigint not null check (revision > 0),
  payload jsonb not null,
  sharing boolean not null default false,
  updated_at timestamptz not null default now()
);

create function young_private.has_permission(required_permission text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from young_private.staff_permissions s join auth.users u on u.id=s.user_id
    where s.user_id=(select auth.uid()) and u.email_confirmed_at is not null
      and required_permission=any(s.permissions)
  );
$$;
create function young_private.can_read_profile(target_profile uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select (select auth.uid()) is not null and exists (
    select 1 from public.young_profiles p where p.id=target_profile and (
      p.guardian_id=(select auth.uid()) or (
        not p.disabled and young_private.has_permission('read_young_progress') and exists (
          select 1 from public.young_progress r where r.profile_id=p.id and r.sharing
        )
      )
    )
  );
$$;
revoke all on function young_private.has_permission(text) from public, anon;
revoke all on function young_private.can_read_profile(uuid) from public, anon;
grant execute on function young_private.has_permission(text), young_private.can_read_profile(uuid) to authenticated;

alter table public.young_profiles enable row level security;
alter table public.young_licenses enable row level security;
alter table public.young_progress enable row level security;
revoke all on public.young_profiles, public.young_licenses, public.young_progress from public, anon, authenticated;
grant select on public.young_profiles, public.young_licenses, public.young_progress to authenticated;
grant update(nickname) on public.young_profiles to authenticated;
create policy young_profile_read on public.young_profiles for select to authenticated
  using (young_private.can_read_profile(id));
create policy young_profile_rename on public.young_profiles for update to authenticated
  using (guardian_id=(select auth.uid()) and not disabled)
  with check (guardian_id=(select auth.uid()) and not disabled);
create policy young_license_read on public.young_licenses for select to authenticated
  using (exists (select 1 from public.young_profiles p where p.id=profile_id and p.guardian_id=(select auth.uid())));
create policy young_progress_read on public.young_progress for select to authenticated
  using (young_private.can_read_profile(profile_id));

create function public.young_create_profile(profile_nickname text)
returns public.young_profiles language plpgsql security definer set search_path = '' as $$
declare actor uuid := auth.uid(); result public.young_profiles;
begin
  if actor is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if not exists (select 1 from auth.users where id=actor and email_confirmed_at is not null) then
    raise exception 'Verified guardian account required' using errcode='42501';
  end if;
  if profile_nickname is null or char_length(btrim(profile_nickname)) not between 1 and 40 then
    raise exception 'Invalid nickname' using errcode='22023';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(actor::text,0));
  if (select count(*) from public.young_profiles where guardian_id=actor and not disabled)>=8 then
    raise exception 'Profile limit reached' using errcode='22023';
  end if;
  insert into public.young_profiles(guardian_id,nickname) values(actor,btrim(profile_nickname)) returning * into result;
  return result;
end;
$$;

create function public.young_save_progress(target_profile uuid, expected_revision bigint, progress_payload jsonb, share_with_teacher boolean default false)
returns public.young_progress language plpgsql security definer set search_path = '' as $$
declare actor uuid := auth.uid(); current_revision bigint; result public.young_progress;
begin
  if actor is null then raise exception 'Authentication required' using errcode='42501'; end if;
  perform 1 from public.young_profiles where id=target_profile and guardian_id=actor and not disabled for update;
  if not found then raise exception 'Profile unavailable' using errcode='42501'; end if;
  if expected_revision is null or expected_revision<0 or share_with_teacher is null
    or progress_payload is null or jsonb_typeof(progress_payload)<>'object'
    or progress_payload->'version' is distinct from '1'::jsonb
    or jsonb_typeof(progress_payload->'done') is distinct from 'array'
    or jsonb_typeof(progress_payload->'drafts') is distinct from 'object'
    or octet_length(progress_payload::text)>250000 then
    raise exception 'Invalid progress' using errcode='22023';
  end if;
  if jsonb_array_length(progress_payload->'done')>500
    or exists(select 1 from jsonb_array_elements(progress_payload->'done') x where jsonb_typeof(x)<>'string' or char_length(x#>>'{}')>100)
    or exists(select 1 from jsonb_each(progress_payload->'drafts') x where char_length(x.key)>120 or jsonb_typeof(x.value)<>'string' or char_length(x.value#>>'{}')>20000) then
    raise exception 'Invalid progress fields' using errcode='22023';
  end if;
  if exists(select 1 from jsonb_array_elements_text(progress_payload->'done') x where not exists(select 1 from young_private.lesson_ids c where c.lesson_id=x))
    or exists(select 1 from jsonb_object_keys(progress_payload->'drafts') x where not exists(select 1 from young_private.lesson_ids c where c.lesson_id=x)) then
    raise exception 'Unknown lesson' using errcode='22023';
  end if;
  select revision into current_revision from public.young_progress where profile_id=target_profile;
  if expected_revision<>coalesce(current_revision,0) then raise exception 'Revision conflict' using errcode='40001'; end if;
  insert into public.young_progress(profile_id,revision,payload,sharing)
    values(target_profile,expected_revision+1,jsonb_build_object('version',1,'done',progress_payload->'done','drafts',progress_payload->'drafts'),share_with_teacher)
    on conflict(profile_id) do update set revision=excluded.revision,payload=excluded.payload,sharing=excluded.sharing,updated_at=now()
    returning * into result;
  return result;
end;
$$;
revoke all on function public.young_create_profile(text), public.young_save_progress(uuid,bigint,jsonb,boolean) from public, anon;
grant execute on function public.young_create_profile(text), public.young_save_progress(uuid,bigint,jsonb,boolean) to authenticated;
