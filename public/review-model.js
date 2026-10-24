(function(root){
 'use strict';
 function shuffle(values,random=Math.random){const result=[...values];for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;}
 function blocks(lessons){
  const sections=new Map(),seen=new Set();
  for(const lesson of lessons){if(!lesson.id||seen.has(lesson.id))throw Error('Duplicate or missing lesson identifier');seen.add(lesson.id);const key=lesson.section||'Course';if(!sections.has(key))sections.set(key,[]);sections.get(key).push(lesson);}
  return [...sections].flatMap(([section,items])=>{const result=[];for(let i=0;i<items.length;i+=3){const group=items.slice(i,i+3);result.push({id:section+':'+group.map(l=>l.id).join('|'),section,number:Math.floor(i/3)+1,lessons:group,locked:group.some(l=>l.locked),final:group.length<3});}return result;});
 }
 function build(block){
  if(block.locked)return [];
  const pool=block.lessons.flatMap(l=>l.terms||[]).filter(t=>t.en&&t.pt),out=[];
  for(const lesson of block.lessons){
   const terms=(lesson.terms||[]).filter(t=>t.en&&t.pt).slice(0,2);
   for(const term of terms){const alternatives=[...new Set([...(lesson.terms||[]),...pool].filter(t=>t.pt&&t.pt!==term.pt).map(t=>t.pt))].slice(0,2);if(alternatives.length===2)out.push({kind:'choice',lesson:lesson.id,title:lesson.title,prompt:'What does “'+term.en+'” mean in this lesson?',options:[term.pt,...alternatives],answer:term.pt,feedback:term.en+' — '+term.pt+'. '+(term.example||lesson.goal||'Use the expression in a new example.')});}
   const q=(lesson.questions||[]).find(q=>q.prompt&&q.answer&&q.options?.includes(q.answer)&&new Set(q.options).size>1);
   if(q)out.push({kind:'choice',lesson:lesson.id,title:lesson.title,...q});
   else{const term=(lesson.terms||[])[2]||terms[0];if(term){const other=[...new Set(pool.filter(t=>t.en!==term.en).map(t=>t.en))].slice(0,2);if(other.length===2)out.push({kind:'choice',lesson:lesson.id,title:lesson.title,prompt:'Which expression means “'+term.pt+'”?',options:[term.en,...other],answer:term.en,feedback:term.en+' — '+term.pt});}}
   const isSentence=text=>typeof text==='string'&&!text.includes(' / ')&&text.trim().split(/\s+/).length>=3&&/\b(?:am|is|are|was|were|have|has|had|do|does|did|can|could|will|would|should|may|might|must|please|welcome|thank|work|need|want|check|confirm|start|join|send|open|close|show|know)\b|\bI[’']m\b/i.test(text);
   const sentence=[lesson.sentence,...terms.map(t=>t.en)].find(isSentence);
   if(sentence)out.push({kind:'order',lesson:lesson.id,title:lesson.title,prompt:'Build the model sentence. Then say it with a new detail.',answer:sentence.trim(),feedback:'Compare with the model: '+sentence.trim()});
  }
  return out;
 }
 function record(state,key,correct){const old=state[key]||{attempts:0,solved:false,firstTry:false};if(old.solved)return state;return {...state,[key]:{attempts:old.attempts+1,solved:correct,firstTry:correct&&old.attempts===0}};}
 // Results are derived from the first pass; focused practice cannot inflate them.
 function summary(answers,total){const values=Object.values(answers);return {total,solved:values.filter(a=>a.solved).length,firstTry:values.filter(a=>a.firstTry).length,mistakes:values.filter(a=>a.attempts>0&&!a.firstTry).length};}
 function mistakeIndices(answers){return Object.keys(answers).filter(key=>answers[key].attempts>0&&!answers[key].firstTry).map(Number);}
 root.ISMReviewModel={shuffle,blocks,build,record,summary,mistakeIndices};
})(typeof window==='undefined'?globalThis:window);
