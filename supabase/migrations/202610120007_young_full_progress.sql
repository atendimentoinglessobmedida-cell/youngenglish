-- Local preparation only. Apply only to the dedicated Young project after review.
create function young_private.validate_full_progress(value jsonb)
returns jsonb language plpgsql stable security invoker set search_path='' as $$
declare study jsonb; entry record; item jsonb; resume jsonb;
begin
  if value is null or jsonb_typeof(value)<>'object' or octet_length(value::text)>250000 then raise exception 'Invalid progress' using errcode='22023'; end if;
  if jsonb_typeof(value->'done') is distinct from 'array' or jsonb_typeof(value->'drafts') is distinct from 'object' then raise exception 'Invalid fields' using errcode='22023'; end if;
  if value->'version' not in ('1'::jsonb,'2'::jsonb) or value->'version' is null then raise exception 'Invalid version' using errcode='22023'; end if;
  if jsonb_array_length(value->'done')>500 then raise exception 'Too many lessons' using errcode='22023'; end if;
  for item in select * from jsonb_array_elements(value->'done') loop
    if jsonb_typeof(item)<>'string' or not exists(select 1 from young_private.lesson_ids where lesson_id=item#>>'{}') then raise exception 'Unknown lesson' using errcode='22023'; end if;
  end loop;
  for entry in select * from jsonb_each(value->'drafts') loop
    if jsonb_typeof(entry.value)<>'string' or char_length(entry.value#>>'{}')>20000 then raise exception 'Invalid writing' using errcode='22023'; end if;
    if value->'version'='1'::jsonb then
      if not exists(select 1 from young_private.lesson_ids where lesson_id=entry.key) then raise exception 'Unknown lesson' using errcode='22023'; end if;
    elsif not exists(select 1 from young_private.activity_keys where kind='draft' and activity_key=entry.key) then raise exception 'Unknown writing activity' using errcode='22023'; end if;
  end loop;
  if value->'version'='1'::jsonb then return jsonb_build_object('version',1,'done',value->'done','drafts',value->'drafts'); end if;
  if (select count(*) from jsonb_object_keys(value))<>4 or exists(select 1 from jsonb_object_keys(value) k where k not in ('version','done','drafts','study')) then raise exception 'Unexpected progress field' using errcode='22023'; end if;
  study:=value->'study';
  if jsonb_typeof(study) is distinct from 'object' then raise exception 'Invalid study state' using errcode='22023'; end if;
  if (select count(*) from jsonb_object_keys(study))<>8 or exists(select 1 from jsonb_object_keys(study) k where k not in ('points','answers','stars','gameWins','themeAchievements','missionMode','age','resume')) then raise exception 'Unexpected study field' using errcode='22023'; end if;
  if jsonb_typeof(study->'points') is distinct from 'number' then raise exception 'Invalid points' using errcode='22023'; end if;
  if (study->>'points')::numeric<0 or (study->>'points')::numeric>=1000000 then raise exception 'Invalid points' using errcode='22023'; end if;
  if jsonb_typeof(study->'missionMode') is distinct from 'string' or study->>'missionMode' not in ('explore','practice','create') or jsonb_typeof(study->'age') is distinct from 'string' or study->>'age' not in ('kids','teens') then raise exception 'Invalid study preference' using errcode='22023'; end if;
  if jsonb_typeof(study->'answers') is distinct from 'object' or jsonb_typeof(study->'stars') is distinct from 'object' or jsonb_typeof(study->'gameWins') is distinct from 'array' or jsonb_typeof(study->'themeAchievements') is distinct from 'array' then raise exception 'Invalid achievement fields' using errcode='22023'; end if;
  if (select count(*) from jsonb_object_keys(study->'answers'))>4000 or (select count(*) from jsonb_object_keys(value->'drafts'))>4000 or jsonb_array_length(study->'gameWins')>3000 or jsonb_array_length(study->'themeAchievements')>18 then raise exception 'Too many activities' using errcode='22023'; end if;
  for entry in select * from jsonb_each(study->'answers') loop
    if jsonb_typeof(entry.value)<>'boolean' or not exists(select 1 from young_private.activity_keys where kind='answer' and activity_key=entry.key) then raise exception 'Unknown answer' using errcode='22023'; end if;
  end loop;
  for entry in select * from jsonb_each(study->'stars') loop
    if jsonb_typeof(entry.value)<>'number' then raise exception 'Invalid stars' using errcode='22023'; end if;
    if entry.value not in ('1'::jsonb,'2'::jsonb,'3'::jsonb) or not exists(select 1 from young_private.lesson_ids where lesson_id=entry.key) then raise exception 'Invalid stars' using errcode='22023'; end if;
  end loop;
  for item in select * from jsonb_array_elements(study->'gameWins') loop
    if jsonb_typeof(item)<>'string' or not exists(select 1 from young_private.activity_keys where kind='game' and activity_key=item#>>'{}') then raise exception 'Unknown game' using errcode='22023'; end if;
  end loop;
  for item in select * from jsonb_array_elements(study->'themeAchievements') loop
    if jsonb_typeof(item)<>'string' or not exists(select 1 from young_private.activity_keys where kind='achievement' and activity_key=item#>>'{}') then raise exception 'Unknown achievement' using errcode='22023'; end if;
  end loop;
  resume:=study->'resume';
  if resume<>'null'::jsonb then
    if jsonb_typeof(resume)<>'object' then raise exception 'Invalid resume' using errcode='22023'; end if;
    if (select count(*) from jsonb_object_keys(resume))<>2 or jsonb_typeof(resume->'id') is distinct from 'string' or not exists(select 1 from young_private.lesson_ids where lesson_id=resume->>'id') or resume->'step' not in ('0'::jsonb,'1'::jsonb,'2'::jsonb,'3'::jsonb,'4'::jsonb,'5'::jsonb) or resume->'step' is null then raise exception 'Invalid resume' using errcode='22023'; end if;
  end if;
  return value;
end;
$$;
revoke all on function young_private.validate_full_progress(jsonb) from public,anon,authenticated;

create or replace function public.young_save_progress(target_profile uuid, expected_revision bigint, progress_payload jsonb, share_with_teacher boolean default false)
returns public.young_progress language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); current_revision bigint; result public.young_progress; clean jsonb;
begin
  if actor is null or not exists(select 1 from auth.users where id=actor and email_confirmed_at is not null) then raise exception 'Verified account required' using errcode='42501'; end if;
  perform 1 from public.young_profiles where id=target_profile and guardian_id=actor and not disabled for update;
  if not found then raise exception 'Profile unavailable' using errcode='42501'; end if;
  if expected_revision is null or expected_revision<0 or expected_revision>9007199254740990 or share_with_teacher is null then raise exception 'Invalid revision' using errcode='22023'; end if;
  clean:=young_private.validate_full_progress(progress_payload);
  select revision into current_revision from public.young_progress where profile_id=target_profile;
  if expected_revision<>coalesce(current_revision,0) then raise exception 'Revision conflict' using errcode='40001'; end if;
  insert into public.young_progress(profile_id,revision,payload,sharing) values(target_profile,expected_revision+1,clean,share_with_teacher)
    on conflict(profile_id) do update set revision=excluded.revision,payload=excluded.payload,sharing=excluded.sharing,updated_at=now() returning * into result;
  return result;
end;
$$;
revoke all on function public.young_save_progress(uuid,bigint,jsonb,boolean) from public,anon;
grant execute on function public.young_save_progress(uuid,bigint,jsonb,boolean) to authenticated;
