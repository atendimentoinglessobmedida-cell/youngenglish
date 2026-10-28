const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),folder=fs.existsSync(path.join(root,'web/debate.html'))?'web':fs.existsSync(path.join(root,'public/debate.html'))?'public':'.',publicRoot=path.join(root,folder),units=require('./debate/content.cjs'),model=require('./debate/model.cjs');
test('three complete lessons progress through B1, B2 and C1 with distinct topics and fourteen bilingual turns',()=>{
 assert.deepEqual(units.map(x=>x.level),['B1','B2','C1']);assert.equal(new Set(units.map(x=>x.id)).size,3);
 for(const unit of units){
  assert.deepEqual(model.coverage(unit),{recycled:8,newItems:6,dialogueTurns:14,questions:6,grammar:3});assert.equal(unit.speakers.length,2);assert.notEqual(...unit.speakers);
  for(const key of ['title','goal','review','grammar','task','outcome','teacher']){const p=model.pair(unit[key]);assert.ok(p.en.length>10&&p.pt.length>10,key);}
  for(const text of [...unit.warm,...unit.dialogue,...unit.functions,...unit.roles,...unit.constraints,...unit.questions.flat()]){const p=model.pair(text);assert.ok(p.en&&p.pt);assert.ok(!/\.\.\.|implemente aqui|placeholder/i.test(text));}
  for(const [term,meaning,example]of unit.words){assert.ok(term&&meaning&&example.length>20);}
  assert.equal(new Set(unit.questions.map(x=>x[0])).size,6);
  for(const item of unit.checks){assert.equal(new Set(item[1]).size,3);assert.ok(Number.isInteger(item[2])&&item[2]>=0&&item[2]<3);assert.equal(model.check(item,item[2]).correct,true);assert.equal(model.check(item,(item[2]+1)%3).correct,false);assert.equal(model.check(item,-1),null);}
  assert.ok(fs.existsSync(path.join(publicRoot,unit.reviewLink.split('#')[0])),'related course page exists');
 }
});
test('all four pages use different existing cover images and load accessible controls',()=>{
 const hashes=new Set();
 for(const id of ['cover',...units.map(x=>x.id)]){
  const file=id==='cover'?'debate.html':'debate-'+id+'.html',html=fs.readFileSync(path.join(publicRoot,file),'utf8');
  assert.ok(html.includes('lang="en"'));assert.ok(html.includes('id="support"'));assert.ok(html.includes('aria-live="polite"'));assert.ok(html.includes('width="960" height="640"'));assert.ok(!/autoplay|<iframe/i.test(html));
  const bytes=fs.readFileSync(path.join(publicRoot,'assets/debate/'+id+'-v1.webp'));assert.equal(bytes.toString('ascii',8,12),'WEBP');assert.ok(bytes.length>10000);hashes.add(crypto.createHash('sha256').update(bytes).digest('hex'));
  for(const [,url]of html.matchAll(/(?:src|href)="([^"#?]+)"/g)){if(/^[a-z]+:/.test(url)||url.startsWith('/'))continue;assert.ok(fs.existsSync(path.join(publicRoot,url)),url);}
 }
 assert.equal(hashes.size,4);
});
test('saved notes are isolated by lesson and reject malformed or unexpected data',()=>{
 assert.deepEqual(model.draft({unitId:'other',answers:{'debate-0':'Private'}},units[0].id),{});
 assert.deepEqual(model.draft({unitId:units[0].id,answers:null},units[0].id),{});
 assert.deepEqual(model.draft({unitId:units[0].id,answers:{'debate-0':'My view',token:'secret','debate-1':'x'.repeat(4001)}},units[0].id),{'debate-0':'My view'});
 const source=fs.readFileSync(path.join(publicRoot,'debate.js'),'utf8');new vm.Script(source);assert.ok(source.includes('if(!saveEnabled)return'));assert.ok(source.includes('if(!config.protected)'));assert.ok(source.includes("window.addEventListener('pagehide'"));assert.ok(!/getUserMedia|MediaRecorder|\.speechRecognition|fetch\([^)]*https:/.test(source));
});
test('the entry point is reachable from the app and the existing conversation lab',()=>{
 for(const file of ['index.html','conversation-lab.html'])assert.ok(fs.readFileSync(path.join(publicRoot,file),'utf8').includes('debate-entry.js'));
 const source=fs.readFileSync(path.join(publicRoot,'debate-entry.js'),'utf8');assert.ok(source.includes("link.href='debate.html'"));
 if(folder==='web'){
  assert.equal(fs.existsSync(path.join(publicRoot,'debate-data.js')),false,'protected lessons have no public data bundle');
  const html=fs.readFileSync(path.join(publicRoot,'debate-city-life.html'),'utf8');assert.ok(!html.includes(units[0].dialogue[0].split('|')[0]));
 }
});
test('all 60 neural clips preserve exact transcripts, stable voices and matching file hashes',()=>{
 const report=require('./debate/media.json'),voices=new Map();assert.equal(report.length,60);
 const privateClips=folder==='web'?JSON.parse(fs.readFileSync(path.join(root,'lib/debate-audio-private.json'))):null;
 for(const unit of units)for(const [turn,text]of unit.dialogue.entries()){
  const record=report.find(x=>x.unitId===unit.id&&x.turn===turn&&x.kind==='turn');assert.ok(record);assert.equal(record.text,text.split('|')[0]);assert.equal(record.speaker,unit.speakers[turn%2]);assert.equal(record.humanReviewed,false);
  const bytes=privateClips?Buffer.from(privateClips['debate-'+unit.id+'-turn-'+turn],'base64'):fs.readFileSync(path.join(publicRoot,'assets/debate-audio/'+unit.id+'-turn-'+turn+'.mp3'));
  assert.equal(bytes.length,record.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),record.sha256);
  if(voices.has(record.speaker))assert.equal(voices.get(record.speaker),record.voice);voices.set(record.speaker,record.voice);
 }
 for(const unit of units)assert.notEqual(voices.get(unit.speakers[0]),voices.get(unit.speakers[1]));
 for(const unit of units)for(const [index,[term,,example]]of unit.words.entries()){const record=report.find(x=>x.unitId===unit.id&&x.turn===index&&x.kind==='word');assert.equal(record.text,term+'. '+example);const bytes=privateClips?Buffer.from(privateClips['debate-'+unit.id+'-word-'+index],'base64'):fs.readFileSync(path.join(publicRoot,'assets/debate-audio/'+unit.id+'-word-'+index+'.mp3'));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),record.sha256);}
});
