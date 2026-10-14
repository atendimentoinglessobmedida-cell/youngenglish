-- Administrative confirmation only. This function never charges a payment method.
create table young_private.period_operations (
  request_id text primary key,
  payment_reference text not null unique,
  profile_id uuid not null references public.young_profiles(id) on delete cascade,
  operator_id uuid references auth.users(id) on delete set null,
  plan_id text not null,
  amount_cents integer not null,
  license_result jsonb not null,
  created_at timestamptz not null default now()
);
revoke all on young_private.period_operations from public, anon, authenticated;

create function public.young_confirm_period(target_profile uuid, selected_plan text, payment_reference text, operation_id text, paid_amount_cents integer)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare actor uuid := auth.uid(); days integer; expected_amount integer; previous public.young_licenses;
  prior record; saved public.young_licenses; result jsonb; clock_now timestamptz := now(); base_time timestamptz; start_time timestamptz;
begin
  if actor is null or not young_private.has_permission('manage_young_licenses') then
    raise exception 'Administration permission required' using errcode='42501';
  end if;
  case selected_plan
    when 'monthly' then days:=30; expected_amount:=5899;
    when 'semiannual' then days:=180; expected_amount:=32999;
    when 'annual' then days:=365; expected_amount:=58999;
    else raise exception 'Unknown plan' using errcode='22023';
  end case;
  if paid_amount_cents is distinct from expected_amount or operation_id is null or operation_id !~ '^[a-zA-Z0-9_-]{12,100}$'
    or payment_reference is null or payment_reference !~ '^[a-zA-Z0-9_-]{12,100}$' then
    raise exception 'Invalid confirmation' using errcode='22023';
  end if;
  perform 1 from public.young_profiles where id=target_profile and not disabled for update;
  if not found then raise exception 'Profile unavailable' using errcode='42501'; end if;
  select * into prior from young_private.period_operations where request_id=operation_id;
  if found then
    if prior.profile_id<>target_profile or prior.payment_reference<>young_confirm_period.payment_reference
      or prior.plan_id<>selected_plan or prior.amount_cents<>paid_amount_cents then
      raise exception 'Operation already used with different data' using errcode='40001';
    end if;
    return jsonb_build_object('license',prior.license_result,'repeated',true);
  end if;
  if exists(select 1 from young_private.period_operations op where op.payment_reference=young_confirm_period.payment_reference) then
    raise exception 'Payment already applied' using errcode='40001';
  end if;
  select * into previous from public.young_licenses where profile_id=target_profile;
  if found and previous.status='suspended' then raise exception 'Resolve suspension before renewing' using errcode='40001'; end if;
  base_time:=case when previous.status='active' then greatest(clock_now,previous.expires_at) else clock_now end;
  start_time:=case when previous.status='active' and previous.expires_at>clock_now then previous.starts_at else clock_now end;
  insert into public.young_licenses(profile_id,status,plan_id,starts_at,expires_at)
    values(target_profile,'active',selected_plan,start_time,base_time+days*interval '24 hours')
    on conflict(profile_id) do update set status=excluded.status,plan_id=excluded.plan_id,starts_at=excluded.starts_at,expires_at=excluded.expires_at,updated_at=clock_now
    returning * into saved;
  result:=jsonb_build_object('profileId',saved.profile_id,'status',saved.status,'planId',saved.plan_id,'startsAt',saved.starts_at,'expiresAt',saved.expires_at);
  insert into young_private.period_operations(request_id,payment_reference,profile_id,operator_id,plan_id,amount_cents,license_result)
    values(operation_id,young_confirm_period.payment_reference,target_profile,actor,selected_plan,paid_amount_cents,result);
  return jsonb_build_object('license',result,'repeated',false);
exception when unique_violation then
  -- PostgreSQL rolls back the license write with the failed operation insert.
  raise exception 'Confirmation already used' using errcode='40001';
end;
$$;
revoke all on function public.young_confirm_period(uuid,text,text,text,integer) from public, anon;
grant execute on function public.young_confirm_period(uuid,text,text,text,integer) to authenticated;
