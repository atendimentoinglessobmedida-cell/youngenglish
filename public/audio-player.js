// Shared playback: browser voice, no recording or transmission added.
(()=>{
 // Dialogue playback shared by the three ISM apps. Only English voices; no recording.
function parseDialogue(input) {
  if (Array.isArray(input)) return input.map(line => typeof line === 'string' ? parseDialogue(line) : [line]).flat();
  const text = String(input || '').trim();
  const pattern = /(?:^|\s)([A-Z][A-Za-z'’ -]{0,34}):\s+/g;
  const matches = [...text.matchAll(pattern)];
  if (!matches.length || matches[0].index !== 0) return text ? [{speaker:'Narrador',text,voiceSlot:0}] : [];
  return matches.map((match,index) => ({speaker:match[1].trim(),text:text.slice(match.index + match[0].length,matches[index+1]?.index ?? text.length).trim()}));
}

function createDialoguePlayer(options) {
  let generation=0,media=null,timer=null,utterance=null,last=[],lastSettings={};
  const publish=(state,index=-1,note='')=>options.publish?.({state,index,note,segments:last});
  function stop(silent=false) {
    generation++;clearTimeout(timer);timer=null;
    const speaking=!!utterance;
    if(media){media.onended=null;media.onerror=null;media.pause();media.removeAttribute('src');media.load();media=null;}
    if(utterance){utterance.onend=null;utterance.onerror=null;utterance.onstart=null;utterance=null;}
    if(speaking)options.synthesis?.cancel();if(!silent&&last.length)publish('stopped');
  }
  async function play(input,settings={}) {
    stop(true);options.cancelOther?.();
    const token=generation;
    const identities=[];
    last=parseDialogue(input).filter(line=>line.text?.trim()).map(line=>{
      const speaker=String(line.speaker||'Narrador');
      if(!identities.includes(speaker))identities.push(speaker);
      return {...line,speaker,voiceSlot:line.voiceSlot===0||line.voiceSlot===1?line.voiceSlot:identities.indexOf(speaker)%2};
    });
    lastSettings=settings;if(!last.length)return;
    publish('loading');
    const available=(await options.prepare()).filter(voice=>/^en(?:[-_]|$)/i.test(voice.lang));
    if(token!==generation)return;
    const a=available.find(voice=>voice.voiceURI===options.voiceA?.())||available.find(voice=>/^en-US$/i.test(voice.lang))||available[0];
    const b=available.find(voice=>voice.voiceURI===options.voiceB?.()&&voice!==a)||available.find(voice=>voice!==a)||a;
    const requested=Number(settings.rate??options.rate?.()??.85);
    const rate=Number.isFinite(requested)?Math.min(1.15,Math.max(.6,requested)):.85;
    const note=a===b?'Este aparelho oferece uma única voz em inglês; os personagens usam variações leves de ritmo e tom.':'Duas vozes em inglês, fixas por personagem.';
    let index=Number.isInteger(settings.from)?settings.from:0;
    const end=settings.single?index+1:last.length;
    const next=()=>{
      if(token!==generation)return;
      if(index>=end){publish('ended',-1,note);return;}
      const line=last[index];
      const complete=()=>{if(token!==generation)return;clearTimeout(timer);index++;timer=setTimeout(next,320);};
      let usedFallback=false;
      const fallback=()=>{
        if(token!==generation||usedFallback)return;
        usedFallback=true;
        clearTimeout(timer);
        if(media){media.onended=null;media.onerror=null;media.pause();media.removeAttribute('src');media.load();media=null;}
        const voice=line.voiceSlot===1?b:a;
        if(!voice||!options.synthesis||!options.makeUtterance){publish('error',index,'Nenhuma voz em inglês disponível. Use a transcrição ou ative inglês no aparelho.');return;}
        const u=options.makeUtterance(line.text);utterance=u;
        u.voice=voice;u.lang=voice.lang;u.rate=rate*(line.voiceSlot===1?.98:1);
        u.pitch=(line.voiceSlot===1?1.06:.97)+(line.text.endsWith('?')?.025:0);u.volume=1;
        timer=setTimeout(()=>{if(token===generation){stop(true);publish('error',index,'A voz não iniciou. Confira o aparelho e tente novamente.');}},12000);
        u.onstart=()=>{if(token!==generation)return;clearTimeout(timer);publish('playing',index,note);};
        u.onend=complete;
        u.onerror=()=>{if(token===generation){stop(true);publish('error',index,'Não foi possível reproduzir. Tente outra voz ou leia a transcrição.');}};
        try{options.synthesis.speak(u);}catch{u.onerror();}
      };
      // Files must already be served by this app, including protected routes for Premium.
      // Never copy protected URLs into a public manifest or persist signed URLs.
      let url;
      try{url=line.audioUrl?new URL(line.audioUrl,options.origin):null;}catch{url=null;}
      if(url&&url.origin===options.origin&&/^https?:$/.test(url.protocol)&&options.makeAudio){
        const audio=options.makeAudio(url.href);media=audio;audio.playbackRate=rate;
        audio.onended=complete;audio.onerror=fallback;
        timer=setTimeout(fallback,12000);
        Promise.resolve(audio.play()).then(()=>{if(token===generation&&media===audio){clearTimeout(timer);publish('playing',index,'Áudio gravado.');}}).catch(fallback);
      }else fallback();
    };
    next();
  }
  function clear(){stop(true);last=[];lastSettings={};publish('stopped');}
  return {play,stop,clear,repeat:()=>play(last,{...lastSettings,from:0,single:false}),line:index=>last[index]?play(last,{...lastSettings,from:index,single:true}):undefined};
}





 let dialogue=null,panel;let request=0,last='',rate=.85,voiceId='';
 const synth=window.speechSynthesis;
 function message(text){const status=document.getElementById('young-audio-status');if(status)status.textContent=text;}
 function stop(silent=false){dialogue?.stop();request++;if(synth)synth.cancel();if(!silent)message('Áudio parado.');}
 async function speak(text){
  lastDialogue=false;stop(true);last=String(text||'');if(!last)return;
  if(!synth||typeof SpeechSynthesisUtterance==='undefined'){message('Voz indisponível. Acompanhe pela transcrição.');return}
  const token=request;message('Preparando voz em inglês…');
  if(!synth.getVoices().length)await new Promise(resolve=>{let finished=false;const finish=()=>{if(finished)return;finished=true;synth.removeEventListener('voiceschanged',finish);clearTimeout(timer);resolve()};const timer=setTimeout(finish,900);synth.addEventListener('voiceschanged',finish)});
  if(token!==request)return;
  const voices=synth.getVoices().filter(v=>/^en(?:-|_)/i.test(v.lang));
  const voice=voices.find(v=>v.voiceURI===voiceId)||voices.find(v=>v.lang==='en-US')||voices[0];
  if(!voice){message('Nenhuma voz em inglês disponível. Consulte a transcrição ou ative uma voz em inglês no aparelho.');return}
  const utterance=new SpeechSynthesisUtterance(last);utterance.voice=voice;utterance.lang=voice.lang;utterance.rate=rate;
  const timeout=setTimeout(()=>{if(token===request){stop();message('A voz não iniciou. Verifique o aparelho e toque em Ouvir novamente.')}},12000);
  utterance.onstart=()=>{clearTimeout(timeout);if(token===request)message('Reproduzindo voz sintetizada.');};
  utterance.onend=()=>{clearTimeout(timeout);if(token===request)message('Áudio concluído.');};
  utterance.onerror=()=>{clearTimeout(timeout);if(token===request)message('Não foi possível reproduzir. Tente outra voz ou consulte a transcrição.');};
  try{synth.speak(utterance)}catch{clearTimeout(timeout);message('Reprodução indisponível. Consulte a transcrição.');}
 }
 function mount(){
  const main=document.querySelector('main');if(!main||document.getElementById('young-audio-controls'))return;
  panel=document.createElement('details');panel.id='young-audio-controls';panel.className='note';
  panel.innerHTML='<summary>Áudio · vozes e diálogo</summary><label>Voz em inglês <select id="young-audio-voice"></select></label><label>Segunda voz do diálogo <select id="young-audio-voice-b"></select></label><label>Velocidade <select id="young-audio-rate"><option value=".7">Lento</option><option value=".85" selected>Normal</option><option value="1">Velocidade original</option></select></label><button type="button" id="young-audio-repeat">Repetir</button><button type="button" id="young-audio-stop">Parar</button><p id="young-audio-status" role="status">A disponibilidade de voz e uso offline dependem do aparelho. Use a transcrição quando necessário.</p>';
  const rewards=main.querySelector('#rewardbar');if(rewards)rewards.after(panel);else main.prepend(panel);
  const refresh=()=>{const second=panel.querySelector('#young-audio-voice-b'),previous=second.value;second.replaceChildren(new Option('Automática · outra voz',''));for(const voice of synth?.getVoices()||[])if(/^en(?:-|_)/i.test(voice.lang))second.add(new Option(voice.name,voice.voiceURI));second.value=previous;const select=panel.querySelector('#young-audio-voice');select.replaceChildren(new Option('Automática · inglês',''));for(const voice of synth?.getVoices()||[])if(/^en(?:-|_)/i.test(voice.lang))select.add(new Option(voice.name,voice.voiceURI));select.value=voiceId;};refresh();synth?.addEventListener('voiceschanged',refresh);
  panel.querySelector('#young-audio-voice-b').onchange=()=>stop();panel.querySelector('#young-audio-voice').onchange=e=>{voiceId=e.target.value;stop()};panel.querySelector('#young-audio-rate').onchange=e=>{rate=Number(e.target.value);stop()};panel.querySelector('#young-audio-repeat').onclick=()=>lastDialogue?dialogue.repeat():speak(last);panel.querySelector('#young-audio-stop').onclick=()=>stop();
 }

 function updateDialogue(event){
  if(!panel)return;if(!event.segments.length){panel.querySelector("[data-dialogue]")?.remove();return;}let box=panel.querySelector('[data-dialogue]');
  if(!box){box=document.createElement('section');box.dataset.dialogue='';box.setAttribute('aria-label','Transcrição e falas do diálogo');panel.append(box);}
  if(event.state==='loading'){
   box.replaceChildren();const heading=document.createElement('p');heading.textContent='Diálogo · transcrição e reprodução por fala';box.append(heading);
   event.segments.forEach((line,index)=>{const row=document.createElement('p');row.lang='en';row.dataset.line=String(index);const label=document.createElement('span');label.textContent=line.speaker+': '+line.text;const button=document.createElement('button');button.type='button';button.textContent='Ouvir fala '+(index+1);button.onclick=()=>dialogue.line(index);row.append(label,button);box.append(row);});
  }
  box.querySelectorAll('[data-line]').forEach(row=>{const active=event.state==='playing'&&Number(row.dataset.line)===event.index;row.style.outline=active?'2px solid currentColor':'';if(active)row.setAttribute('aria-current','true');else row.removeAttribute('aria-current');});
  const labels={loading:'Preparando diálogo…',playing:'Reproduzindo '+(event.segments[event.index]?.speaker||'')+' · fala '+(event.index+1),ended:'Diálogo concluído.',stopped:'Áudio parado.',error:'Áudio indisponível.'};
  message(labels[event.state]+' '+event.note);
 }

 let lastDialogue=false;
 dialogue=createDialoguePlayer({synthesis:synth,origin:window.location?.origin||'http://localhost',prepare:async()=>{if(synth&&!synth.getVoices().length)await new Promise(resolve=>{let done=false;const finish=()=>{if(done)return;done=true;clearTimeout(wait);synth.removeEventListener('voiceschanged',finish);resolve()};const wait=setTimeout(finish,900);synth.addEventListener('voiceschanged',finish)});return synth?synth.getVoices():[]},makeUtterance:text=>new SpeechSynthesisUtterance(text),makeAudio:url=>new Audio(url),voiceA:()=>voiceId,voiceB:()=>panel?.querySelector('#young-audio-voice-b').value,rate:()=>rate,cancelOther:()=>stop(true),publish:updateDialogue});
 function clearDialogue(){stop();dialogue.clear();lastDialogue=false;last='';}
 window.ISMYoungAudio={speak,stop:clearDialogue,speakDialogue:(lines,settings={})=>{lastDialogue=true;return dialogue.play(lines,settings)}};window.addEventListener('hashchange',clearDialogue);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});window.addEventListener('pagehide',stop);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
