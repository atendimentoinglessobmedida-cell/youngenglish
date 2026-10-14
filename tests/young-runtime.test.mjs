import test from 'node:test';
import assert from 'node:assert/strict';
import {createYoungRuntime} from '../server/young-runtime.mjs';
const ref='abcdefghijklmnopqrst',origin='https://young.example.test';
const env={YOUNG_SUPABASE_PROJECT_REF:ref,YOUNG_SUPABASE_URL:`https://${ref}.supabase.co`,YOUNG_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_fixturepublickey123456789',YOUNG_APP_ORIGIN:origin};
const request=(action='session',headers={})=>new Request(`${origin}/api/young?action=${action}`,{headers});
test('missing configuration fails closed without contacting another backend',async()=>{
  const handler=createYoungRuntime({env:{},lessonIds:new Set(),fetcher:()=>{throw Error('Unexpected network');}});
  const response=await handler(request());assert.equal(response.status,503);assert.match(response.headers.get('cache-control'),/no-store/);assert.deepEqual(Object.keys(await response.json()),['error']);
});
test('Business project and service-role keys are rejected before network',async()=>{
  for(const overrides of [{YOUNG_SUPABASE_PROJECT_REF:'bfuoykappwybuxdlrbmo',YOUNG_SUPABASE_URL:'https://bfuoykappwybuxdlrbmo.supabase.co'},{YOUNG_SUPABASE_PUBLISHABLE_KEY:'sb_secret_fixture'},{YOUNG_SUPABASE_URL:'https://another.supabase.co'}]){
    const handler=createYoungRuntime({env:{...env,...overrides},lessonIds:new Set(),fetcher:()=>{throw Error('Unexpected network');}});assert.equal((await handler(request())).status,503);
  }
});
test('rewritten session verifies the caller and uses the dedicated RLS backend',async()=>{
  const calls=[];const fetcher=async(url,init)=>{calls.push({url,init});return new Response(JSON.stringify(url.pathname==='/auth/v1/user'?{id:'11111111-1111-4111-8111-111111111111',email:'fixture@example.test',email_confirmed_at:'2026-10-14T00:00:00Z'}:{teacher:false,administrator:false}),{status:200});};
  const handler=createYoungRuntime({env,lessonIds:new Set(),fetcher});const response=await handler(request('session',{Authorization:'Bearer fixture',Origin:origin}));assert.equal(response.status,200);assert.equal((await response.json()).permissions.administrator,false);assert.equal(calls.length,2);assert.ok(calls.every(x=>x.url.hostname===`${ref}.supabase.co`&&x.init.headers.Authorization==='Bearer fixture'));
});
test('rewritten requests retain origin and authentication protections',async()=>{
  const handler=createYoungRuntime({env,lessonIds:new Set(),fetcher:()=>{throw Error('Unexpected network');}});
  assert.equal((await handler(request('session'))).status,401);
  assert.equal((await handler(request('session',{Origin:'https://other.example.test',Authorization:'Bearer fixture'}))).status,403);
  assert.equal((await handler(request('unknown'))).status,404);
});
