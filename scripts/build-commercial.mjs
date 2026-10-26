import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const config=JSON.parse(fs.readFileSync(path.join(root,'server/commercial.config.json'),'utf8'));
const source=path.resolve(root,config.source),output=path.join(root,'commercial-build');
if(!['young','travel'].includes(config.app)||![root,path.join(root,'public')].includes(source))throw Error('Unexpected source');
if(fs.existsSync(output)){
 if(fs.lstatSync(output).isSymbolicLink()||path.dirname(output)!==root||path.basename(output)!=='commercial-build')throw Error('Unsafe output');
 const marker=path.join(output,'manifest.json');if(!fs.existsSync(marker)||JSON.parse(fs.readFileSync(marker,'utf8')).app!==config.app)throw Error('Refusing to replace an unrecognized folder');
 // Only this validated, marked generated package may be rebuilt.
 fs.rmSync(output,{recursive:true,force:true});
}
fs.mkdirSync(output,{recursive:true});
const privateRoot=path.join(output,'private'),publicRoot=path.join(output,'public');fs.mkdirSync(privateRoot,{recursive:true});fs.mkdirSync(publicRoot,{recursive:true});
const allowed=/\.(?:html|js|css|svg|webp|png|avif|mp3|ogg|webmanifest)$/;
let count=0;
function copy(dir,rel=''){for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(e.isSymbolicLink())throw Error('Symlink not allowed');const name=path.join(rel,e.name),input=path.join(dir,e.name);if(e.name.startsWith('.')||['server','scripts','docs','node_modules','commercial-build','dist'].includes(e.name))continue;if(e.isDirectory()){copy(input,name);continue;}if(!allowed.test(name)||name===config.marketing||name==='sw.js')continue;const dest=path.join(privateRoot,name);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(input,dest);count++;}}
copy(source);
const marketing=fs.readFileSync(path.join(source,config.marketing),'utf8');fs.writeFileSync(path.join(publicRoot,config.marketing),marketing);
for(const [,ref]of marketing.matchAll(/(?:src|href)="(assets\/[^"?#]+)"/g)){const dest=path.join(publicRoot,ref);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(path.join(source,ref),dest);}
const css='body{font:16px system-ui;background:#f8f8f2;color:#112c32;margin:0}main{max-width:480px;margin:8vh auto;padding:28px}h1{font-size:38px;letter-spacing:-1.5px}label{display:block;margin-top:20px}input,button{font:inherit;box-sizing:border-box;display:block;width:100%;padding:14px;border:1px solid #aac1b8;border-radius:8px;margin-top:8px}button{background:#112c32;color:white;margin-top:24px;font-weight:700}a{color:#112c32}p{line-height:1.7}';
fs.writeFileSync(path.join(publicRoot,'login.html'),`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Entrar · ISM ${config.app}</title><style>${css}</style></head><body><main><p>ISM · INGLÊS SOB MEDIDA</p><h1>Continue seu aprendizado.</h1><p>Use o e-mail e o código enviados pela ISM. ${config.app==='young'?'Pais e responsáveis acompanham a solicitação de acesso.':''}</p><form id="login"><label>E-mail<input name="email" type="email" autocomplete="email" required maxlength="254"></label><label>Código<input name="code" type="password" autocomplete="current-password" required minlength="8" maxlength="128"></label><button>Entrar</button></form><p id="status" role="status"></p><a href="${config.marketing}">Conhecer as condições de acesso →</a></main><script src="commercial-login.js"></script></body></html>`);
fs.writeFileSync(path.join(publicRoot,'commercial-login.js'),`document.getElementById('login').onsubmit=async event=>{event.preventDefault();const form=event.currentTarget,button=form.querySelector('button'),status=document.getElementById('status');button.disabled=true;status.textContent='Conferindo acesso…';try{const r=await fetch('/api/session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:form.elements.email.value,code:form.elements.code.value}),signal:AbortSignal.timeout(15000)});const d=await r.json();if(!r.ok)throw Error(d.error||'Acesso indisponível.');form.elements.code.value='';location.replace('/index.html');}catch(e){status.textContent=e.message||'Não foi possível entrar.';}finally{button.disabled=false;}};`);
const manifest={app:config.app,publicDirectory:'public',privateDirectory:'private',privateFiles:count,requiresGateway:true,commercialEnabled:false};fs.writeFileSync(path.join(output,'manifest.json'),JSON.stringify(manifest,null,2));console.log(JSON.stringify(manifest));
