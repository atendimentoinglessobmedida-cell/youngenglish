-- Course payload is seeded separately from local private artifacts, never public Git.
create table young_private.premium_lessons (
  lesson_id text primary key references young_private.lesson_ids(lesson_id),
  position integer not null check(position>=0),
  content jsonb not null check(jsonb_typeof(content)='object' and content ? 'id' and jsonb_typeof(content->'id')='string' and content->>'id'=lesson_id),
  updated_at timestamptz not null default now()
);
revoke all on young_private.premium_lessons from public, anon, authenticated;
create function public.young_premium_content(target_profile uuid,selected_lesson text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare actor uuid := auth.uid(); result jsonb;
begin
  if actor is null or not exists(select 1 from auth.users where id=actor and email_confirmed_at is not null) then
    raise exception 'Verified account required' using errcode='42501';
  end if;
  perform 1 from public.young_profiles p join public.young_licenses l on l.profile_id=p.id
    where p.id=target_profile and p.guardian_id=actor and not p.disabled
      and l.status='active' and l.starts_at<=now() and l.expires_at>now();
  if not found then raise exception 'Premium unavailable' using errcode='42501'; end if;
  select coalesce(jsonb_agg(c.content order by c.position,c.lesson_id),'[]'::jsonb) into result
    from young_private.premium_lessons c where selected_lesson is null or c.lesson_id=selected_lesson;
  return result;
end;
$$;
revoke all on function public.young_premium_content(uuid,text) from public, anon;
grant execute on function public.young_premium_content(uuid,text) to authenticated;
