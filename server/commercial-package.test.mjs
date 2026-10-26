import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createGateway} from './content-gateway.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),output=path.join(root,'commercial-build');
const config=JSON.parse(fs.readFileSync(path.join(root,'server/commercial.config.json'),'utf8'));
const publicRoot=path.join(output,'public'),privateRoot=path.join(output,'private');
test('commercial package publishes login and marketing, with all lesson code outside public',()=>{
 const files=[];function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else files.push(p);}}walk(publicRoot);
 assert.ok(fs.existsSync(path.join(publicRoot,'login.html')));assert.ok(fs.existsSync(path.join(publicRoot,config.marketing)));assert.ok(!fs.existsSync(path.join(publicRoot,'index.html')));assert.ok(fs.existsSync(path.join(privateRoot,'index.html')));
 const publicJS=files.filter(f=>f.endsWith('.js'));assert.deepEqual(publicJS.map(f=>path.basename(f)),['commercial-login.js']);assert.ok(!fs.existsSync(path.join(privateRoot,'sw.js')));
 const original=path.join(root,config.source,'index.html');assert.deepEqual(fs.readFileSync(path.join(privateRoot,'index.html')),fs.readFileSync(original));
 if(config.app==='young'){assert.ok(!fs.existsSync(path.join(publicRoot,'premium-content.js')));assert.deepEqual(fs.readFileSync(path.join(privateRoot,'premium-content.js')),fs.readFileSync(path.join(root,'public/premium-content.js')));}
 assert.equal(JSON.parse(fs.readFileSync(path.join(output,'manifest.json'))).commercialEnabled,false);
});
test('real packaged lessons require credentials and current app license on every response',async()=>{
 const now=Date.now(),sessions=new Map();let active=true;
 const provider={async verifyCredentials({email,code}){return email==='guardian@example.test'&&code==='FIXTURE-ONLY'?{subject:'fixture'}:null;},async getLicense(){return {subject:'fixture',app:config.app,status:active?'ACTIVE':'SUSPENDED',startsAt:new Date(now-1000).toISOString(),expiresAt:new Date(now+3600000).toISOString()};},async createSession(s){sessions.set(s.id,s);},async getSession({id}){return sessions.get(id)},async revokeSession({id}){sessions.delete(id)}};
 const handler=createGateway({app:config.app,origin:'https://fixture.test',publicRoot,privateRoot,provider,secret:'only-for-automated-tests-'.repeat(3),enabled:true});
 const file=config.app==='young'?'/premium-content.js':'/index.html';assert.ok([303,401].includes((await handler(new Request('https://fixture.test'+file))).status));
 const login=await handler(new Request('https://fixture.test/api/session',{method:'POST',headers:{Origin:'https://fixture.test','Content-Type':'application/json'},body:JSON.stringify({email:'guardian@example.test',code:'FIXTURE-ONLY'})}));assert.equal(login.status,200);const cookie=login.headers.get('set-cookie').split(';')[0];
 const granted=await handler(new Request('https://fixture.test'+file,{headers:{Cookie:cookie}}));assert.equal(granted.status,200);assert.deepEqual(Buffer.from(await granted.arrayBuffer()),fs.readFileSync(path.join(privateRoot,file.slice(1))));assert.match(granted.headers.get('cache-control'),/no-store/);
 active=false;assert.equal((await handler(new Request('https://fixture.test'+file,{headers:{Cookie:cookie}}))).status,403);
});
