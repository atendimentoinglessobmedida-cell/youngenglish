const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),folder=path.join(root,'server/private'),catalog=JSON.parse(fs.readFileSync(path.join(folder,'young-catalog.json'),'utf8'));
const authoring=path.join(folder,'authoring');fs.mkdirSync(authoring,{recursive:true});
for(const name of ['premium-content.js','expansion-content.js','quality-content.js']){const backup=path.join(authoring,name);if(!fs.existsSync(backup))fs.copyFileSync(path.join(root,'public',name),backup);}
const allowed=['id','t','level','cefr','theme','module','o','mission','skill','canDo','grammarTopic','finalChallenge','listenPrompt','speakingPrompt','reviewPrompt'];
const premium=catalog.premium.map(l=>l.level==='Basic'?{...l,_sample:true}:({...Object.fromEntries(allowed.filter(k=>k in l).map(k=>[k,l[k]])),premium:true,_locked:true,v:Array.from({length:8},()=>({en:'',pt:''})),q:[],d:[],tr:[],grammarExercises:[{},{},{}]}));
fs.writeFileSync(path.join(root,'public/premium-content.js'),'// Public catalogue and Basic samples only. Paid exercises are delivered by the dedicated API.\nconst premiumThemes='+JSON.stringify(catalog.themes)+';\nconst premiumGrammar=[];\nconst premiumLessons='+JSON.stringify(premium)+';\n');
const extra=catalog.regular.filter(l=>l.id.startsWith('extra-free'));
if(extra.length!==30)throw Error('Expansion regular catalogue mismatch: '+extra.length);
fs.writeFileSync(path.join(root,'public/expansion-content.js'),'const expansionFree='+JSON.stringify(extra)+'; const expansionPremium=[];\n');
fs.writeFileSync(path.join(root,'public/quality-content.js'),'const writingCriteria='+JSON.stringify(catalog.writingCriteria)+';\n');
console.log(JSON.stringify({regular:catalog.regular.length,premium:premium.length,openSamples:premium.filter(l=>l._sample).length,protected:premium.filter(l=>l._locked).length}));
