// Jogos derivados exclusivamente do vocabulário e diálogo da aula selecionada.
// A arte oferece contexto; as legendas são explícitas, inclusive para termos abstratos.
function adaptiveLessonArt(l){
  if(l.premium){const t=premiumThemes.find(x=>x.id===l.theme);return themeArt(t,'premium-thumb')}
  return typeof characterArt==='function'&&characterThemeArt[l.theme]?characterArt(l.theme,'story-theme-art'):scene(pageCatalog.find(x=>x.id===l.level)?.scene||0,'story-scene');
}
visualGame=function(l){
  gameShell('Explorador de imagens e palavras','A ilustração situa o tema. Leia a pista em português e escolha a legenda em inglês correspondente ao vocabulário desta aula. Não é necessário adivinhar detalhes da imagem.');
  let index=0;
  const words=l.v.filter((v,i,a)=>a.findIndex(x=>x.en===v.en||x.pt===v.pt)===i);
  const targets=words.slice(0,3);
  function draw(){
    if(index===targets.length){gameDone('visual',l,'Você associou as três pistas ao vocabulário desta aula.');return}
    const target=targets[index],choices=shuffle([target,...words.filter(x=>x!==target).slice(index,index+3)]);
    // Wrap de distratores garante quatro escolhas em todas as aulas, sem duplicação.
    for(const v of words){if(choices.length>=4)break;if(!choices.includes(v)&&v!==target)choices.push(v)}
    $('#play').innerHTML=`<figure>${adaptiveLessonArt(l)}<figcaption>Ilustração temática da aula · não representa literalmente todas as palavras.</figcaption></figure><h4>Pista ${index+1}/3: ${esc(target.pt)}</h4><p>Qual legenda em inglês tem esse significado?</p><div class="visual-grid">${shuffle(choices).map(v=>`<button class="visual-option" data-scene="${v===target?1:0}" lang="en"><span>${esc(v.en)}</span></button>`).join('')}</div><p id="visualfeedback" role="status"></p><button id="visualnext" class="primary" hidden>Próxima pista</button>`;
    $('#play').querySelectorAll('[data-scene]').forEach(b=>b.onclick=()=>{
      if(b.dataset.scene==='1'){
        $('#play').querySelectorAll('[data-scene]').forEach(x=>x.disabled=true);b.classList.add('selected');
        $('#visualfeedback').textContent=`Boa! ${target.en} significa ${target.pt}.`;$('#visualnext').hidden=false;
      }else{b.classList.add('wrong');$('#visualfeedback').textContent='Essa legenda tem outro significado. Releia a pista e tente novamente.'}
    });
    $('#visualnext').onclick=()=>{index++;draw()};
  }
  draw();
};
dialogueGame=function(l){
  gameShell('Reconstrua o diálogo','Leia a conversa original desta aula. Em cada rodada, reconheça a fala que aparece logo depois do trecho destacado. As escolhas são trechos do próprio diálogo.');
  let n=0;
  const rounds=l.d.slice(1,4).map((line,i)=>({before:l.d[i],line,options:[line,...l.d.filter(x=>x!==line).slice(0,2)]}));
  function draw(){
    if(n===rounds.length){gameDone('dialogue',l,'Você reconstruiu três momentos da conversa desta aula.');return}
    const q=rounds[n];
    $('#play').innerHTML=`<details open><summary>Conversa da aula: ${esc(l.t)}</summary><div lang="en">${l.d.map(line=>`<p>${esc(line)}</p>`).join('')}</div></details><div class="bubble"><p>Rodada ${n+1}/3: qual fala vem imediatamente depois deste trecho na conversa acima?</p><p lang="en">${esc(q.before)}</p></div><div class="options">${shuffle(q.options.map((t,i)=>({t,i}))).map(o=>`<button class="option" data-dialoguechoice="${o.i}" lang="en">${esc(o.t)}</button>`).join('')}</div><p id="dialoguefeedback" role="status"></p><button class="primary" id="dialoguenext" hidden>Continuar conversa</button>`;
    $('#play').querySelectorAll('[data-dialoguechoice]').forEach(b=>b.onclick=()=>{
      if(b.dataset.dialoguechoice==='0'){
        b.classList.add('selected');$('#play').querySelectorAll('[data-dialoguechoice]').forEach(x=>x.disabled=true);
        $('#dialoguefeedback').textContent='Boa! Essa é a próxima fala do diálogo original. Leia as duas falas juntas para reconhecer a relação entre elas.';$('#dialoguenext').hidden=false;
      }else{b.classList.add('wrong');$('#dialoguefeedback').textContent='Essa fala aparece em outro momento. Consulte a conversa e observe a sequência.'}
    });
    $('#dialoguenext').onclick=()=>{n++;draw()};
  }
  draw();
};
gameTypes.find(g=>g.id==='visual').desc='Associe pistas às legendas do vocabulário da aula, com contexto ilustrado.';
gameTypes.find(g=>g.id==='dialogue').title='Reconstrua o diálogo';
gameTypes.find(g=>g.id==='dialogue').desc='Reconheça a sequência da conversa original desta aula.';
