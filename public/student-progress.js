function decodeYoungBackup(text){
 if(typeof text!=='string'||new TextEncoder().encode(text).length>1000000)throw new Error('Arquivo muito grande. O limite é 1 MB.');
 let envelope;try{envelope=JSON.parse(text)}catch{throw new Error('O arquivo não contém um backup JSON válido.')}
 if(!envelope||envelope.app!=='ism-young-english'||envelope.formatVersion!==1||!envelope.data)throw new Error('Este arquivo não é um backup compatível do Young.');
 const raw=envelope.data,allowed=['version','appVersion','points','answers','drafts','done','stars','gameWins','themeAchievements','missionMode','age','resume','filters'];
 if(Object.keys(raw).some(k=>!allowed.includes(k)))throw new Error('O arquivo contém campos não permitidos.');
 const clean=validatedProgress(raw);if(!clean||!['kids','teens'].includes(raw.age)||!['explore','practice','create'].includes(raw.missionMode))throw new Error('O progresso contém valores inválidos.');
 for(const key of ['answers','drafts','stars']){if(!raw[key]||typeof raw[key]!=='object'||Array.isArray(raw[key])||Object.keys(raw[key]).length!==Object.keys(clean[key]).length)throw new Error('O progresso contém atividades inválidas.')}
 for(const key of ['done','gameWins','themeAchievements'])if(!Array.isArray(raw[key])||raw[key].length!==clean[key].length)throw new Error('O progresso contém atividades inválidas.');
 if(Object.values(clean.drafts).some(v=>v.length>20000))throw new Error('Há um texto acima do limite de 20.000 caracteres.');
 if(raw.resume&&!clean.resume)throw new Error('A aula de retomada não existe neste catálogo.');
 return Object.fromEntries(allowed.filter(k=>Object.hasOwn(clean,k)).map(k=>[k,clean[k]]));
}
// Local saving is optional and available to regular and Premium learners.
(()=>{
 const nav=document.querySelector('header nav');if(nav){const tools=document.createElement('details'),info=document.createElement('details');tools.innerHTML='<summary>Ferramentas</summary>';info.innerHTML='<summary>Informações</summary>';tools.className=info.className='nav-group';for(const selector of ['#videos','a[href="speaking-coach.html"]','a[href="listening-lab.html"]','#projects']){const node=nav.querySelector(selector);if(node)tools.append(node)}for(const selector of ['#guide','a[href="professor.html"]','a[href="contato.html"]','a[href="assinatura.html"]']){const node=nav.querySelector(selector);if(node)info.append(node)}nav.append(tools,info)}
 const oldRender=render;
 function refresh(){
  let panel=document.getElementById('student-progress');
  const workspace=document.querySelector('.workspace');if(!workspace)return;
  if(!panel){
   panel=document.createElement('section');panel.id='student-progress';panel.className='note';panel.setAttribute('aria-label','Salvar meu progresso');
   panel.innerHTML='<label><input id="student-save-progress" type="checkbox"> Salvar meu progresso neste navegador</label><p id="student-save-status"></p>';
   workspace.before(panel);
   panel.querySelector('input').addEventListener('change',event=>{
    if(!event.target.checked){try{localStorage.removeItem(progressKey)}catch{toast('Não foi possível remover o registro. Use as configurações do navegador.');event.target.checked=remember;return}}
    remember=event.target.checked;saveProgress();render();
   });
  }
  if(!panel.querySelector('#young-backup-export')){
   const tools=document.createElement('details');tools.innerHTML='<summary>Transferir meu progresso</summary><p>Baixe uma cópia para guardar ou levar a outro aparelho. O arquivo inclui seus textos: guarde-o em um lugar privado. Isso não transfere uma assinatura.</p><button type="button" class="secondary" id="young-backup-export">Baixar cópia</button> <label class="secondary" style="display:inline-block;padding:12px">Escolher cópia<input id="young-backup-file" type="file" accept=".json,application/json" style="display:block;margin-top:8px"></label><p id="young-backup-preview" role="status"></p><button type="button" class="primary" id="young-backup-restore" hidden>Restaurar e substituir progresso</button>';
   panel.append(tools);let pending=null;const status=tools.querySelector('#young-backup-preview'),restore=tools.querySelector('#young-backup-restore');
   tools.querySelector('#young-backup-export').onclick=()=>{const data=progressSnapshot(),text=JSON.stringify({app:'ism-young-english',formatVersion:1,exportedAt:new Date().toISOString(),data},null,2);try{decodeYoungBackup(text);const url=URL.createObjectURL(new Blob([text],{type:'application/json'})),link=document.createElement('a');link.href=url;link.download='ism-young-progresso-'+new Date().toISOString().slice(0,10)+'.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent='Cópia preparada. Confira o arquivo nos downloads.'}catch(error){status.textContent=error.message}};
   tools.querySelector('#young-backup-file').onchange=async event=>{pending=null;restore.hidden=true;const file=event.target.files[0];if(!file)return;if(file.size>1000000){status.textContent='Arquivo muito grande. O limite é 1 MB.';return}try{pending=decodeYoungBackup(await file.text());status.textContent=pending.done.length+' aulas concluídas e '+Object.keys(pending.drafts).length+' textos nesta cópia. A restauração substitui o progresso atual.';restore.hidden=false}catch(error){status.textContent=error.message}event.target.value=''};
   restore.onclick=()=>{if(!pending||!confirm('Substituir o progresso atual por esta cópia? Baixe seu progresso atual antes se quiser preservá-lo.'))return;const data=pending;pending=null;restore.hidden=true;for(const[target,source]of [[answers,data.answers],[drafts,data.drafts],[stars,data.stars]]){for(const key of Object.keys(target))delete target[key];Object.assign(target,source)}for(const[target,source]of [[done,data.done],[gameWins,data.gameWins],[themeAchievements,data.themeAchievements]]){target.clear();source.forEach(v=>target.add(v))}points=data.points;age=data.age;missionMode=data.missionMode;resumeLesson=data.resume||null;document.querySelector('#age').value=age;saveProgress();render();status.textContent=storageFailed?'Cópia restaurada nesta sessão. Não foi possível salvar; o registro anterior do navegador foi preservado.':remember?'Cópia restaurada e salva neste navegador.':'Cópia restaurada nesta sessão. Ative o salvamento para manter após fechar.'};
  }
  panel.querySelector('input').checked=remember;
  panel.querySelector('p').textContent=storageFailed?'Não foi possível salvar agora. Seu registro anterior foi mantido.':remember?'Progresso salvo neste navegador. Não há sincronização entre aparelhos. Em aparelho compartilhado, outras pessoas podem ver seus textos.':'Sem salvamento, fechar ou recarregar reinicia esta sessão. Ative a opção para continuar depois. Não informe dados pessoais.';
 }
 render=function(){oldRender();refresh()};refresh();
})();

