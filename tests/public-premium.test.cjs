const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../public');
test('public Premium catalogue contains only Basic samples and locked summaries',()=>{
 const lessons=vm.runInNewContext(fs.readFileSync(path.join(root,'premium-content.js'),'utf8')+';premiumLessons');assert.equal(lessons.length,70);assert.equal(lessons.filter(l=>l._sample).length,14);
 for(const l of lessons.filter(l=>l.level!=='Basic')){assert.equal(l._locked,true);assert.equal(l.d.length,0);assert.equal(l.q.length,0);assert.ok(l.v.every(v=>v.en===''&&v.pt===''));assert.ok(l.grammarExercises.every(q=>Object.keys(q).length===0));assert.equal(l.model,undefined);}
 assert.doesNotMatch(fs.readFileSync(path.join(root,'expansion-content.js'),'utf8'),/extra-premium\d/);
});
