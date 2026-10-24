-- Existing private-content RPC: preserve verified identity and profile ownership.
create or replace function public.young_premium_content(target_profile uuid,selected_lesson text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare actor uuid := auth.uid(); result jsonb;
begin
  if actor is null or not exists(select 1 from auth.users where id=actor and email_confirmed_at is not null) then
    raise exception 'Verified account required' using errcode='42501';
  end if;
  if not exists(
    select 1 from public.young_profiles p
    where p.id=target_profile and p.guardian_id=actor and not p.disabled
      and (young_private.has_permission('manage_young_licenses') or exists(
        select 1 from public.young_licenses l where l.profile_id=p.id and l.status='active' and l.starts_at<=now() and l.expires_at>now()
      ))
  ) then raise exception 'Premium unavailable' using errcode='42501'; end if;
  select coalesce(jsonb_agg(c.content order by c.position,c.lesson_id),'[]'::jsonb) into result
    from young_private.premium_lessons c where selected_lesson is null or c.lesson_id=selected_lesson;
  return result;
end;
$$;
revoke all on function public.young_premium_content(uuid,text) from public,anon;
grant execute on function public.young_premium_content(uuid,text) to authenticated;
