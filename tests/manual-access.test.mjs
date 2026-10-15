import test from 'node:test';
import assert from 'node:assert/strict';
import {createManualAccess} from '../supabase/functions/young-manual-access/handler.mjs';
const root='https://youngenglish.vercel.app',base='https://pttmctaxklaotdvnmjqc.supabase.co';
const secret='fixture.server.only',email='guardian@example.test';
const req=(token='valid',body={email,confirmed:true},headers={})=>new Request(base+'/functions/v1/young-manual-access',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json',Origin:root,...headers},body:JSON.stringify(body)});
function setup(options={}){const calls=[];const handler=createManualAccess({serviceKey:secret,publishableKey:'fixture-public',operatorKeys:['sb_secret_fixture_operator'],fetcher:async(url,init)=>{calls.push({url,init});if(url.endsWith('/user'))return Response.json({id:'fixture-admin',email_confirmed_at:options.unverified?null:'2026-10-15'}, {status:options.invalid?401:200});if(url.includes('young_account_permissions'))return Response.json({administrator:!options.denied});return Response.json({action_link:options.malformed?'https://other.example.test/':base+'/auth/v1/verify?token=fixture-single-use&type=magiclink&redirect_to='+encodeURIComponent(root+'/index.html')});}});return {handler,calls};}
test('anonymous, forged, unverified, foreign-origin and ordinary accounts cannot mint links',async()=>{
 for(const [options,request,status]of [[{},new Request(base,{method:'POST'}),401],[{invalid:true},req(),401],[{unverified:true},req(),401],[{denied:true},req(),403],[{},req('valid',{email,confirmed:true},{Origin:'https://foreign.example.test'}),403]]){const {handler,calls}=setup(options);assert.equal((await handler(request)).status,status);assert(!calls.some(x=>x.url.includes('generate_link')));}
});
test('verified administrator generates one fixed-destination link without sending mail or granting a period',async()=>{
 const {handler,calls}=setup();const response=await handler(req()),data=await response.json();assert.equal(response.status,200);assert.match(response.headers.get('cache-control'),/no-store/);assert.deepEqual(Object.keys(data).sort(),['email','link','message']);assert(!JSON.stringify(data).includes(secret));assert.equal(calls.length,3);const sent=JSON.parse(calls[2].init.body);assert.equal(sent.redirect_to,root+'/index.html');assert.equal(sent.type,'magiclink');assert.equal(sent.email,email);assert(!calls.some(x=>/invite|otp|period|license/.test(x.url)));
});
test('trusted project operator can bootstrap without an email-dependent user session',async()=>{const {handler,calls}=setup();assert.equal((await handler(req(secret))).status,200);assert.equal(calls.length,1);});
test('unconfirmed recipients, injected redirects, oversized input and malformed provider links fail safely',async()=>{
 for(const input of [{email,confirmed:false},{email,confirmed:true,redirect_to:'https://other.example.test'},{email:'bad',confirmed:true},{email:'a'.repeat(1100),confirmed:true}]){const {handler,calls}=setup();assert([400,413].includes((await handler(req('valid',input))).status));assert(!calls.some(x=>x.url.includes('generate_link')));}
 const {handler}=setup({malformed:true});const r=await handler(req());assert.equal(r.status,503);assert(!JSON.stringify(await r.json()).includes('other.example'));
});
test('per-instance issuance limit caps authenticated operator attempts',async()=>{const {handler,calls}=setup();for(let i=0;i<10;i++)assert.equal((await handler(req())).status,200);assert.equal((await handler(req())).status,429);assert.equal(calls.filter(x=>x.url.includes('generate_link')).length,10);});

test('dashboard secret-key bootstrap requires an exact injected project secret',async()=>{
 const {handler,calls}=setup();const headers={'Content-Type':'application/json',apikey:'sb_secret_fixture_operator'};const input=()=>JSON.stringify({email,confirmed:true});
 assert.equal((await handler(new Request(base,{method:'POST',headers,body:input()}))).status,200);assert.equal(calls.length,1);
 for(const key of ['sb_secret_forged','sb_publishable_fixture']){const {handler,calls}=setup();assert.equal((await handler(new Request(base,{method:'POST',headers:{...headers,apikey:key},body:input()}))).status,401);assert.equal(calls.length,0);}
});
