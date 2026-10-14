const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),read=name=>fs.readFileSync(fs.existsSync(path.join(root,'server/private/authoring',name))?path.join(root,'server/private/authoring',name):path.join(root,'public',name),'utf8');
const context=vm.createContext({location:{pathname:'/index.html',protocol:'https:'},localStorage:{getItem:()=>null}});
const run=source=>vm.runInContext(source,context,{timeout:2000});
run("var levelCatalog=[], stageNames=['','','','','',''], selectedLevel, view='levels', current=0, step=0;");
for(const file of ['content.js','advanced.js'])run(read(file));
const levels=read('level-pages.js'),boundary=levels.indexOf('const oldVisualBasic=');
assert.ok(boundary>0,'Catalog initialization boundary missing');run(levels.slice(0,boundary));
for(const file of ['premium-content.js','expansion-content.js','expansion-integrate.js','elementary-content.js','practice-content.js','quality-content.js'])run(read(file));
const data=JSON.parse(JSON.stringify(vm.runInContext('({regular:lessons,premium:premiumLessons,criteria:writingCriteria})',context)));
const ids=[...data.regular,...data.premium].map(l=>l.id);
run(read('video-content.js'));
run(read('games.js').match(/const gameTypes=([\s\S]*?);/)[0]);
for(const file of ['more-games.js','learning-games.js'])for(const push of read(file).matchAll(/gameTypes\.push\([\s\S]*?\);/g))run(push[0]);
const activityCatalog=JSON.parse(JSON.stringify(vm.runInContext('({videos:videoMissions.map(x=>x.id),games:gameTypes.map(x=>x.id)})',context)));
assert.ok(activityCatalog.games.length>=15,'All current game types must be preserved');
assert.equal(new Set(activityCatalog.games).size,activityCatalog.games.length,'Duplicate game types');
const activityKeys={answer:[],draft:[],game:[],achievement:[]};
for(const id of ids){activityKeys.draft.push(id);for(const suffix of ['q0','q1','q2','q3','word0','word1','word2','listen','order','grammar0','grammar1','grammar2','spoken','reviewed','created','completed']){activityKeys.answer.push(id+':'+suffix);activityKeys.draft.push(id+':'+suffix)}for(const game of activityCatalog.games)activityKeys.game.push(id+':'+game)}
for(const id of activityCatalog.videos){activityKeys.draft.push('video-'+id);for(const suffix of ['q0','q1','q2','q3','q4','grammar','watched','read','check0','check1','check2','completed']){activityKeys.answer.push('video-'+id+':'+suffix);activityKeys.draft.push('video-'+id+':'+suffix)}}
for(let i=0;i<=6;i++){activityKeys.draft.push('project-'+i);for(let j=0;j<=4;j++){activityKeys.answer.push(`project-${i}:${j}`);activityKeys.draft.push(`project-${i}:${j}`)}}
for(const mode of ['explore','practice','create'])for(const theme of ['cinema','comics','series','books','travel','music'])activityKeys.achievement.push(mode+':'+theme);
fs.writeFileSync(path.join(root,'server/young-activity-keys.json'),JSON.stringify(activityKeys,null,2)+'\n');
assert.equal(new Set(ids).size,ids.length,'Duplicate lesson IDs');
assert.ok(ids.every(id=>/^[a-z0-9-]{1,100}$/.test(id)),'Unsafe lesson IDs');
assert.equal(data.premium.length,70);assert.equal(data.regular.length,96);
const directory=path.join(root,'server/private');fs.mkdirSync(directory,{recursive:true});
const catalog={lessons:[...data.regular,...data.premium].map(l=>({id:l.id,title:l.t,level:l.level,premium:!!l.premium})),regular:data.regular,premium:data.premium,writingCriteria:data.criteria,themes:JSON.parse(JSON.stringify(vm.runInContext('premiumThemes',context)))};
fs.writeFileSync(path.join(directory,'young-catalog.json'),JSON.stringify(catalog,null,2)+'\n');
fs.writeFileSync(path.join(root,'server/young-lesson-ids.json'),JSON.stringify(ids,null,2)+'\n');
const values=data.premium.map((lesson,index)=>{const content=JSON.stringify(lesson),tag='$asset_'+crypto.createHash('sha256').update(content).digest('hex').slice(0,12)+'$';assert.ok(!content.includes(tag));return `('${lesson.id}',${index},${tag}${content}${tag}::jsonb)`;});
fs.writeFileSync(path.join(directory,'seed-premium.sql'),'-- Private course data: apply only to the dedicated Young backend; do not publish to Git.\ninsert into young_private.premium_lessons(lesson_id,position,content) values\n'+values.join(',\n')+'\non conflict(lesson_id) do update set position=excluded.position,content=excluded.content,updated_at=now();\n');
const migrations=path.join(root,'supabase/migrations');fs.mkdirSync(migrations,{recursive:true});
fs.writeFileSync(path.join(migrations,'202610120002_young_lesson_ids.sql'),
 '-- Dedicated Young project only. Generated from the reviewed course source.\n'+
 'insert into young_private.lesson_ids(lesson_id) values\n'+ids.map(id=>`('${id}')`).join(',\n')+'\non conflict(lesson_id) do nothing;\n');
console.log(JSON.stringify({regular:data.regular.length,premium:data.premium.length,ids:ids.length,status:'prepared locally; public demo unchanged'}));
