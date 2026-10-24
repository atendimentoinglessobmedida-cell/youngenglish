const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const base=process.cwd();
const apps=[['Young','public','podcasts.js','podcast-data.js','podcast-model.js',false]];
function deferred(){let resolve;const promise=new Promise(r=>{resolve=r;});return {promise,resolve};}
function harness(config){
 const [,folder,player,data,model,blob]=config,requests=[],events={},media=[],urls=[],controls={};let buttons=[];
 class Audio{
  constructor(){this.paused=true;this.readyState=0;this.currentTime=0;this.src='';this.playCalls=0;this.error=null;media.push(this);}
  pause(){this.paused=true;this.onpause?.();}
  play(){this.playCalls++;this.paused=false;this.onplay?.();return Promise.resolve();}
  removeAttribute(){this.src='';}
  load(){}
 }
 const root={setAttribute(){},set innerHTML(value){
  for(const match of value.matchAll(/id="([a-z-]+)"/g))controls['#'+match[1]]={textContent:'',innerHTML:'',hidden:true};
  controls['#podcast-media']=new Audio();buttons=[0,1,2,3,4,5].map(i=>({dataset:{chapter:String(i)},setAttribute(){}}));
 },querySelector(selector){if(!controls[selector])throw Error(selector);return controls[selector];},querySelectorAll(selector){return selector==='[data-chapter]'?buttons:[];}};
 const window={addEventListener(name,fn){events[name]=fn;}};
 const context=vm.createContext({window,document:{getElementById:()=>root},location:{hash:''},history:{replaceState(){}},localStorage:{getItem:()=>null,setItem(){}},AbortController,URL:{createObjectURL(){const u='blob:test-'+urls.length;urls.push(u);return u;},revokeObjectURL(){}},fetch(url,{signal}){const task=deferred();requests.push({task,signal,url});return task.promise;}});
 for(const file of [data,model,player])vm.runInContext(fs.readFileSync(path.join(base,folder,file),'utf8'),context);
 return {controls,media,events,requests,buttons,get audio(){return media.at(-1);},blob};
}
const response=()=>({ok:true,headers:{get:name=>name==='content-type'?'audio/mpeg':'2000'},blob:async()=>({size:2000})});
for(const config of apps){
 test(config[0]+': selection and storage never start playback automatically',()=>{const h=harness(config);assert.equal(h.audio.playCalls,0);h.buttons[3].onclick();assert.equal(h.audio.playCalls,0);});
 if(!config[5])test(config[0]+': cancelling pending media playback does not display a connection error',async()=>{for(const action of ['stop','chapter','leave']){const h=harness(config);let reject;h.audio.play=()=>new Promise((_,r)=>{reject=r;});const playing=h.controls['#podcast-play'].onclick();if(action==='stop')h.controls['#podcast-stop'].onclick();else if(action==='chapter')h.buttons[3].onclick();else h.events.pagehide();reject(Error('Interrupted by user'));await playing;assert.ok(!/did not start|não iniciou/.test(h.controls['#podcast-status'].textContent),action);}});
 if(config[5]){
  test(config[0]+': selecting a chapter cancels an in-flight Play request',async()=>{const h=harness(config),old=h.audio;const playing=h.controls['#podcast-play'].onclick();assert.equal(h.requests.length,1);h.buttons[3].onclick();h.requests[0].task.resolve(response());await playing;assert.equal(old.playCalls,0);assert.equal(h.requests[0].signal.aborted,true);});
  test(config[0]+': Stop and language switch prevent late playback',async()=>{for(const action of ['stop','language']){const h=harness(config),old=h.audio;const playing=h.controls['#podcast-play'].onclick();if(action==='stop')h.controls['#podcast-stop'].onclick();else h.controls['#podcast-language'].onchange({target:{value:'pt'}});h.requests[0].task.resolve(response());await playing;assert.equal(old.playCalls,0);assert.equal(h.requests[0].signal.aborted,true);}});
  test(config[0]+': immediate retry after chapter cancellation uses a fresh request',async()=>{const h=harness(config);const first=h.controls['#podcast-play'].onclick();h.buttons[3].onclick();const second=h.controls['#podcast-play'].onclick();assert.equal(h.requests.length,2);h.requests[0].task.resolve(response());await first;assert.equal(h.audio.playCalls,0);h.requests[1].task.resolve(response());await second;assert.equal(h.audio.playCalls,1);});
 }
}
