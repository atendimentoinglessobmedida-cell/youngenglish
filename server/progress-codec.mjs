import ids from './young-lesson-ids.json' with {type:'json'};
import keys from './young-activity-keys.json' with {type:'json'};
const lessons=new Set(ids),catalog=Object.fromEntries(Object.entries(keys).map(([kind,values])=>[kind,new Set(values)]));
const invalid=()=>{const error=new Error('Progresso ou atividade inválidos.');error.status=400;throw error};
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
function fields(value,names){if(!object(value)||Object.keys(value).length!==names.length||names.some(name=>!Object.hasOwn(value,name)))invalid();}
function list(value,allowed,max){if(!Array.isArray(value)||value.length>max||value.some(x=>typeof x!=='string'||!allowed.has(x)))invalid();return [...new Set(value)];}
function map(value,allowed,test){if(!object(value)||Object.keys(value).length>4000)invalid();for(const[key,item]of Object.entries(value))if(!allowed.has(key)||!test(item))invalid();return {...value};}
export function validateYoungCloudProgress(payload){
 fields(payload,['version','done','drafts','study']);if(payload.version!==2)invalid();
 const study=payload.study;fields(study,['points','answers','stars','gameWins','themeAchievements','missionMode','age','resume']);
 if(!Number.isFinite(study.points)||study.points<0||study.points>=1000000||!['explore','practice','create'].includes(study.missionMode)||!['kids','teens'].includes(study.age))invalid();
 if(study.resume!==null){fields(study.resume,['id','step']);if(!lessons.has(study.resume.id)||!Number.isInteger(study.resume.step)||study.resume.step<0||study.resume.step>5)invalid();}
 const clean={version:2,done:list(payload.done,lessons,500),drafts:map(payload.drafts,catalog.draft,x=>typeof x==='string'&&x.length<=20000),study:{points:study.points,answers:map(study.answers,catalog.answer,x=>typeof x==='boolean'),stars:map(study.stars,lessons,x=>Number.isInteger(x)&&x>=1&&x<=3),gameWins:list(study.gameWins,catalog.game,3000),themeAchievements:list(study.themeAchievements,catalog.achievement,18),missionMode:study.missionMode,age:study.age,resume:study.resume===null?null:{...study.resume}}};
 if(new TextEncoder().encode(JSON.stringify(clean)).length>250000)invalid();return clean;
}
export function snapshotToCloud(snapshot){
 if(!object(snapshot)||snapshot.version!==4)invalid();
 return validateYoungCloudProgress({version:2,done:snapshot.done,drafts:snapshot.drafts,study:Object.fromEntries(['points','answers','stars','gameWins','themeAchievements','missionMode','age','resume'].map(key=>[key,snapshot[key]]))});
}
export function cloudToSnapshot(payload,local){
 if(!object(local)||local.version!==4)invalid();
 if(payload?.version===1){
   // Older records contain only completion and writing; preserve device game state.
   const done=list(payload.done,lessons,500),drafts=map(payload.drafts,lessons,x=>typeof x==='string'&&x.length<=20000);
   return {...local,done,drafts:{...local.drafts,...drafts}};
 }
 const clean=validateYoungCloudProgress(payload);
 // Device display filters and app schema stay local. Identity/license never enter.
 return {...local,...clean.study,version:4,done:clean.done,drafts:clean.drafts};
}
