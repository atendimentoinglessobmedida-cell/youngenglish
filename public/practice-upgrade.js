/* Descoberta das aulas originais e apoio à escrita no Practice Lab. */
const practiceLevelPage=levelPageUI;levelPageUI=function(){
 practiceLevelPage();const group=practiceLessons.filter(l=>l.level===selectedLevel),host=$('#surface .level-page');if(!host||!group.length)return;
 host.insertAdjacentHTML('afterbegin',`<section class="note practice-invite"><span class="eyebrow">PRACTICE LAB · ${esc(selectedLevel)}</span><h3>Duas novas aulas para praticar</h3><p>Texto original, vocabulário, lacunas, escolhas com feedback, transformação de frases e escrita com revisão.</p><div class="options">${group.map(l=>`<button class="secondary" data-practice-open="${lessons.indexOf(l)}">${esc(l.t)} · ${esc(l.grammarTopic)}</button>`).join('')}</div><p class="teacher">Atividades autorais ISM. A conclusão registra prática, sem certificar proficiência.</p></section>`);
 document.querySelectorAll('[data-practice-open]').forEach(b=>b.onclick=()=>openLesson(+b.dataset.practiceOpen));
};
const practiceStage=stageUI;stageUI=function(l){
 practiceStage(l);if(!l.practice)return;const body=$('#lessonbody');
 if(step===1&&l.practiceTextType!=='Conversa'){
  body.querySelector(':scope > p').textContent='Leia o texto original da aula. Identifique a situação, confira as informações e use a tradução quando precisar.';
  $('#dialogaudio').textContent='Ouvir texto';body.insertAdjacentHTML('afterbegin',`<span class="tag">${esc(l.practiceTextType)} · texto ISM</span>`);
 }
 if(step===2&&l.practiceTextType!=='Conversa')body.querySelector(':scope > p').textContent='Ouça o texto da aula ou consulte a transcrição. Repita quando quiser; a voz é sintetizada pelo navegador.';
 if(step===3)body.querySelectorAll('.feedback').forEach(p=>p.setAttribute('role','status'));
 if(step===4)body.insertAdjacentHTML('afterbegin',`<details><summary>Consultar o texto original da aula</summary>${l.d.map(line=>`<p lang="en">${esc(line)}</p>`).join('')}</details>`);
 if(step===5){
  $('#writing').insertAdjacentHTML('afterend',`<p id="practice-word-count" role="status"></p><section class="note"><h3>Confira o objetivo desta aula</h3><ul>${l.practiceCriteria.map(c=>`<li>${esc(c)}</li>`).join('')}</ul><p>O contador verifica a extensão mínima de prática. Os critérios ajudam sua revisão; não corrigem automaticamente a qualidade do texto.</p></section>`);
  const count=()=>{$('#practice-word-count').textContent=`${practiceWordCount($('#writing').value)} palavras · mínimo de prática: ${l.practiceMinWords}.`};count();
  const oldInput=$('#writing').oninput;$('#writing').oninput=e=>{oldInput(e);answers[l.id+':reviewed']=false;$('#reviewed').checked=false;if($('#createdcheck')){$('#createdcheck').checked=false;answers[l.id+':created']=false}count();saveProgress()};
 }
};
function practiceWordCount(text){return (String(text).match(/[A-Za-z]+(?:['’\-][A-Za-z]+)*/g)||[]).length}
const practiceFinish=finish;finish=function(l){if(l.practice&&practiceWordCount(drafts[l.id]||'')<l.practiceMinWords){toast(`Desenvolva sua escrita até pelo menos ${l.practiceMinWords} palavras e confira a revisão.`);return}practiceFinish(l)};
const practiceProfile=learningProfile;learningProfile=function(l){const profile=practiceProfile(l);return l.practice?{...profile,minWords:Math.max(profile.minWords,l.practiceMinWords)}:profile};
const practiceRender=render;render=function(){
 practiceRender();if(view==='learn'&&lessons[current].practice){const tag=$('#surface .course-head .tag');if(tag)tag.textContent+=' · PRACTICE LAB'}
 if(view==='guide')$('#surface article').insertAdjacentHTML('beforeend',`<h3>Practice Lab: mais prática por nível</h3><p>${practiceLessons.length} aulas autorais gratuitas, duas por nível, com ${practiceLessons.length*8} entradas de vocabulário e ${practiceLessons.length*3} exercícios de gramática. Há seis conversas e seis textos de gêneros diferentes, com questões de compreensão, produção escrita e critérios específicos. Os quinze jogos usam o conteúdo dessas aulas.</p><details><summary>Referências para estudo complementar — links externos</summary><p>O Test-English foi consultado como referência de organização por habilidades. As atividades ISM são originais; não há reprodução de questões, imagens ou explicações do site, nem parceria ou aprovação institucional.</p><ul><li><a href="https://test-english.com/grammar-points/" target="_blank" rel="noopener noreferrer">Gramática no Test-English — abre outra aba</a></li><li><a href="https://test-english.com/reading/" target="_blank" rel="noopener noreferrer">Leitura no Test-English — abre outra aba</a></li><li><a href="https://test-english.com/writing/" target="_blank" rel="noopener noreferrer">Escrita no Test-English — abre outra aba</a></li></ul><p>O site externo usa sua própria organização de níveis. Elementary do ISM é início absoluto e não equivale ao A1 Elementary do Test-English.</p></details>`);
};
// As novas lições existem após a leitura inicial das rotas. Resolver seus links agora.
if(practiceLessons.some(l=>l.id===location.hash.slice(1)))readPageRoute();
