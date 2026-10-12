const assert=require('node:assert/strict'),test=require('node:test'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../public/sw.js'),'utf8');
function app({online=false,cached,quota=false,cacheControl=''}={}){
 const listeners=new Map(),deleted=[],written=[];
 const cache={match:async()=>cached,put:async(request)=>{if(quota)throw Error('quota');written.push(request.url)}};
 vm.runInNewContext(source,{URL,Response,fetch:async()=>{if(!online)throw Error('offline');return new Response('online',{headers:{'Cache-Control':cacheControl}})},caches:{open:async()=>cache,keys:async()=>['ism-young-shell-v3','ism-young-shell-v4','ism-young-shell-v5','ism-young-shell-v6','ism-young-shell-v7','other-app-cache'],delete:async key=>deleted.push(key)},self:{location:{origin:'https://example.test'},addEventListener:(name,fn)=>listeners.set(name,fn),clients:{claim:async()=>{}}}});
 return {deleted,written,fetch(mode='navigate',pathname='/missing',headers=new Headers()){let response;listeners.get('fetch')({request:{url:'https://example.test'+pathname,method:'GET',mode,headers},respondWith:value=>response=value});return response},activate(){let task;listeners.get('activate')({waitUntil:value=>task=value});return task}};
}
test('unvisited offline navigation explains how to recover',async()=>{const r=await app().fetch();assert.equal(r.status,503);assert.match(await r.text(),/ainda não está salva/)});
test('an uncached script never receives the home HTML',async()=>{const r=await app().fetch('cors');assert.equal(r.type,'error');assert.equal(await r.text(),'')});
test('visited pages remain available offline',async()=>{const r=await app({cached:new Response('saved lesson')}).fetch();assert.equal(await r.text(),'saved lesson')});
test('cache quota does not turn a successful request into an offline error',async()=>{const r=await app({online:true,quota:true}).fetch();assert.equal(await r.text(),'online')});
test('updates preserve the current shell and caches belonging to other apps',async()=>{const a=app();await a.activate();assert.deepEqual(a.deleted,['ism-young-shell-v3','ism-young-shell-v4','ism-young-shell-v5','ism-young-shell-v6'])});
test('API, account and authenticated requests bypass cached content',()=>{const a=app({cached:new Response('previous account')});for(const pathname of ['/api/young/progress','/account','/account.html'])assert.equal(a.fetch('cors',pathname),undefined);assert.equal(a.fetch('cors','/other',new Headers({Authorization:'Bearer fixture'})),undefined);assert.equal(a.written.length,0)});
test('private and no-store responses are never written to the offline cache',async()=>{for(const cacheControl of ['private, max-age=0','no-store']){const a=app({online:true,cacheControl});assert.equal((await a.fetch()).status,200);assert.equal(a.written.length,0)}});


