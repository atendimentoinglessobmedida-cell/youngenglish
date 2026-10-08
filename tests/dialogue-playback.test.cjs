const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const path=require('node:path');
// Validate the code actually shipped inside each app, with controllable voices/media/time.
const base=path.resolve(__dirname,'..');
const candidates=['public/audio-player.js'];
for(const candidate of candidates){
 const source=fs.readFileSync(path.join(base,candidate),'utf8');
 const start=source.indexOf('// Dialogue playback shared'),end=source.search(/\n\s*(?:const synth=window|let dialogue=null)/);
 const engine=(end>=0?source.slice(start,end):source).replaceAll('export function','function');
 function fixture(voices=[{lang:'en-US',voiceURI:'a'},{lang:'en-GB',voiceURI:'b'}]){
  const calls=[],events=[],timers=new Map();let timerId=0;
  const context={URL,setTimeout:fn=>{timers.set(++timerId,fn);return timerId},clearTimeout:id=>timers.delete(id)};
  vm.runInNewContext(engine+'\nthis.factory=createDialoguePlayer;this.parse=parseDialogue;',context);
  const api=context.factory({synthesis:{cancel(){},speak:u=>calls.push(u)},origin:'https://ism.test',prepare:async()=>voices,makeUtterance:text=>({text}),publish:e=>events.push(e),makeAudio:url=>{const audio={url,pause(){this.paused=true},removeAttribute(){},load(){},play(){calls.push(this);return Promise.resolve()}};return audio;}});
  const pause=()=>{const entries=[...timers];timers.clear();for(const [,fn] of entries)fn();};
  return {api,calls,events,pause,parse:context.parse};
 }
 test(candidate+': speaker identity stays fixed across consecutive turns and names are not spoken',async()=>{
  const f=fixture();assert.equal(f.calls.length,0);
  await f.api.play('Alex: Hello. Alex: Could you help? Bea: Certainly. Alex: Thank you.');
  assert.equal(f.calls[0].text,'Hello.');assert.equal(f.calls[0].voice.voiceURI,'a');
  f.calls[0].onend();f.pause();assert.equal(f.calls[1].voice.voiceURI,'a');
  f.calls[1].onend();f.pause();assert.equal(f.calls[2].voice.voiceURI,'b');
  f.calls[2].onend();f.pause();assert.equal(f.calls[3].voice.voiceURI,'a');
  f.api.stop();f.pause();assert.equal(f.calls.length,4);
 });
 test(candidate+': explicit role survives individual playback; repeat and line playback preserve whole transcript',async()=>{
  const f=fixture();const lines=[{speaker:'Traveler',text:'Hello',voiceSlot:0},{speaker:'Attendant',text:'Welcome',voiceSlot:1}];
  await f.api.play(lines);await f.api.line(1);assert.equal(f.calls.at(-1).voice.voiceURI,'b');assert.equal(f.events.at(-1).segments.length,2);
  await f.api.repeat();assert.equal(f.calls.at(-1).text,'Hello');f.api.stop();
 });
 test(candidate+': one English voice reports fallback; Portuguese never substitutes',async()=>{
  const f=fixture([{lang:'en-US',voiceURI:'a'}]);await f.api.play(['Alex: Hello','Bea: Welcome']);f.calls[0].onstart();assert.match(f.events.at(-1).note,/única voz/);f.api.stop();
  const none=fixture([{lang:'pt-BR',voiceURI:'p'}]);await none.api.play(['Alex: Hello']);assert.equal(none.calls.length,0);assert.equal(none.events.at(-1).state,'error');
 });
 test(candidate+': cancel during voice loading prevents late speech',async()=>{
  let resolve;const f=fixture();const context={URL,setTimeout,clearTimeout};vm.runInNewContext(engine+'\nthis.factory=createDialoguePlayer;',context);
  const api=context.factory({synthesis:{cancel(){},speak:u=>f.calls.push(u)},origin:'https://ism.test',prepare:()=>new Promise(done=>resolve=done),makeUtterance:text=>({text})});
  const waiting=api.play('Alex: Hello');api.stop();resolve([{lang:'en-US'}]);await waiting;assert.equal(f.calls.length,0);
 });
 test(candidate+': failed same-origin file falls back; external URL is not requested; stopped files stay silent',async()=>{
  const f=fixture();await f.api.play([{speaker:'Alex',text:'Hello',audioUrl:'/audio/hello.mp3'}]);await Promise.resolve();assert.equal(f.calls[0].url,'https://ism.test/audio/hello.mp3');f.calls[0].onerror();assert.equal(f.calls[1].text,'Hello');f.api.stop();
  const external=fixture();await external.api.play([{speaker:'Alex',text:'Hello',audioUrl:'https://outside.test/a.mp3'}]);assert.equal(external.calls[0].text,'Hello');external.api.stop();
  const stopped=fixture();await stopped.api.play([{speaker:'Alex',text:'Hello',audioUrl:'/audio/a.mp3'}]);stopped.api.stop();await Promise.resolve();assert.equal(stopped.calls[0].paused,true);stopped.pause();assert.equal(stopped.calls.length,1);
 });
}
