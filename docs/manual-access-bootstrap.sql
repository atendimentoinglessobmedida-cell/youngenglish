-- Execução exclusiva do operador no Supabase Young, após entrar pelo link pessoal.
-- Não cria conta, não confirma e-mail por SQL e não libera licença de aluno.
do $$
declare target_id uuid;
begin
 select id into strict target_id from auth.users
 where lower(email)='atendimento.inglessobmedida@gmail.com' and email_confirmed_at is not null;
 insert into young_private.staff_permissions(user_id,permissions)
 values(target_id,array['read_young_progress','manage_young_licenses'])
 on conflict(user_id) do update set permissions=(select array_agg(distinct permission) from unnest(young_private.staff_permissions.permissions || excluded.permissions) as permission);
end $$;
