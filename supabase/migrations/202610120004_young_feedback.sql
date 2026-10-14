create table public.young_feedback (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.young_profiles(id) on delete cascade,
  lesson_id text not null references young_private.lesson_ids(lesson_id),
  teacher_id uuid references auth.users(id) on delete set null,
  message text not null check(char_length(btrim(message)) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index young_feedback_profile_created_idx on public.young_feedback(profile_id,created_at desc);
alter table public.young_feedback enable row level security;
revoke all on public.young_feedback from public, anon, authenticated;
grant select on public.young_feedback to authenticated;
create policy young_feedback_read on public.young_feedback for select to authenticated
  using(young_private.can_read_profile(profile_id));
create function public.young_account_permissions()
returns jsonb language sql stable set search_path = '' as $$
  select jsonb_build_object('teacher',young_private.has_permission('read_young_progress'),'administrator',young_private.has_permission('manage_young_licenses'));
$$;
revoke all on function public.young_account_permissions() from public, anon;
grant execute on function public.young_account_permissions() to authenticated;

create function public.young_teacher_progress(target_profile uuid default null,after_profile uuid default null)
returns table(profile_id uuid,nickname text,revision bigint,payload jsonb,updated_at timestamptz)
language plpgsql security definer set search_path = '' as $$
begin
  if not young_private.has_permission('read_young_progress') then raise exception 'Teacher permission required' using errcode='42501'; end if;
  return query select p.id,p.nickname,r.revision,case when target_profile is not null then r.payload else null::jsonb end,r.updated_at
    from public.young_profiles p join public.young_progress r on r.profile_id=p.id
    where not p.disabled and r.sharing and (target_profile is null or p.id=target_profile)
      and (after_profile is null or p.id>after_profile) order by p.id limit 51;
end;
$$;
create function public.young_write_feedback(target_profile uuid,target_lesson text,feedback_message text)
returns public.young_feedback language plpgsql security definer set search_path = '' as $$
declare result public.young_feedback;
begin
  if not young_private.has_permission('read_young_progress') then raise exception 'Teacher permission required' using errcode='42501'; end if;
  perform 1 from public.young_profiles where id=target_profile and not disabled for update;
  if not found then raise exception 'Profile unavailable' using errcode='42501'; end if;
  perform 1 from public.young_progress where profile_id=target_profile and sharing;
  if not found then raise exception 'Sharing is not authorized' using errcode='42501'; end if;
  if feedback_message is null or char_length(btrim(feedback_message)) not between 1 and 2000
    or not exists(select 1 from young_private.lesson_ids where lesson_id=target_lesson) then
    raise exception 'Invalid feedback' using errcode='22023';
  end if;
  insert into public.young_feedback(profile_id,lesson_id,teacher_id,message)
    values(target_profile,target_lesson,auth.uid(),btrim(feedback_message)) returning * into result;
  return result;
end;
$$;
create function public.young_remove_progress(target_profile uuid,expected_revision bigint)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare actor uuid := auth.uid(); current_revision bigint;
begin
  if actor is null then raise exception 'Authentication required' using errcode='42501'; end if;
  perform 1 from public.young_profiles where id=target_profile and guardian_id=actor for update;
  if not found then raise exception 'Profile unavailable' using errcode='42501'; end if;
  select revision into current_revision from public.young_progress where profile_id=target_profile;
  if expected_revision is null or expected_revision<0 then raise exception 'Invalid revision' using errcode='22023'; end if;
  if expected_revision<>coalesce(current_revision,0) then raise exception 'Revision conflict' using errcode='40001'; end if;
  delete from public.young_feedback where profile_id=target_profile;
  -- Keep only an empty revision marker so a stale device cannot recreate old data.
  insert into public.young_progress(profile_id,revision,payload,sharing)
    values(target_profile,expected_revision+1,'{"version":1,"done":[],"drafts":{}}'::jsonb,false)
    on conflict(profile_id) do update set revision=excluded.revision,payload=excluded.payload,sharing=false,updated_at=now();
  return jsonb_build_object('removed',true,'revision',expected_revision+1);
end;
$$;
revoke all on function public.young_teacher_progress(uuid,uuid), public.young_write_feedback(uuid,text,text), public.young_remove_progress(uuid,bigint) from public, anon;
grant execute on function public.young_teacher_progress(uuid,uuid), public.young_write_feedback(uuid,text,text), public.young_remove_progress(uuid,bigint) to authenticated;
