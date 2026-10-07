(()=>{
let deferred=null;
const btn=()=>document.getElementById('install-app');
const standalone=()=>window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;
const ios=()=>/iphone|ipad|ipod/i.test(navigator.userAgent);
function show(){const b=btn();if(b&&!standalone()){b.hidden=false;b.textContent='Instalar aplicativo'}}
function hide(){const b=btn();if(b)b.hidden=true}
function help(message){const el=document.createElement('div');el.className='install-help';el.innerHTML='<div class="install-help-card" role="dialog" aria-modal="true" aria-labelledby="install-title"><h2 id="install-title">Instalar Young English</h2><p>'+message+'</p><button class="primary" type="button">Entendi</button></div>';el.querySelector('button').onclick=()=>el.remove();el.onclick=e=>{if(e.target===el)el.remove()};document.body.appendChild(el);el.querySelector('button').focus()}
async function register(){if(!('serviceWorker'in navigator))return false;try{const reg=await navigator.serviceWorker.register('./sw.js',{scope:'./'});await navigator.serviceWorker.ready;return !!reg}catch(e){console.error('PWA service worker',e);return false}}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;show()});
window.addEventListener('appinstalled',()=>{deferred=null;hide()});
document.addEventListener('DOMContentLoaded',async()=>{
 if(standalone()){hide();return}
 show();const swOk=await register();const b=btn();if(!b)return;
 b.addEventListener('click',async()=>{
  if(deferred){deferred.prompt();const choice=await deferred.userChoice;if(choice.outcome==='accepted')hide();deferred=null;return}
  if(ios()){help('No Safari, toque em Compartilhar e depois em Adicionar à Tela de Início.');return}
  if(!swOk){help('A instalação ainda não está disponível porque o navegador não conseguiu ativar o modo offline. Atualize a página e tente novamente.');return}
  help('O Young English está preparado para instalação. No Chrome, abra o menu e escolha Instalar aplicativo ou Adicionar à tela inicial. Se a opção ainda não aparecer, atualize esta página uma vez.')
 });
});
})();
