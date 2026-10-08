const assert=require('node:assert/strict'),test=require('node:test'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../public/sw.js'),'utf8');
function app({online=false,cached,quota=false}={}){
 const listeners=new Map(),deleted=[];
 const cache={match:async()=>cached,put:async()=>{if(quota)throw Error('quota')}};
 vm.runInNewContext(source,{URL,Response,fetch:async()=>{if(!online)throw Error('offline');return new Response('online')},caches:{open:async()=>cache,keys:async()=>['ism-young-shell-v3','ism-young-shell-v4','ism-young-shell-v5','other-app-cache'],delete:async key=>deleted.push(key)},self:{location:{origin:'https://example.test'},addEventListener:(name,fn)=>listeners.set(name,fn),clients:{claim:async()=>{}}}});
 return {deleted,fetch(mode='navigate'){let response;listeners.get('fetch')({request:{url:'https://example.test/missing',method:'GET',mode},respondWith:value=>response=value});return response},activate(){let task;listeners.get('activate')({waitUntil:value=>task=value});return task}};
}
test('unvisited offline navigation explains how to recover',async()=>{const r=await app().fetch();assert.equal(r.status,503);assert.match(await r.text(),/ainda não está salva/)});
test('an uncached script never receives the home HTML',async()=>{const r=await app().fetch('cors');assert.equal(r.type,'error');assert.equal(await r.text(),'')});
test('visited pages remain available offline',async()=>{const r=await app({cached:new Response('saved lesson')}).fetch();assert.equal(await r.text(),'saved lesson')});
test('cache quota does not turn a successful request into an offline error',async()=>{const r=await app({online:true,quota:true}).fetch();assert.equal(await r.text(),'online')});
test('updates preserve the current shell and caches belonging to other apps',async()=>{const a=app();await a.activate();assert.deepEqual(a.deleted,['ism-young-shell-v3','ism-young-shell-v4'])});
