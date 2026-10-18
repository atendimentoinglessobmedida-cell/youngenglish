(()=>{
 'use strict';
 const {shuffle,split,questions,record,voices}=window.ISMConversation,config=window.ISMConversationData;
 const $=id=>document.getElementById(id);let scene=config.scenes[0],mode='words',support=false,attempts={},generation=0,utterance=null,cancelCurrent=null;
 document.documentElement.style.setProperty('--brand',config.brand);document.title=config.name+' · Conversation Lab';$('app-name').textContent=config.name;
 $('intro-text').textContent=config.description;
 for(const item of config.scenes){const option=document.createElement('option');option.value=item.id;option.textContent=item.title+' · '+item.level;$('scene').append(option);}
 function element(tag,text,className){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(className)el.className=className;return el;}
 function button(text,run,parent,className){const b=element('button',text,className);b.type='button';b.onclick=run;parent.append(b);return b;}
 function stop(){generation++;cancelCurrent?.();cancelCurrent=null;if('speechSynthesis'in window)window.speechSynthesis.cancel();utterance=null;}
 async function speak(lines){
  stop();const stamp=generation;
  if(!('speechSynthesis'in window)||!('SpeechSynthesisUtterance'in window)){$('audio-status').textContent='Audio is unavailable. Read the transcript and practise with a partner. / Áudio indisponível: use o texto.';return;}
  const chosen=voices(window.speechSynthesis.getVoices());
  if(!chosen[0]){$('audio-status').textContent='No English voice is available yet. Try again after installing an English voice on your device, or read the transcript. / Sem voz em inglês disponível.';return;}
  const speakers=[...new Set(scene.d.map(line=>split(line)[0].split(':')[0]))];
  const limitation=chosen[0].voiceURI===chosen[1].voiceURI?' Only one English voice is available; the characters share it.':'';
  $('audio-status').textContent='Playing synthetic audio.'+limitation;
  for(const line of lines){
   if(stamp!==generation)return;const colon=line.indexOf(':'),speaker=colon>=0?line.slice(0,colon):'',text=colon>=0?line.slice(colon+1).trim():line,slot=Math.max(0,speakers.indexOf(speaker))%2;
   const completed=await new Promise(resolve=>{
    utterance=new SpeechSynthesisUtterance(text);utterance.lang=chosen[slot].lang;utterance.voice=chosen[slot];utterance.rate=Number($('speed').value);utterance.pitch=(slot===0?1.04:.95)+(/\?$/.test(text)?.06:0);
    let finished=false;const finish=success=>{if(finished)return;finished=true;clearTimeout(timer);cancelCurrent=null;resolve(success);};
    const timer=setTimeout(()=>finish(false),Math.max(15000,text.length*160));cancelCurrent=()=>finish(false);
    utterance.onend=()=>finish(true);utterance.onerror=()=>finish(false);window.speechSynthesis.speak(utterance);
   });
   if(stamp!==generation)return;if(!completed){stop();$('audio-status').textContent='Playback could not finish. Try one line or use the transcript. / Não foi possível concluir o áudio.';return;}
  }
  if(stamp===generation)$('audio-status').textContent='Playback complete.'+limitation;
 }
 function translated(parent,pt){if(support)parent.append(element('p',pt,'meaning'));}
 function render(){
  stop();$('audio-status').textContent='Audio starts only when you press Play. Voices vary by device. / O áudio depende das vozes do aparelho.';
  $('title').textContent=scene.title;$('goal').textContent=scene.level+' · '+scene.goal;const host=$('activity');host.replaceChildren();
  document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));
  if(mode==='words'){
   host.append(element('h2','1. Retrieve useful language'));host.append(element('p','Read each expression, listen and try to explain its meaning before opening Portuguese support.'));
   const grid=element('div',undefined,'grid');scene.v.forEach(value=>{const [en,pt]=split(value),card=element('article',undefined,'card');card.append(element('h3',en));translated(card,pt);button('Play: '+en,()=>void speak([en]),card);grid.append(card);});host.append(grid);
  }
  if(mode==='dialogue'){
   host.append(element('h2','2. Follow the conversation'));host.append(element('p','Predict the next reply. Listen again and notice how each speaker responds.'));
   button('Play full dialogue',()=>void speak(scene.d.map(line=>split(line)[0])),host,'primary');
   scene.d.forEach((value,index)=>{const [en,pt]=split(value),card=element('div',undefined,'bubble'+(index%2?' alternate':''));card.append(element('p',en));translated(card,pt);button('Play line '+(index+1),()=>void speak([en]),card);host.append(card);});
  }
  if(mode==='questions'){
   host.append(element('h2','3. Check meaning and understanding'));host.append(element('p','A wrong answer stays available for review. Correct answers are counted once. This is practice, not a proficiency grade.'));
   const summary=element('p',undefined,'badge');summary.setAttribute('role','status');host.append(summary);
   const update=()=>{const entries=Object.values(attempts);summary.textContent=entries.filter(x=>x.solved).length+'/10 solved · '+entries.filter(x=>x.firstTry).length+' correct on first attempt.';};
   questions(scene).forEach((q,index)=>{const item=element('section',undefined,'question'),options=element('div',undefined,'actions'),feedback=element('p','', 'feedback');feedback.setAttribute('role','status');item.append(element('h3',(index+1)+'. '+q.prompt));
    shuffle(q.options).forEach(option=>{button(option,()=>{const correct=option===q.answer;attempts=record(attempts,index,correct);feedback.textContent=correct?'Correct. '+q.feedback:'Try again. '+q.feedback;if(correct)options.querySelectorAll('button').forEach(b=>b.disabled=true);update();},options);});
    if(attempts[index]?.solved){options.querySelectorAll('button').forEach(b=>b.disabled=true);feedback.textContent='Already solved in this session. '+q.feedback;}item.append(options,feedback);host.append(item);});update();
  }
  if(mode==='memory'){
   host.append(element('h2','4. Match expression and meaning'));host.append(element('p','Match one English expression with its Portuguese meaning. Flip two cards, then continue. There is no time limit.'));
   const status=element('p','0/8 pairs found.','feedback');status.setAttribute('role','status');const board=element('div',undefined,'memory');let selected=[],matched=0,tries=0;
   shuffle(scene.v.flatMap((value,pair)=>split(value).map((text,side)=>({pair,text,side})))).forEach((card,index)=>{
    const b=button('Card '+(index+1),()=>{
     if(b.dataset.matched||selected.some(s=>s.button===b))return;
     if(selected.length===2){selected.forEach(s=>{s.button.textContent='Card '+(s.index+1);s.button.setAttribute('aria-pressed','false');});selected=[];}
     b.textContent=card.text;b.setAttribute('aria-pressed','true');selected.push({...card,button:b,index});
     if(selected.length===2){tries++;if(selected[0].pair===selected[1].pair&&selected[0].side!==selected[1].side){matched++;selected.forEach(s=>{s.button.dataset.matched='true';s.button.classList.add('matched');s.button.disabled=true;});selected=[];status.textContent=matched+'/8 pairs found · '+tries+' pair attempts.';}else status.textContent='These do not match. Read both, then choose another card.';}
    },board);b.setAttribute('aria-pressed','false');
   });host.append(status,board);button('Restart memory game',render,host);
  }
  if(mode==='sequence'){
   host.append(element('h2','5. Rebuild the dialogue'));host.append(element('p','Choose all eight lines in the order that makes a coherent conversation. You can consult the dialogue first.'));
   const result=element('ol',undefined,'sequence-result'),bank=element('div',undefined,'sequence'),status=element('p','', 'feedback');status.setAttribute('role','status');let order=[];
   shuffle(scene.d.map((line,index)=>({line:split(line)[0],index}))).forEach(item=>{const b=button(item.line,()=>{order.push(item.index);b.disabled=true;result.append(element('li',item.line));},bank);});
   host.append(result,bank,status);button('Check sequence',()=>{if(order.length!==8){status.textContent='Choose all eight lines before checking.';return;}status.textContent=order.every((value,index)=>value===index)?'The sequence matches the model. Now explain why each reply follows the previous line.':'Compare the first difference with the Dialogue tab, then restart and try again.';},host,'primary');button('Restart sequence',render,host);
  }
  if(mode==='roles'){
   host.append(element('h2','6. Practise both roles'));host.append(element('p','Choose a role to play. Say each hidden line before revealing it. Then swap roles and change the situation. The app does not record or assess your voice.'));
   const roleSelect=document.createElement('select');roleSelect.setAttribute('aria-label','Your role');[...new Set(scene.d.map(value=>split(value)[0].split(':')[0]))].forEach(name=>{const option=element('option',name);option.value=name;roleSelect.append(option);});const lines=element('div');
   function draw(){stop();lines.replaceChildren();scene.d.forEach((value,index)=>{const [en,pt]=split(value),card=element('div',undefined,'bubble'+(index%2?' alternate':''));if(en.startsWith(roleSelect.value+':')){const details=document.createElement('details');details.append(element('summary',roleSelect.value+': say your reply, then reveal'),element('p',en));translated(details,pt);card.append(details);}else{card.append(element('p',en));translated(card,pt);}button('Play model line '+(index+1),()=>void speak([en]),card);lines.append(card);});}
   roleSelect.onchange=draw;host.append(roleSelect,lines);draw();host.append(element('h3','Transfer challenge'),element('p',scene.challenge),element('p','Self-check: Did I communicate the goal? Did I respond to my partner? Which expression will I practise again?','note'));
  }
 }
 $('scene').onchange=()=>{scene=config.scenes.find(item=>item.id===$('scene').value);attempts={};render();};$('support').onchange=()=>{support=$('support').checked;render();};$('stop').onclick=()=>{stop();$('audio-status').textContent='Stopped. / Reprodução interrompida.';};$('speed').onchange=stop;
 document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.mode;render();});window.addEventListener('pagehide',stop);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});render();
})();
