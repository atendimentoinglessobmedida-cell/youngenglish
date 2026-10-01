// Jogos usam o conteúdo da aula e preservam o sistema de recompensas existente.
const learningGameProfiles={
 Elementary:{words:3,dictation:1,minWords:6,sentences:2,goal:'Duas frases curtas sobre personagens, objetos ou gostos.'},
 Basic:{words:4,dictation:2,minWords:10,sentences:2,goal:'Uma mensagem curta com frases completas e palavras da aula.'},
 'Pre-Intermediate':{words:5,dictation:2,minWords:18,sentences:3,goal:'Uma pequena história ou plano, com sequência e conectores.'},
 Intermediate:{words:6,dictation:3,minWords:28,sentences:4,goal:'Uma ideia desenvolvida com uma razão e um exemplo.'},
 Upper:{words:7,dictation:3,minWords:40,sentences:5,goal:'Uma proposta com razões, uma limitação e uma alternativa.'},
 Advanced:{words:8,dictation:3,minWords:55,sentences:6,goal:'Uma interpretação cuidadosa, com evidências e outra leitura possível.'}
};
const learningGameIds=['vocabrelay','contextwords','grammarquest','sentencewrite','storywriter'];
gameTypes.push(
 {id:'vocabrelay',title:'Expedição de palavras',desc:'Recupere palavras e expressões a partir do significado, em rodadas variadas.',scene:4},
 {id:'contextwords',title:'Palavras em contexto',desc:'Complete falas da aula usando pistas do vocabulário.',scene:6},
 {id:'grammarquest',title:'Trilha da gramática',desc:'Complete, escolha e transforme em três rodadas com explicações.',scene:7},
 {id:'sentencewrite',title:'Estúdio de frases',desc:'Ouça ou leia uma frase, escreva e compare com o modelo.',scene:9},
 {id:'storywriter',title:'Missão de autor',desc:'Crie um texto da aula e revise sua produção com critérios do seu nível.',scene:5}
);
function learningProfile(l){return learningGameProfiles[l.level]||learningGameProfiles.Basic}
function learningText(t){return String(t).trim().toLowerCase().replace(/[’‘]/g,"'").replace(/\s+/g,' ')}
function learningSentence(t){return learningText(t).replace(/[.,!?;:]/g,'').trim()}
function learningUnique(items,key){return items.filter((x,i,a)=>a.findIndex(y=>key(y)===key(x))===i)}
function learningVocabulary(l){return learningUnique((l.v||[]).filter(v=>v.en&&v.pt),v=>learningText(v.en))}
const learningExtraContexts={
 'lesson-33':['Our reflection helped us improve the next presentation.','Better preparation might have changed the outcome, but blaming one person would not help.'],
 'lesson-39':['An inclusive club should consult each stakeholder before changing its rules.','A barrier may prevent someone from joining, even when everyone is invited to participate.'],
 premium09:['The illustrator agreed to revise the layout before the deadline.','Each contribution should receive credit when the team is ready to publish the comic.'],
 premium20:['A contradiction in the narrative raises questions about the reliability of the narrator.','This distinction may justify a reservation, but it does not prove that every assertion is false.']
};
function learningContextItems(l){
 const sentences=learningUnique([...(l.d||[]).map(s=>s.replace(/^[^:]+:\s*/,'')),l.s,l.model,...(l.q||[]).map(q=>q.options?.[q.answer]),...(learningExtraContexts[l.id]||[])].filter(s=>s&&s.trim().split(/\s+/).length>=4),learningSentence);
 const items=[];
 for(const v of learningVocabulary(l).filter(v=>v.en.length>=3)){
  const escaped=v.en.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const pattern=new RegExp('(^|\\b)('+escaped+')(\\b|$)','i');
  const sentence=sentences.find(s=>pattern.test(s));
  if(sentence){const match=sentence.match(pattern);items.push({prompt:sentence.replace(pattern,(_,before,word,after)=>before+'____'+after),accepted:[match[2]],explanation:v.en+' — '+v.pt,model:sentence});}
 }
 return learningUnique(items,x=>learningText(x.prompt));
}
function learningGrammarItems(l){return (l.grammarExercises||[]).filter(q=>q.type==='choice'?Array.isArray(q.options)&&Number.isInteger(q.answer)&&q.options[q.answer]:Array.isArray(q.accepted)&&q.accepted.length).map(q=>({...q,accepted:q.type==='choice'?[q.options[q.answer]]:q.accepted}));}
function learningDictationItems(l){
 const sentences=learningUnique([l.s,...(l.d||[]).map(s=>s.replace(/^[^:]+:\s*/,''))].filter(s=>s&&s.trim().split(/\s+/).length>=2),learningSentence);
 const max={Elementary:8,Basic:14,'Pre-Intermediate':22,Intermediate:30,Upper:45,Advanced:65}[l.level]||20;
 const short=sentences.filter(s=>s.split(/\s+/).length<=max);
 return (short.length?short:sentences).map(s=>({prompt:'Escreva a frase do modelo.',accepted:[s],model:s,explanation:'Compare palavras, ordem e auxiliares. Maiúsculas e pontuação final não mudam o resultado desta comparação.'}));
}
function learningUnavailable(){ $('#play').innerHTML='<p class="note">Esta aula não tem exemplos suficientes para esta modalidade. Escolha outra aula ou experimente a Expedição de palavras.</p>'; }
function learningRounds(id,l,title,instruction,items,kind){
 gameShell(title,instruction);
 if(!items.length){learningUnavailable();return}
 let round=0;
 function draw(){
  if(round===items.length){$('#play').innerHTML=`<p class="note">${items.length} rodadas concluídas. Você pode recomeçar para encontrar novos itens.</p>`;gameDone(id,l,'Prática de '+title.toLowerCase()+' concluída.');return}
  const q=items[round],choice=kind==='grammar'&&q.type==='choice',dictation=kind==='dictation';
  $('#play').innerHTML=`<p class="round-count">Rodada ${round+1} de ${items.length} · ${esc(l.level)}</p><progress aria-label="Rodadas concluídas" max="${items.length}" value="${round}"></progress><h4>${esc(dictation?'Reconstrua a frase':q.prompt)}</h4>${kind==='grammar'?`<p>Estrutura: ${esc(l.grammarTopic)}</p>`:''}${dictation?'<button class="audio" id="learning-audio">Ouvir frase</button>':''}<details><summary>${dictation?'Ler a frase (alternativa ao áudio)':'Consultar pista e modelo'}</summary><p lang="en">${esc(q.model||q.accepted[0])}</p><p>${esc(q.explanation||'')}</p><p>Feche o apoio e tente recuperar a resposta. Usar uma pista faz parte da prática.</p></details>${choice?`<div class="options">${shuffle(q.options.map((text,index)=>({text,index}))).map(x=>`<button class="option" data-learning-choice="${x.index}" lang="en">${esc(x.text)}</button>`).join('')}</div>`:'<form id="learning-form"><label for="learning-input">Sua resposta em inglês</label><input id="learning-input" class="game-text-input" lang="en" autocomplete="off" spellcheck="false" maxlength="1000"><button class="primary" type="submit">Conferir resposta</button></form>'}<p id="learning-feedback" role="status"></p><button class="primary" id="learning-next" hidden>Continuar</button>`;
  const check=value=>{
   if(!String(value).trim()){$('#learning-feedback').textContent='Escreva sua resposta antes de conferir.';return}
   const normalize=kind==='vocabulary'||kind==='context'?learningText:learningSentence;
   if(q.accepted.some(a=>normalize(a)===normalize(value))){
    $('#learning-feedback').textContent='Conferiu com o modelo! '+(q.explanation||'');$('#learning-next').hidden=false;
    document.querySelectorAll('[data-learning-choice],#learning-form button').forEach(b=>b.disabled=true);if($('#learning-input'))$('#learning-input').readOnly=true;$('#learning-next').focus({preventScroll:true});
   }else $('#learning-feedback').textContent='Ainda não corresponde ao modelo pedido. Confira o apoio e tente novamente. '+(kind==='grammar'?q.explanation||'':'');
  };
  if(choice)document.querySelectorAll('[data-learning-choice]').forEach(b=>b.onclick=()=>check(q.options[+b.dataset.learningChoice]));
  else $('#learning-form').onsubmit=e=>{e.preventDefault();check($('#learning-input').value)};
  if(dictation)audio($('#learning-audio'),q.model);
  $('#learning-next').onclick=()=>{stopAudio();round++;draw();($('#learning-input')||$('#play [data-learning-choice]')||$('#restartgame'))?.focus({preventScroll:true})};
 }
 draw();
}
function learningWriter(l){
 gameShell('Missão de autor','Escreva, revise e declare sua autoavaliação. O aplicativo verifica apenas extensão e presença de vocabulário; não corrige automaticamente a gramática nem avalia a qualidade das ideias.');
 const profile=learningProfile(l),words=shuffle(learningVocabulary(l)).slice(0,l.level==='Elementary'?2:3),criteria=writingCriteria[l.level]||writingCriteria.Basic;
 const task=String(l.w||l.o).replace(/Em\s+\d+(?:[–-]\d+)?\s+palavras,?\s*/i,'').replace(/Escreva\s+\d+(?:[–-]\d+)?\s+palavras\s*/i,'Escreva um texto ');
 $('#play').innerHTML=`<div class="note"><h4>${esc(profile.goal)}</h4><p>Adapte a ideia desta tarefa para uma versão curta no jogo: ${esc(task)}</p><p>Meta da missão: pelo menos ${profile.minWords} palavras. Tente escrever ${profile.sentences} frases. Não use dados pessoais.</p><p>Use pelo menos uma destas palavras ou expressões: <span lang="en">${words.map(v=>esc(v.en)).join(' · ')}</span>.</p></div><label for="author-input">Seu texto em inglês</label><textarea id="author-input" class="author-input" lang="en" maxlength="5000" spellcheck="true"></textarea><p id="author-count" role="status"></p><button class="primary" id="author-review">Preparar revisão</button><details><summary>Consultar o modelo da aula</summary><p lang="en">${esc(l.model||l.s)}</p><p>Este é um exemplo de apoio. Desenvolva sua própria versão para a missão.</p></details><section id="author-checklist" hidden><h4>Revise antes de concluir</h4><p>As marcações representam sua autoavaliação, não uma correção automática.</p>${criteria.map((c,i)=>`<label class="author-criterion"><input type="checkbox" data-author-check="${i}"> ${esc(c)}</label>`).join('')}<button class="primary" id="author-finish">Concluir minha produção revisada</button></section><p id="author-feedback" role="status"></p>`;
 const input=$('#author-input');input.value=String(drafts[l.id]||'').slice(0,5000);
 function wordCount(){return input.value.trim().match(/[A-Za-z]+(?:['’-][A-Za-z]+)*/g)?.length||0}
 function update(){drafts[l.id]=input.value;$('#author-count').textContent=wordCount()+' palavras · meta '+profile.minWords;$('#author-checklist').hidden=true;document.querySelectorAll('[data-author-check]').forEach(x=>x.checked=false);$('#author-feedback').textContent='Seu texto fica como rascunho da produção desta aula. O salvamento segue sua escolha na página Premium.';if(typeof saveProgress==='function')saveProgress()}
 input.oninput=update;$('#author-count').textContent=wordCount()+' palavras · meta '+profile.minWords;
 $('#author-review').onclick=()=>{
  if(wordCount()<profile.minWords){$('#author-feedback').textContent='Acrescente detalhes para chegar a '+profile.minWords+' palavras. Use o modelo se precisar.';return}
  const text=learningText(input.value),usesWord=words.some(v=>new RegExp('(^|\\b)'+v.en.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(\\b|$)','i').test(text));
  if(!usesWord){$('#author-feedback').textContent='Inclua pelo menos uma palavra ou expressão da lista na sua produção.';return}
  $('#author-checklist').hidden=false;$('#author-feedback').textContent='Extensão e vocabulário conferidos. Agora releia e faça sua autoavaliação.';
 };
 $('#author-finish').onclick=()=>{
  if([...document.querySelectorAll('[data-author-check]')].some(c=>!c.checked)){$('#author-feedback').textContent='Revise cada critério e marque os que você conferiu antes de concluir.';return}
  input.readOnly=true;$('#author-review').disabled=true;$('#author-finish').disabled=true;document.querySelectorAll('[data-author-check]').forEach(c=>c.disabled=true);
  gameDone('storywriter',l,'Produção revisada pelo aluno. XP por prática, sem nota automática de inglês.');
 };
}
const learningPreviousLaunch=launchGame;
launchGame=function(id,l){
 if(!learningGameIds.includes(id))return learningPreviousLaunch(id,l);
 stopAudio();const profile=learningProfile(l);
 if(id==='vocabrelay')return learningRounds(id,l,'Expedição de palavras','Leia o significado e recupere a palavra ou expressão da aula. Sem cronômetro; consulte o apoio e tente novamente.',shuffle(learningVocabulary(l)).slice(0,profile.words).map(v=>({prompt:v.pt,accepted:[v.en],explanation:v.en+' — '+v.pt})),'vocabulary');
 if(id==='contextwords')return learningRounds(id,l,'Palavras em contexto','Complete a fala ou exemplo do tema usando o vocabulário da aula. Este desafio compara com o modelo previsto; outras frases possíveis não são avaliadas.',shuffle(learningContextItems(l)).slice(0,Math.min(profile.words,4)),'context');
 if(id==='grammarquest')return learningRounds(id,l,'Trilha da gramática','Complete, escolha e transforme usando a estrutura desta aula. As respostas são comparadas com os modelos previstos, sem correção de texto livre.',learningGrammarItems(l),'grammar');
 if(id==='sentencewrite')return learningRounds(id,l,'Estúdio de frases','Ouça a frase ou consulte sua versão escrita. Feche o apoio e reconstrua o modelo. O áudio é opcional; a comparação confere palavras e ordem, não pronúncia.',shuffle(learningDictationItems(l)).slice(0,profile.dictation),'dictation');
 return learningWriter(l);
};
