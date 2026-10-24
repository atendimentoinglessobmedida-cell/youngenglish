import {PGlite} from '@electric-sql/pglite';
import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {snapshotToCloud} from '../server/progress-codec.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const actors={a:'11111111-1111-4111-8111-111111111111',b:'22222222-2222-4222-8222-222222222222',teacher:'33333333-3333-4333-8333-333333333333',admin:'44444444-4444-4444-8444-444444444444',unverified:'55555555-5555-4555-8555-555555555555',limit:'66666666-6666-4666-8666-666666666666'};
let db,profileA,profileB,ids,paidIds;
const row=async(query,params=[]) => (await db.query(query,params)).rows[0];
async function asActor(actor,run,role='authenticated'){
 await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[actor??'']);await db.exec(`set role ${role}`);
 try{return await run();}finally{await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub','',false)");}
}
const rejected=(run,code)=>assert.rejects(run,error=>error.code===code);
const payload=()=>({version:1,done:[ids[0]],drafts:{[ids[0]]:'A fictional learner sentence.'}});
const save=(revision,sharing=false,value=payload())=>row('select * from public.young_save_progress($1,$2,$3::jsonb,$4)',[profileA.id,revision,JSON.stringify(value),sharing]);
before(async()=>{
 db=await PGlite.create();
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;
 create schema auth;create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz);
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;`);
 for(const[name,id]of Object.entries(actors))await db.query('insert into auth.users values($1,$2,$3)',[id,`${name}@example.test`,name==='unverified'?null:new Date()]);
 const folder=path.join(root,'supabase/migrations');
 for(const file of (await fs.readdir(folder)).filter(f=>f.endsWith('.sql')).sort())await db.exec(await fs.readFile(path.join(folder,file),'utf8'));
 ids=JSON.parse(await fs.readFile(path.join(root,'server/young-lesson-ids.json'),'utf8'));paidIds=ids.slice(-2);
 await db.query('insert into young_private.staff_permissions values($1,$2),($3,$4)',[actors.teacher,['read_young_progress'],actors.admin,['manage_young_licenses']]);
 for(const[index,id]of paidIds.entries())await db.query('insert into young_private.premium_lessons(lesson_id,position,content) values($1,$2,$3::jsonb)',[id,index,JSON.stringify({id,text:`PRIVATE_FIXTURE_${index}`})]);
 profileA=await asActor(actors.a,()=>row('select * from public.young_create_profile($1)',['Alex']));
 profileB=await asActor(actors.b,()=>row('select * from public.young_create_profile($1)',['Sam']));
});
after(async()=>{await db?.close();});

test('fixtures use a non-superuser role without RLS bypass',async()=>{
 await asActor(actors.a,async()=>{const role=await row('select rolsuper,rolbypassrls from pg_roles where rolname=current_user');assert.equal(role.rolsuper,false);assert.equal(role.rolbypassrls,false);});
});
test('anonymous, unverified and missing identities cannot create profiles or read private tables',async()=>{
 await asActor(null,async()=>{await rejected(()=>row('select * from public.young_create_profile($1)',['Blocked']), '42501');await rejected(()=>db.query('select * from public.young_profiles'),'42501');},'anon');
 await asActor(actors.unverified,()=>rejected(()=>row('select * from public.young_create_profile($1)',['Blocked']),'42501'));
 await asActor(null,()=>rejected(()=>row('select * from public.young_create_profile($1)',['Blocked']),'42501'));
});
test('RLS exposes only owned profiles and clients cannot change ownership or insert directly',async()=>{
 await asActor(actors.a,async()=>{const rows=(await db.query('select * from public.young_profiles')).rows;assert.deepEqual(rows.map(r=>r.id),[profileA.id]);await rejected(()=>db.query('update public.young_profiles set guardian_id=$1 where id=$2',[actors.b,profileA.id]),'42501');await rejected(()=>db.query('insert into public.young_profiles(guardian_id,nickname) values($1,$2)',[actors.a,'Bypass']),'42501');});
});
test('profile creation evaluates once and limits each guardian to eight active profiles',async()=>{
 await asActor(actors.limit,async()=>{for(let index=0;index<8;index++)await row('select * from public.young_create_profile($1)',[`Fictional ${index}`]);assert.equal(Number((await row('select count(*) as total from public.young_profiles')).total),8);await rejected(()=>row('select * from public.young_create_profile($1)',['Ninth']),'22023');});
});
test('progress writes require ownership, catalog IDs, strict JSON and a current revision',async()=>{
 await asActor(actors.b,()=>rejected(()=>save(0),'42501'));
 await asActor(actors.a,async()=>{
  await rejected(()=>save(0,false,{version:'1',done:[],drafts:{}}),'22023');
  await rejected(()=>save(0,false,{version:1,done:['unknown'],drafts:{}}),'22023');
  await rejected(()=>save(0,false,{version:1,done:[],drafts:{unknown:'text'}}),'22023');
  await rejected(()=>db.query('insert into public.young_progress values($1,1,$2,false,now())',[profileA.id,JSON.stringify(payload())]),'42501');
  const result=await save(0);assert.equal(result.revision,1);assert.equal(result.sharing,false);await rejected(()=>save(0),'40001');
 });
 await asActor(actors.b,async()=>assert.equal((await db.query('select * from public.young_progress')).rows.length,0));
});
test('teacher reads and feedback follow current consent, including revocation',async()=>{
 await asActor(actors.a,()=>rejected(()=>db.query('select * from public.young_teacher_progress()'),'42501'));
 await asActor(actors.teacher,async()=>{assert.equal((await db.query('select * from public.young_teacher_progress()')).rows.length,0);assert.equal((await db.query('select * from public.young_progress')).rows.length,0);});
 await asActor(actors.a,()=>save(1,true));
 await asActor(actors.teacher,async()=>{const list=(await db.query('select * from public.young_teacher_progress()')).rows;assert.equal(list.length,1);assert.equal(list[0].payload,null);const selected=await row('select * from public.young_teacher_progress($1)',[profileA.id]);assert.equal(selected.payload.drafts[ids[0]],'A fictional learner sentence.');const feedback=await row('select * from public.young_write_feedback($1,$2,$3)',[profileA.id,ids[0],'Clear fictional message.']);assert.equal(feedback.teacher_id,actors.teacher);});
 await asActor(actors.a,()=>save(2,false));
 await asActor(actors.teacher,async()=>{assert.equal((await db.query('select * from public.young_teacher_progress($1)',[profileA.id])).rows.length,0);assert.equal((await db.query('select * from public.young_feedback')).rows.length,0);await rejected(()=>row('select * from public.young_write_feedback($1,$2,$3)',[profileA.id,ids[0],'Blocked feedback.']),'42501');});
 await asActor(actors.a,async()=>assert.equal((await db.query('select * from public.young_feedback')).rows.length,1));
});
test('removal erases texts and feedback while preserving a revision marker against stale uploads',async()=>{
 await asActor(actors.b,()=>rejected(()=>row('select public.young_remove_progress($1,$2) as result',[profileA.id,3]),'42501'));
 await asActor(actors.a,async()=>{await rejected(()=>row('select public.young_remove_progress($1,$2)',[profileA.id,2]),'40001');const removed=await row('select public.young_remove_progress($1,$2) as result',[profileA.id,3]);assert.deepEqual(removed.result,{removed:true,revision:4});const empty=await row('select * from public.young_progress');assert.deepEqual(empty.payload,{version:1,done:[],drafts:{}});assert.equal(empty.sharing,false);assert.equal((await db.query('select * from public.young_feedback')).rows.length,0);await rejected(()=>save(3),'40001');await rejected(()=>save(0),'40001');assert.equal((await save(4)).revision,5);});
});
test('private course data and license writes are denied before administrative activation',async()=>{
 await asActor(actors.a,async()=>{await rejected(()=>db.query('select * from young_private.premium_lessons'),'42501');await rejected(()=>row('select public.young_premium_content($1)',[profileA.id]),'42501');await rejected(()=>row('select public.young_confirm_period($1,$2,$3,$4,$5)',[profileA.id,'monthly','payment_fixture_0001','operation_fixture_0001',5899]),'42501');await rejected(()=>db.query("insert into public.young_licenses values($1,'active','monthly',now(),now()+interval '30 days',now())",[profileA.id]),'42501');});
});
test('administrative periods are atomic, preserve prices and remaining time, and reject replay changes',async()=>{
 await asActor(actors.admin,async()=>{
  const confirm=(reference,operation,amount=5899)=>row('select public.young_confirm_period($1,$2,$3,$4,$5) as result',[profileA.id,'monthly',reference,operation,amount]);
  await rejected(()=>confirm('payment_fixture_0001','operation_fixture_0001',1),'22023');
  const first=(await confirm('payment_fixture_0001','operation_fixture_0001')).result;assert.equal(first.repeated,false);assert.equal(Date.parse(first.license.expiresAt)-Date.parse(first.license.startsAt),30*86400000);
  const repeated=(await confirm('payment_fixture_0001','operation_fixture_0001')).result;assert.equal(repeated.repeated,true);assert.deepEqual(repeated.license,first.license);
  await rejected(()=>confirm('payment_fixture_0002','operation_fixture_0001'),'40001');
  await rejected(()=>confirm('payment_fixture_0001','operation_fixture_0002'),'40001');
  const renewed=(await confirm('payment_fixture_0002','operation_fixture_0002')).result;assert.equal(Date.parse(renewed.license.expiresAt)-Date.parse(first.license.expiresAt),30*86400000);assert.equal(renewed.license.startsAt,first.license.startsAt);
 });
});
test('active private content is scoped to its guardian and rejects expired, future and suspended periods',async()=>{
 await asActor(actors.a,async()=>{const course=(await row('select public.young_premium_content($1) as result',[profileA.id])).result;assert.equal(course.length,2);assert.equal(course[0].text,'PRIVATE_FIXTURE_0');const one=(await row('select public.young_premium_content($1,$2) as result',[profileA.id,paidIds[1]])).result;assert.equal(one.length,1);});
 await asActor(actors.b,async()=>{await rejected(()=>row('select public.young_premium_content($1)',[profileA.id]),'42501');assert.equal((await db.query('select * from public.young_licenses')).rows.length,0);});
 const original=await row('select * from public.young_licenses where profile_id=$1',[profileA.id]);
 for(const[status,start,end]of [['suspended',original.starts_at,original.expires_at],['active',new Date(Date.now()-86400000),new Date(Date.now()-1000)],['active',new Date(Date.now()+86400000),new Date(Date.now()+2*86400000)]]){
  await db.query('update public.young_licenses set status=$1,starts_at=$2,expires_at=$3 where profile_id=$4',[status,start,end,profileA.id]);await asActor(actors.a,()=>rejected(()=>row('select public.young_premium_content($1)',[profileA.id]),'42501'));
 }
 await db.query('update public.young_licenses set status=$1,starts_at=$2,expires_at=$3 where profile_id=$4',[original.status,original.starts_at,original.expires_at,profileA.id]);
});
test('permissions cannot be self-assigned and suspended licenses cannot be renewed blindly',async()=>{
 await asActor(actors.a,async()=>{const permissions=(await row('select public.young_account_permissions() as result')).result;assert.deepEqual(permissions,{teacher:false,administrator:false});await rejected(()=>db.query('insert into young_private.staff_permissions values($1,$2)',[actors.a,['manage_young_licenses']]),'42501');});
 await db.query("update public.young_licenses set status='suspended' where profile_id=$1",[profileA.id]);
 await asActor(actors.admin,()=>rejected(()=>row('select public.young_confirm_period($1,$2,$3,$4,$5)',[profileA.id,'monthly','payment_fixture_0003','operation_fixture_0003',5899]),'40001'));
});
test('private content identity is required even for trusted data imports',async()=>{
 await assert.rejects(()=>db.query('update young_private.premium_lessons set content=$1::jsonb where lesson_id=$2',[JSON.stringify({text:'Missing id'}),paidIds[0]]),error=>error.code==='23514');
});

test('full study state survives SQL round trip and rejects forged fields without changing the stored revision',async()=>{
 const keys=JSON.parse(await fs.readFile(path.join(root,'server/young-activity-keys.json'),'utf8')),id=ids[0],video=keys.answer.find(x=>x.startsWith('video-'));
 const payload=snapshotToCloud({version:4,points:120,answers:{[id+':q0']:true,[video]:false,'project-0:0':true},drafts:{[id]:'A fictional sentence.',[video]:'Fictional video notes.','project-0':'A fictional project.'},done:[id],stars:{[id]:3},gameWins:[id+':memory',keys.game.at(-1)],themeAchievements:['explore:music'],missionMode:'create',age:'teens',resume:{id,step:5}});
 const profile=await asActor(actors.a,()=>row('select * from public.young_create_profile($1)',['Full-state fixture']));
 const write=(revision,value=payload)=>row('select * from public.young_save_progress($1,$2,$3::jsonb,$4)',[profile.id,revision,JSON.stringify(value),true]);
 await asActor(actors.b,()=>rejected(()=>write(0),'42501'));
 await asActor(actors.a,async()=>{
   const first=await write(0);assert.equal(first.revision,1);assert.deepEqual(first.payload,payload);
   const invalid=[{...payload,license:'active'},{...payload,study:{...payload.study,administrator:true}},{...payload,study:{...payload.study,points:-1}},{...payload,study:{...payload.study,points:'120'}},{...payload,study:{...payload.study,answers:{unknown:true}}},{...payload,study:{...payload.study,answers:{[id+':q0']:'yes'}}},{...payload,study:{...payload.study,stars:{[id]:4}}},{...payload,study:{...payload.study,gameWins:['unknown:memory']}},{...payload,study:{...payload.study,resume:{id,step:6}}},{...payload,study:{...payload.study,resume:{id,step:0,license:'active'}}},{...payload,study:{...payload.study,themeAchievements:['create:unknown']}},{...payload,drafts:{'project-99':'Unknown project'}},{...payload,drafts:{[id]:'x'.repeat(20001)}}];
   for(const value of invalid)await rejected(()=>write(1,value),'22023');
   await rejected(()=>write(0),'40001');assert.deepEqual((await row('select payload from public.young_progress where profile_id=$1',[profile.id])).payload,payload);
 });
 await asActor(actors.teacher,async()=>{const selected=await row('select * from public.young_teacher_progress($1)',[profile.id]);assert.deepEqual(selected.payload,payload);});
 await db.query('update auth.users set email_confirmed_at=null where id=$1',[actors.a]);
 try{await asActor(actors.a,()=>rejected(()=>write(1),'42501'));}finally{await db.query('update auth.users set email_confirmed_at=now() where id=$1',[actors.a]);}
 await asActor(actors.a,async()=>{const deleted=await row('select public.young_remove_progress($1,$2) as result',[profile.id,1]);assert.equal(deleted.result.revision,2);const tombstone=await row('select payload from public.young_progress where profile_id=$1',[profile.id]);assert.deepEqual(tombstone.payload,{version:1,done:[],drafts:{}});await rejected(()=>write(1),'40001');});
});
