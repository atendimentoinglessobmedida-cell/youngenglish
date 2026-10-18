(function(root){
 'use strict';
 function shuffle(items,random=Math.random){const result=[...items];for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;}
 function split(value){const position=value.indexOf('|');return [value.slice(0,position),value.slice(position+1)];}
 function questions(scene){
  const vocabulary=scene.v.map(split);
  return [...vocabulary.map(([word,meaning],index)=>({prompt:'What does “'+word+'” mean in this scene?',answer:meaning,options:[meaning,...vocabulary.filter((_,i)=>i!==index).slice(0,2).map(item=>item[1])],feedback:word+' — '+meaning+'. Return to the dialogue and find how this expression is used.'})),...scene.q.map(([prompt,answer,...wrong])=>({prompt,answer,options:[answer,...wrong],feedback:'Compare with the dialogue. The supported answer is: '+answer}))];
 }
 function record(previous,index,correct){const next={...previous};if(!next[index])next[index]={attempts:0,solved:false,firstTry:false};const entry={...next[index]};if(entry.solved)return next;entry.attempts++;if(correct){entry.solved=true;entry.firstTry=entry.attempts===1;}next[index]=entry;return next;}
 function voices(available){const english=available.filter(v=>/^en(?:-|$)/i.test(v.lang));const a=english.find(v=>/Samantha|Zira|Aria|Jenny/i.test(v.name))||english[0];const b=english.find(v=>v.voiceURI!==a?.voiceURI&&/Daniel|David|Guy|Andrew/i.test(v.name))||english.find(v=>v.voiceURI!==a?.voiceURI)||a;return [a,b];}
 root.ISMConversation={shuffle,split,questions,record,voices};
})(typeof window==='undefined'?globalThis:window);
