(()=>{
let deferred=null;
const btn=()=>document.getElementById('install-app');
const standalone=()=>window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;
const ios=()=>/iphone|ipad|ipod/i.test(navigator.userAgent);
function show(){const b=btn();if(b&&!standalone()){b.hidden=false;b.textContent='Instalar aplicativo'}}
function hide(){const b=btn();if(b)b.hidden=true}
function help(message){
 if(document.querySelector('.install-help'))return;
 const previous=document.activeElement,el=document.createElement('div');el.className='install-help';
 el.innerHTML='<div class="install-help-card" role="dialog" aria-modal="true" aria-labelledby="install-title"><h2 id="install-title">Instalar Young English</h2><p></p><button class="primary" type="button">Entendi</button></div>';
 el.querySelector('p').textContent=message;
 const close=()=>{el.remove();previous?.focus()};
 el.querySelector('button').onclick=close;el.onclick=e=>{if(e.target===el)close()};
 el.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close()}else if(e.key==='Tab'){e.preventDefault();el.querySelector('button').focus()}});
 document.body.appendChild(el);el.querySelector('button').focus();
}
async function register(){if(!('serviceWorker'in navigator))return false;try{const reg=await navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'});return !!reg}catch(e){console.error('PWA service worker',e);return false}}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;show()});
window.addEventListener('appinstalled',()=>{deferred=null;hide()});
document.addEventListener('DOMContentLoaded',async()=>{
 const registered=register();
 if(standalone()){hide();return}
 show();const b=btn();if(!b)return;
 b.addEventListener('click',async()=>{
  if(deferred){const event=deferred;deferred=null;try{await event.prompt();const choice=await event.userChoice;if(choice.outcome==='accepted')hide()}catch{help('Não foi possível abrir a instalação. Use o menu do navegador para instalar o aplicativo.')}return}
  if(ios()){help('No Safari, toque em Compartilhar e depois em Adicionar à Tela de Início.');return}
  if(!await registered){help('Não foi possível preparar o modo offline. Verifique sua conexão e atualize a página. Você pode continuar usando o aplicativo pelo navegador.');return}
  help('O Young English está preparado para instalação. No Chrome, abra o menu e escolha Instalar aplicativo ou Adicionar à tela inicial. Se a opção ainda não aparecer, atualize esta página uma vez.')
 });
});
})();
