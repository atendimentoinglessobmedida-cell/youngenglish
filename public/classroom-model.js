(function(root){
'use strict';
function create(config){
 const ids=new Set(config.lessons.map(l=>l.id)),apps=new Set(config.apps.map(a=>a.id));
 const str=(v,n)=>typeof v==='string'?v.slice(0,n):'';
 function normalize(raw,legacyApp){
  if(!raw||typeof raw!=='object')throw Error('Cópia inválida.');
  const old=raw.version===1,app=raw.app||legacyApp;
  if(old&&!apps.has(app))throw Error('Cópia de aplicativo desconhecido.');
  if(!old&&(raw.version!==2||raw.app!=='integrated'))throw Error('Cópia incompatível com a Sala integrada.');
  const map=id=>old?app+':'+id:id,current=map(raw.lesson);
  if(!ids.has(current))throw Error('Roteiro não encontrado nesta coleção.');
  const result={version:2,app:'integrated',lesson:current,duration:[30,45,60].includes(raw.duration)?raw.duration:45,mode:raw.mode==='study'?'study':'class',queue:[],choice:apps.has(raw.choice)?raw.choice:'',records:{}};
  result.queue=[...new Set((Array.isArray(raw.queue)?raw.queue:[]).filter(id=>ids.has(id)))].slice(0,4);
  for(const [key,r]of Object.entries(raw.records||{})){const id=map(key);if(!ids.has(id)||!r||typeof r!=='object')continue;result.records[id]={stage:Number.isInteger(r.stage)&&r.stage>=0&&r.stage<7?r.stage:0,notes:str(r.notes,4000),response:str(r.response,6000),homework:str(r.homework,2000),assessment:['support','independent','review'].includes(r.assessment)?r.assessment:'',review:r.review===true,closed:r.closed===true};}
  return result;
 }
 function budgets(total,queue){const n=Math.max(1,Math.min(4,queue.length)),base=Math.floor(total/n);return Array.from({length:n},(_,i)=>base+(i<total%n?1:0));}
 function minutes(total){const weights=[.1,.1,.15,.15,.2,.2,.1],values=weights.map(w=>1+Math.floor((total-7)*w));for(let i=0,n=total-values.reduce((a,b)=>a+b,0);i<n;i++)values[[4,5,2,3,0,1,6][i%7]]++;return values;}
 function shared(state,canonical){const url=new URL(canonical),route=state.queue.includes(state.lesson)?state.queue:[state.lesson];url.search=new URLSearchParams({lesson:state.lesson,duration:String(state.duration),mode:'study',route:route.join(',')}).toString();return url.href;}
 return {normalize,budgets,minutes,shared};
}
root.ISMClassroomModel={create};
})(typeof window==='undefined'?globalThis:window);
