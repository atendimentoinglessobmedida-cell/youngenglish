// Shared playback: browser voice, no recording or transmission added.
(()=>{
 let request=0,last='',rate=.85,voiceId='';
 const synth=window.speechSynthesis;
 function message(text){const status=document.getElementById('young-audio-status');if(status)status.textContent=text;}
 function stop(){request++;if(synth)synth.cancel();message('Áudio parado.');}
 async function speak(text){
  stop();last=String(text||'');if(!last)return;
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
  const panel=document.createElement('details');panel.id='young-audio-controls';panel.className='note';
  panel.innerHTML='<summary>Áudio · voz sintetizada do aparelho</summary><label>Voz em inglês <select id="young-audio-voice"></select></label><label>Velocidade <select id="young-audio-rate"><option value=".7">Lento</option><option value=".85" selected>Normal</option><option value="1">Velocidade original</option></select></label><button type="button" id="young-audio-repeat">Repetir</button><button type="button" id="young-audio-stop">Parar</button><p id="young-audio-status" role="status">A disponibilidade de voz e uso offline dependem do aparelho. Use a transcrição quando necessário.</p>';
  const rewards=main.querySelector('#rewardbar');if(rewards)rewards.after(panel);else main.prepend(panel);
  const refresh=()=>{const select=panel.querySelector('#young-audio-voice');select.replaceChildren(new Option('Automática · inglês',''));for(const voice of synth?.getVoices()||[])if(/^en(?:-|_)/i.test(voice.lang))select.add(new Option(voice.name,voice.voiceURI));select.value=voiceId;};refresh();synth?.addEventListener('voiceschanged',refresh);
  panel.querySelector('#young-audio-voice').onchange=e=>{voiceId=e.target.value;stop()};panel.querySelector('#young-audio-rate').onchange=e=>{rate=Number(e.target.value);stop()};panel.querySelector('#young-audio-repeat').onclick=()=>speak(last);panel.querySelector('#young-audio-stop').onclick=stop;
 }
 window.ISMYoungAudio={speak,stop};document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});window.addEventListener('pagehide',stop);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
