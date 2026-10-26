import {createHmac,timingSafeEqual,randomUUID} from 'node:crypto';
import {readFile,realpath,stat} from 'node:fs/promises';
import path from 'node:path';

const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.avif':'image/avif','.mp3':'audio/mpeg','.ogg':'audio/ogg','.webmanifest':'application/manifest+json'};
const headers={'Cache-Control':'private, no-store','Vary':'Cookie','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Frame-Options':'DENY'};
const json=(data,status=200,extra={})=>Response.json(data,{status,headers:{...headers,...extra}});
export function licenseActive(row,subject,app,now){
 return !!row&&row.subject===subject&&row.app===app&&row.status==='ACTIVE'&&Number.isFinite(Date.parse(row.startsAt))&&Date.parse(row.startsAt)<=now&&Number.isFinite(Date.parse(row.expiresAt))&&Date.parse(row.expiresAt)>now;
}
async function asset(root,pathname){
 if(!Object.hasOwn(types,path.extname(pathname))||pathname.split('/').some(p=>p.startsWith('.'))||pathname.includes('\\'))return null;
 const base=await realpath(root),candidate=path.resolve(base,'.'+pathname);
 const relative=path.relative(base,candidate);if(relative.startsWith('..')||path.isAbsolute(relative))return null;
 try{const resolved=await realpath(candidate),rel=path.relative(base,resolved);if(rel.startsWith('..')||path.isAbsolute(rel)||!(await stat(resolved)).isFile())return null;return {data:await readFile(resolved),type:types[path.extname(resolved)]};}catch{return null;}
}
// Provider must verify credentials and return current app-scoped grants from a private server store.
// No route creates, extends, approves or reactivates a license.
export function createGateway({app,origin,publicRoot,privateRoot,provider,secret,enabled=false,clock=Date.now}){
 if(!['young','travel'].includes(app)||typeof secret!=='string'||Buffer.byteLength(secret)<32||!['verifyCredentials','getLicense','createSession','getSession','revokeSession'].every(key=>typeof provider?.[key]==='function'))throw Error('Private gateway configuration required');
 const canonical=new URL(origin);if(canonical.origin!==origin||canonical.protocol!=='https:')throw Error('HTTPS origin required');
 const publicPath=path.resolve(publicRoot),privatePath=path.resolve(privateRoot),relative=path.relative(publicPath,privatePath);if(!relative||(!relative.startsWith('..')&&!path.isAbsolute(relative)))throw Error('Private content must be outside the public root');
 const cookieName='__Host-ism-'+app;
 const sign=body=>createHmac('sha256',secret).update(body).digest('base64url');
 const cookie=(token,age)=>`${cookieName}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${age}`;
 const rates=new Map();
 async function subjectFrom(request,now){
  try{const raw=request.headers.get('cookie')?.split(';').map(s=>s.trim()).find(s=>s.startsWith(cookieName+'='))?.slice(cookieName.length+1);if(!raw||raw.length>2048)return null;const parts=raw.split('.');if(parts.length!==2)return null;const expected=Buffer.from(sign(parts[0])),given=Buffer.from(parts[1]);if(given.length!==expected.length||!timingSafeEqual(expected,given))return null;const c=JSON.parse(Buffer.from(parts[0],'base64url').toString());if(c.aud!==app||typeof c.sub!=='string'||typeof c.nonce!=='string'||!Number.isFinite(c.iat)||c.iat>now||!Number.isFinite(c.exp)||c.exp<=now||c.exp-c.iat>900000)return null;const session=await provider.getSession({id:c.nonce,subject:c.sub,app});return session?.subject===c.sub&&session.app===app&&session.revoked!==true&&Date.parse(session.expiresAt)>=c.exp?c:null;}catch{return null;}
 }
 return async request=>{
  try{
   const url=new URL(request.url),now=clock();if(url.origin!==origin)return json({error:'Origem inválida.'},403);
   let pathname;try{pathname=decodeURIComponent(url.pathname);}catch{return json({error:'Endereço inválido.'},400);}
   if(pathname==='/sw.js'||request.headers.get('sec-fetch-dest')==='serviceworker')return json({error:'Cache offline indisponível neste ambiente.'},404);
   if(pathname==='/api/session'&&request.method==='POST'){
    if(!enabled)return json({error:'Ativação comercial indisponível.'},503);
    if(request.headers.get('origin')!==origin||request.headers.get('content-type')?.split(';')[0]!=='application/json')return json({error:'Origem inválida.'},403);
    if(Number(request.headers.get('content-length')||0)>4096)return json({error:'Dados inválidos.'},413);
    let text='',size=0;const reader=request.body?.getReader();if(reader)try{for(;;){const chunk=await reader.read();if(chunk.done)break;size+=chunk.value.byteLength;if(size>4096){await reader.cancel();return json({error:'Dados inválidos.'},413);}text+=new TextDecoder().decode(chunk.value,{stream:true});}}finally{reader.releaseLock();}
    let input;try{input=JSON.parse(text);}catch{return json({error:'Dados inválidos.'},400);}
    if(input?.action==='logout'){const session=await subjectFrom(request,now);if(session)await provider.revokeSession({id:session.nonce,subject:session.sub,app});return json({ok:true},200,{'Set-Cookie':cookie('',0)});}
    const email=String(input?.email||'').trim().toLowerCase(),code=String(input?.code||'').trim();
    if(email.length>254||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||code.length<8||code.length>128)return json({error:'E-mail ou código inválido.'},403);
    // Deliberately do not trust forwarded headers supplied by a caller.
    // Global local-process ceiling; use a durable trusted-edge limiter before publication.
    const key='login',rate=rates.get(key);if(rate&&rate.until>now&&rate.count>=10)return json({error:'Aguarde antes de tentar novamente.'},429);
    rates.set(key,{count:rate&&rate.until>now?rate.count+1:1,until:rate&&rate.until>now?rate.until:now+600000});
    const user=await provider.verifyCredentials({email,code,app});if(!user||typeof user.subject!=='string'||!user.subject||user.subject.length>200)return json({error:'Acesso não autorizado.'},403);
    const license=await provider.getLicense({subject:user.subject,app});if(!licenseActive(license,user.subject,app,now))return json({error:'Acesso não autorizado.'},403);
    const exp=Math.min(now+900000,Date.parse(license.expiresAt)),nonce=randomUUID();await provider.createSession({id:nonce,subject:user.subject,app,expiresAt:new Date(exp).toISOString()});const body=Buffer.from(JSON.stringify({sub:user.subject,aud:app,iat:now,exp,nonce})).toString('base64url');
    return json({ok:true,expiresAt:new Date(exp).toISOString()},200,{'Set-Cookie':cookie(body+'.'+sign(body),Math.floor((exp-now)/1000))});
   }
   if(!['GET','HEAD'].includes(request.method))return json({error:'Método indisponível.'},405);
   if(pathname.startsWith('/api/'))return json({error:'Recurso inexistente.'},404);
   const allowedPublic=['/login.html','/commercial-login.js',app==='young'?'/solicitar-acesso.html':'/acesso.html'].includes(pathname)||(pathname.startsWith('/assets/')&&/\.(?:svg|webp|png|avif)$/.test(pathname));
   const publicFile=allowedPublic?await asset(publicRoot,pathname):null;if(publicFile)return new Response(request.method==='HEAD'?null:publicFile.data,{headers:{...headers,'Content-Type':publicFile.type}});
   if(!enabled)return json({error:'Operação comercial indisponível.'},503);
   const session=await subjectFrom(request,now);
   if(!session)return pathname==='/'||pathname==='/index.html'?new Response(null,{status:303,headers:{...headers,Location:'/login.html'}}):json({error:'Entre para acessar.'},401);
   const license=await provider.getLicense({subject:session.sub,app});if(!licenseActive(license,session.sub,app,now))return json({error:'Acesso indisponível ou vencido.'},403);
   const file=await asset(privateRoot,pathname==='/'?'/index.html':pathname);if(!file)return json({error:'Recurso inexistente.'},404);
   return new Response(request.method==='HEAD'?null:file.data,{headers:{...headers,'Content-Type':file.type}});
  }catch{return json({error:'Serviço temporariamente indisponível.'},503);}
 };
}
