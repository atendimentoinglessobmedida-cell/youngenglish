const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),catalog={young:require('./source.cjs')};
const out=process.argv[2];if(!out)throw Error('Build directory required.');fs.mkdirSync(out,{recursive:true});
const jobs=new Map(),titles=[['opening','Contexto e objetivo','Situation and goal'],['vocabulary','Vocabulário explicado','Vocabulary explained'],['pronunciation','Gramática e pronúncia','Grammar and pronunciation'],['dialogue','Diálogo com dois personagens','Two-character dialogue'],['practice','Sua vez de responder','Your turn to respond'],['summary','Resumo e próxima prática','Recap and next practice']];
for(const [app,lessons]of Object.entries(catalog)){
 const episodes=lessons.map(l=>{const versions={};for(const mode of ['en','pt']){
  const chapters=titles.map(([id,pt,en])=>({id,title:mode==='en'?en:pt,segments:[]}));
  const add=(i,lang,text,pauseMs=450,rate=96,role='narrator',voice=lang==='pt-BR'?'pf_dora':'af_heart')=>{
   const key=crypto.createHash('sha256').update(JSON.stringify(['kokoro-v1.0-misaki0.9.4',voice,lang,text,rate])).digest('hex');
   const segment={lang,text,pauseMs,rate,role,voice,clip:key};chapters[i].segments.push(segment);jobs.set(key,{key,...segment});
  };
  const narr=(i,en,pt,pause=500)=>add(i,mode==='en'?'en-US':'pt-BR',mode==='en'?en:pt,pause);
  narr(0,'Welcome to an I S M audio lesson. The voices and situations are synthetic. Listen, repeat, and take a role in the dialogue. Pause whenever you need more time.','Bem-vindo a uma miniaula ISM. As vozes são sintetizadas e as situações são fictícias. Ouça, repita e assuma um papel no diálogo. Pause quando precisar de mais tempo.');
  narr(0,l.context,l.contextPt,900);narr(0,'Your goal: '+l.goal,'Seu objetivo: '+l.goalPt,900);
  narr(1,'Listen to six expressions, their meanings and an example. Use each pause to repeat.','Ouça seis expressões, seus significados e um exemplo. Aproveite as pausas para repetir.');
  for(const [term,pt,definition,example]of l.words){add(1,'en-US',term+'.',250,88);narr(1,definition,'Em português: '+pt+'.',250);add(1,'en-US',example,1700);}
  narr(2,l.grammar,l.grammarPt,1000);narr(2,l.pron[1],l.pron[2]);add(2,'en-US',l.pron[0],1800,80);add(2,'en-US',l.pron[0],1800,98);
  narr(3,'Listen to the conversation. Each character keeps a different voice. First follow the meaning; then return and take one role.','Ouça o diálogo. Cada personagem mantém uma voz diferente. Primeiro acompanhe o sentido. Depois volte e assuma um dos papéis.');
  const first=l.dialogue[0][0];for(const [speaker,text]of l.dialogue)add(3,'en-US',text,350,96,speaker,speaker===first?'af_heart':'am_michael');
  narr(4,'Your turn. Answer each prompt during the pause. Then compare your answer with one possible model. You can pause for longer.','Sua vez. Responda nas pausas. Depois compare sua resposta com um modelo possível. Pause por mais tempo se precisar.');
  for(const [question,answer]of l.practice){add(4,'en-US',question,4500);narr(4,'One possible response:','Uma resposta possível:',250);add(4,'en-US',answer,1800);}
  narr(5,l.recap,l.recapPt,1100);narr(5,'Return to the app and use two expressions in a new conversation. Ask your teacher for feedback. Listening alone does not assess your pronunciation.','Volte ao aplicativo e use duas expressões em uma conversa nova. Peça feedback ao professor. A escuta sozinha não avalia sua pronúncia.');
  versions[mode]={label:mode==='en'?'English only':'Português + exemplos em inglês',chapters};
 }
 return{id:l.id,title:l.title,lesson:l.lesson||(app==='travel'?'/':app==='young'?'elementary.html':'index.html#lesson/0/0'),versions};});
 const dir=path.join(out,app);fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'episodes.json'),JSON.stringify(episodes,null,2));
}
fs.writeFileSync(path.join(out,'jobs.json'),JSON.stringify([...jobs.values()],null,2));console.log(JSON.stringify({apps:3,episodes:9,versions:18,uniqueSegments:jobs.size}));
