import test from 'node:test';
import assert from 'node:assert/strict';
import {createYoungHandler} from '../server/young-http.mjs';
import {snapshotToCloud} from '../server/progress-codec.mjs';
const guardian='11111111-1111-4111-8111-111111111111',profile='22222222-2222-4222-8222-222222222222',other='33333333-3333-4333-8333-333333333333';
const origin='https://young.example.test',privateText='PRIVATE_CONTENT_FIXTURE';
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}});
function setup(options={}) {
  const calls=[];
  const fetcher=async(url,init)=>{
    calls.push({url:String(url),init});const path=url.pathname;
    if(init.headers.Authorization!=='Bearer valid')return json({message:'Invalid JWT'},401);
    if(path==='/auth/v1/user')return json({id:guardian,email:'guardian@example.test',email_confirmed_at:options.unverified?null:'2026-10-01T00:00:00Z'});
    if(path==='/rest/v1/young_profiles')return json([{id:profile,guardian_id:options.foreign?other:guardian,disabled:!!options.disabled,nickname:'Alex'}]);
    if(path==='/rest/v1/young_licenses')return json([{profile_id:profile,status:options.suspended?'suspended':'active',plan_id:'monthly',starts_at:'2026-10-01T00:00:00Z',expires_at:options.expired?'2026-10-02T00:00:00Z':'2026-11-01T00:00:00Z'}]);
    if(path==='/rest/v1/young_progress')return json([{revision:1,payload:{version:1,done:['lesson-01'],drafts:{}},sharing:false}]);
    if(path==='/rest/v1/rpc/young_save_progress')return options.conflict?json({code:'40001'},400):json({profile_id:profile,revision:1,sharing:JSON.parse(init.body).share_with_teacher});
    if(path==='/rest/v1/rpc/young_create_profile')return json({id:profile,nickname:JSON.parse(init.body).profile_nickname});
    if(path==='/rest/v1/rpc/young_confirm_period')return options.admin?json({license:{profileId:profile,status:'active'},repeated:false}):json({code:'42501'},403);
    if(path==='/rest/v1/rpc/young_teacher_progress'){
      if(!options.teacher)return json({code:'42501'},403);
      const input=JSON.parse(init.body),count=options.large?51:1;
      const rows=input.target_profile?[{profile_id:profile,nickname:'Alex',revision:1,payload:{version:1,done:['lesson-01'],drafts:{}}}]:Array.from({length:count},(_,index)=>({profile_id:`00000000-0000-4000-8000-${String(index+1).padStart(12,'0')}`,nickname:'Alex',revision:1,payload:null}));
      return json(options.sharing?rows.filter(row=>!input.after_profile||row.profile_id>input.after_profile):[]);
    }
    if(path==='/rest/v1/rpc/young_write_feedback')return options.teacher&&options.sharing?json({id:other,message:JSON.parse(init.body).feedback_message}):json({code:'42501'},403);
    if(path==='/rest/v1/rpc/young_remove_progress')return options.conflict?json({code:'40001'},400):json({removed:true,revision:JSON.parse(init.body).expected_revision+1});
    if(path==='/rest/v1/rpc/young_account_permissions')return json({teacher:!!options.teacher,administrator:!!options.admin});
    if(path==='/rest/v1/rpc/young_premium_content')return json([{id:'paid-01',text:privateText}]);
    throw new Error('Unexpected upstream request');
  };
  return {calls,handler:createYoungHandler({baseUrl:'https://fixture.supabase.co',publishableKey:'fixture-public-key',appOrigin:origin,lessonIds:new Set(['lesson-01']),fetcher,now:()=>Date.parse('2026-10-12T00:00:00Z')})};
}
const request=(action,{method='GET',token='valid',body,requestOrigin=origin}={})=>new Request(`${origin}/api/young/${action}?profile=${profile}`,{method,headers:{...(token?{Authorization:`Bearer ${token}`}:{ }),Origin:requestOrigin,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});

test('foreign guardian cannot read, save or erase another profile progress',async()=>{
  for(const method of ['GET','PUT','DELETE']){
    const {handler,calls}=setup({foreign:true});
    const response=await handler(request('progress',{method,body:method==='GET'?undefined:{confirmed:true,revision:1,sharing:false,payload:{version:1,done:[],drafts:{}}}}));
    assert.equal(response.status,403);
    assert.ok(!calls.some(c=>new URL(c.url).pathname.includes('young_save_progress')||new URL(c.url).pathname.includes('young_remove_progress')));
  }
});

test('profile creation forwards only nickname and ignores extra personal fields',async()=>{
  const {handler,calls}=setup();
  const response=await handler(request('profiles',{method:'POST',body:{nickname:' Fictional Owl ',fullName:'Synthetic name',birthDate:'2014-01-01',school:'Synthetic school',guardian_id:other}}));
  assert.equal(response.status,201);
  assert.deepEqual(JSON.parse(calls.at(-1).init.body),{profile_nickname:'Fictional Owl'});
});

test('unverified accounts cannot create profiles or erase progress',async()=>{
  for(const action of ['profiles','progress']){
    const {handler,calls}=setup({unverified:true});
    const response=await handler(request(action,{method:action==='profiles'?'POST':'DELETE',body:{nickname:'Owl',confirmed:true,revision:1}}));
    assert.equal(response.status,401);
    assert.equal(calls.length,1);
  }
});

test('anonymous, forged, unverified, foreign, disabled, expired and suspended callers never receive private lessons',async()=>{
  for(const [options,token,status] of [[{},null,401],[{},'forged',401],[{unverified:true},'valid',401],[{foreign:true},'valid',403],[{disabled:true},'valid',403],[{expired:true},'valid',403],[{suspended:true},'valid',403]]){
    const {handler}=setup(options),response=await handler(request('premium',{token}));assert.equal(response.status,status);assert.equal(response.headers.get('cache-control'),'private, no-store');assert.ok(!(await response.text()).includes(privateText));
  }
});
test('active owner receives private lessons only after remote identity and license verification',async()=>{
  const {handler,calls}=setup(),response=await handler(request('premium'));assert.equal(response.status,200);assert.equal((await response.json()).lessons[0].text,privateText);
  assert.equal(new URL(calls[0].url).pathname,'/auth/v1/user');assert.ok(calls.some(c=>new URL(c.url).pathname==='/rest/v1/young_licenses'));
  assert.ok(calls.every(c=>c.init.headers.Authorization==='Bearer valid'&&c.init.headers.apikey==='fixture-public-key'));
});
test('owner can inspect an expired period without receiving Premium content',async()=>{
  const {handler}=setup({expired:true,disabled:true});const response=await handler(request('license'));assert.equal(response.status,200);assert.equal((await response.json()).license.plan_id,'monthly');
  assert.equal((await setup({foreign:true}).handler(request('license'))).status,403);
});
test('profile owner is derived remotely; browser fields cannot choose a guardian or administrator',async()=>{
  const {handler,calls}=setup();const response=await handler(request('profiles',{method:'POST',body:{nickname:' Alex ',guardianId:other,verifiedByServer:true,permissions:['manage_young_licenses']}}));
  assert.equal(response.status,201);assert.deepEqual(JSON.parse(calls.at(-1).init.body),{profile_nickname:'Alex'});
});
test('account UI permissions come from the trusted database, not browser claims',async()=>{
  const normal=await (await setup().handler(request('session'))).json();assert.deepEqual(normal.permissions,{teacher:false,administrator:false});
  const teacher=await (await setup({teacher:true}).handler(request('session'))).json();assert.deepEqual(teacher.permissions,{teacher:true,administrator:false});
});
test('progress rejects unknown lesson IDs, foreign ownership and conflicting revisions',async()=>{
  const valid={revision:0,sharing:false,payload:{version:1,done:['lesson-01'],drafts:{'lesson-01':'A fictional sentence.'}}};
  assert.equal((await setup().handler(request('progress',{method:'PUT',body:{...valid,payload:{...valid.payload,done:['unknown']}}}))).status,400);
  assert.equal((await setup({foreign:true}).handler(request('progress',{method:'PUT',body:valid}))).status,403);
  assert.equal((await setup({conflict:true}).handler(request('progress',{method:'PUT',body:valid}))).status,409);
  const {handler,calls}=setup(),response=await handler(request('progress',{method:'PUT',body:valid}));assert.equal(response.status,200);const input=JSON.parse(calls.at(-1).init.body);assert.equal(input.target_profile,profile);assert.equal(input.share_with_teacher,false);
});

test('full study state is validated before forwarding and privilege fields cannot be added to the cloud payload',async()=>{
 const id='lesson-01',payload=snapshotToCloud({version:4,points:80,answers:{[id+':q0']:true},drafts:{'project-0':'Fictional project'},done:[id],stars:{[id]:2},gameWins:[id+':memory'],themeAchievements:['explore:music'],missionMode:'create',age:'teens',resume:{id,step:5}});
 const {handler,calls}=setup();const response=await handler(request('progress',{method:'PUT',body:{revision:0,sharing:false,payload}}));assert.equal(response.status,200);assert.deepEqual(JSON.parse(calls.at(-1).init.body).progress_payload,payload);
 assert.equal((await handler(request('progress',{method:'PUT',body:{revision:0,sharing:false,payload:{...payload,license:'active'}}}))).status,400);
});

test('JSON routes reject misleading MIME types and accept a valid charset parameter',async()=>{
 const {handler}=setup();const make=type=>new Request(origin+'/api/young/profiles',{method:'POST',headers:{Authorization:'Bearer valid',Origin:origin,'Content-Type':type},body:JSON.stringify({nickname:'Fictional nickname'})});
 assert.equal((await handler(make('application/jsonp'))).status,415);assert.equal((await handler(make('application/json; charset=utf-8'))).status,201);
});
test('foreign origin and unsupported methods are rejected before accessing the service',async()=>{
  const {handler,calls}=setup();assert.equal((await handler(request('profiles',{method:'POST',body:{nickname:'Alex'},requestOrigin:'https://foreign.example.test'}))).status,403);
  assert.equal((await handler(request('premium',{method:'DELETE'}))).status,405);assert.equal(calls.length,0);
  assert.equal((await handler(request('__proto__'))).status,404);assert.equal((await handler(request('constructor'))).status,404);assert.equal(calls.length,0);
});
test('claiming administration in the browser does not authorize a manual period',async()=>{
  const body={profileId:profile,planId:'monthly',amountCents:5899,requestId:'operation_12345',paymentReference:'payment_123456',confirmed:true,permissions:['manage_young_licenses']};
  const response=await setup().handler(request('period',{method:'POST',body}));assert.equal(response.status,403);
});
test('administrative confirmation preserves server prices and sends no browser identity fields to the transaction',async()=>{
  const body={profileId:profile,planId:'monthly',amountCents:5899,requestId:'operation_12345',paymentReference:'payment_123456',confirmed:true,operatorId:other};
  const {handler,calls}=setup({admin:true});assert.equal((await handler(request('period',{method:'POST',body:{...body,amountCents:1}}))).status,400);
  assert.equal((await handler(request('period',{method:'POST',body:{...body,planId:'__proto__',amountCents:undefined}}))).status,400);
  assert.equal((await handler(request('period',{method:'POST',body}))).status,200);
  assert.deepEqual(JSON.parse(calls.at(-1).init.body),{target_profile:profile,selected_plan:'monthly',payment_reference:'payment_123456',operation_id:'operation_12345',paid_amount_cents:5899});
});
test('teacher reads and feedback depend on trusted permission and current sharing',async()=>{
  assert.equal((await setup().handler(request('teacher'))).status,403);
  assert.deepEqual((await (await setup({teacher:true}).handler(request('teacher'))).json()).students,[]);
  const input={profileId:profile,lessonId:'lesson-01',message:' Clear message. '};
  assert.equal((await setup({teacher:true}).handler(request('feedback',{method:'POST',body:input}))).status,403);
  assert.equal((await setup({teacher:true,sharing:true}).handler(request('feedback',{method:'POST',body:input}))).status,201);
});
test('teacher listing is paginated and drafts are requested only for a selected profile',async()=>{
  const {handler,calls}=setup({teacher:true,sharing:true,large:true});
  const response=await handler(new Request(`${origin}/api/young/teacher`,{headers:{Authorization:'Bearer valid',Origin:origin}}));
  const data=await response.json();assert.equal(data.students.length,50);assert.equal(data.nextCursor,'00000000-0000-4000-8000-000000000050');assert.ok(data.students.every(row=>row.payload===null));
  assert.deepEqual(JSON.parse(calls.at(-1).init.body),{target_profile:null,after_profile:null});
  const next=await (await handler(new Request(`${origin}/api/young/teacher?after=${data.nextCursor}`,{headers:{Authorization:'Bearer valid',Origin:origin}}))).json();assert.equal(next.students.length,1);assert.equal(next.nextCursor,null);
  const selected=await (await handler(request('teacher'))).json();assert.equal(selected.students.length,1);assert.ok(selected.students[0].payload);
});
test('removing cloud progress requires confirmation, ownership and a current revision, including disabled profiles',async()=>{
  const input={confirmed:true,revision:1};
  assert.equal((await setup().handler(request('progress',{method:'DELETE',body:{...input,confirmed:false}}))).status,400);
  assert.equal((await setup({foreign:true}).handler(request('progress',{method:'DELETE',body:input}))).status,403);
  assert.equal((await setup({conflict:true}).handler(request('progress',{method:'DELETE',body:input}))).status,409);
  const response=await setup({disabled:true}).handler(request('progress',{method:'DELETE',body:input}));assert.equal(response.status,200);assert.deepEqual(await response.json(),{removed:true,revision:2});
});
