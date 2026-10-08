const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../public/premium-content.js'),'utf8');
const lessons=vm.runInNewContext(source+';premiumLessons');
test('sports and gaming missions match their own contexts across five levels',()=>{
 const sports=lessons.filter(x=>x.theme==='sports'),gaming=lessons.filter(x=>x.theme==='gaming');
 assert.equal(sports.length,5);assert.equal(gaming.length,5);
 for(const x of [...sports,...gaming]){
  assert.ok(x.mission&&x.canDo&&x.finalChallenge&&x.listenPrompt&&x.speakingPrompt&&x.reviewPrompt);
  assert.doesNotMatch(x.canDo+' '+x.finalChallenge,/instrumentos|banda|ensaio|musical|melodia/);
 }
 assert.match(sports[0].canDo,/esportes/);assert.match(gaming[0].canDo,/jogo/);
 assert.match(sports[4].finalChallenge,/evento/);assert.match(gaming[4].finalChallenge,/jogo/);
});
