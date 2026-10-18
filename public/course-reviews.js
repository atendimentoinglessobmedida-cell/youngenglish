(()=>{
 'use strict';
 const app=document.currentScript.dataset.app;
 function normalize(l,section){return {id:l.id,title:l.t||l.title,goal:l.o||l.goal||l.title,section,locked:Boolean(l._locked&&!l._loaded),terms:(l.v||[]).map(t=>({en:t.en,pt:t.pt})),questions:(l.q||[]).map(q=>({prompt:q.prompt,options:q.options,answer:q.options?.[q.answer],feedback:q.explanation||''})),sentence:(l.d||[])[0]?.replace(/^[^:]{1,35}:\s*/,''),dialogue:(l.d||[]).map((text,i)=>({text,pt:l.tr?.[i]||''}))};}
 const adapter={name:app==='young'?'ISM Young English · Revisões por nível e trilha':'ISM Easy English · Revisões a cada três lições',brand:app==='young'?'#163b60':'#47256d',embedded:true,load:async()=>{const ordered=app==='young'&&typeof pageCatalog!=='undefined'?[...lessons].sort((a,b)=>Number(Boolean(a.premium))-Number(Boolean(b.premium))||pageCatalog.findIndex(p=>p.id===a.level)-pageCatalog.findIndex(p=>p.id===b.level)):lessons;return ordered.map(l=>normalize(l,(l.premium?'Premium · ':'')+l.level));},play:text=>say(text),stop:()=>stopAudio()};
 const page=window.ISMReviewPage.mount(adapter),previous=render;
 render=function(...args){previous(...args);page.refresh();};
})();
