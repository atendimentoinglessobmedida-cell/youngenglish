const CACHE='ism-young-shell-v5';
const SHELL=['./audio-player.js','./install.html','./content.js','./advanced.js','./grammar.js','./app.js','./games.js','./level-pages.js','./premium-content.js','./expansion-content.js','./expansion-integrate.js','./elementary-content.js','./more-games.js','./learning-games.js','./practice-content.js','./video-content.js','./premium.js','./quality-content.js','./adaptive-games.js','./learning-upgrade.js','./quality-ui.js','./practice-upgrade.js','./videos.js','./institutional-state.js','./motion.js','./student-progress.js','./','./index.html','./manifest.webmanifest','./style.css','./games.css','./level-pages.css','./premium.css','./learning-games.css','./videos.css','./learning-upgrade.css','./site-pages.css','./motion.css','./install.js','./favicon.svg','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./assets/theme-school.svg','./assets/theme-science.svg','./assets/theme-nature.svg','./assets/theme-citizenship.svg','./assets/theme-food.svg','./assets/theme-esports.svg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('ism-young-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin)return;
 event.respondWith((async()=>{
  try{
   const response=await fetch(request);
   if(response.ok){try{await (await caches.open(CACHE)).put(request,response.clone())}catch{}}
   return response;
  }catch{
   const cached=await (await caches.open(CACHE)).match(request);
   if(cached)return cached;
   if(request.mode==='navigate')return new Response('<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Conexão necessária · Young English</title><main style="font-family:system-ui;max-width:560px;margin:auto;padding:24px"><h1>Esta página ainda não está salva</h1><p>Conecte-se à internet e abra esta atividade antes de usá-la offline. Seu progresso salvo neste navegador foi mantido.</p><a href="./index.html">Voltar ao início</a></main></html>',{status:503,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}});
   return Response.error();
  }
 })());
});
