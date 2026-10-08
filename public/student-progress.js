// Local saving is optional and available to regular and Premium learners.
(()=>{
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
  panel.querySelector('input').checked=remember;
  panel.querySelector('p').textContent=storageFailed?'Não foi possível salvar agora. Seu registro anterior foi mantido.':remember?'Progresso salvo neste navegador. Não há sincronização entre aparelhos. Em aparelho compartilhado, outras pessoas podem ver seus textos.':'Sem salvamento, fechar ou recarregar reinicia esta sessão. Ative a opção para continuar depois. Não informe dados pessoais.';
 }
 render=function(){oldRender();refresh()};refresh();
})();
