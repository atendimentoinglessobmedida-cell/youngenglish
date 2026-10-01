let savedAtLoad=null;try{savedAtLoad=JSON.parse(localStorage.getItem('ism-young-v4')||'null')}catch{}
let catalogStatus='all',catalogTheme='all',premiumStatus='all';
let resumeLesson=savedAtLoad?.resume||null;
pageCatalog.forEach(p=>{const group=expansionFree.filter(l=>l.level===p.id),m=modules.length;modules.push(['Novas descobertas · '+p.id,p.id,'Explore ideias, pessoas e o mundo ao seu redor.',m+1]);group.forEach(l=>{l.module=m;l.cefr=l.cefr||p.cefr;l.premium=false;lessons.push(l)})});
premiumLessons.push(...expansionPremium);
pageCatalog.forEach(p=>{const extra=expansionFree.filter(l=>l.level===p.id);p.themes+=' Novas aulas de escola, ciência, natureza, cidadania digital, alimentação e jogos em equipe.';p.grammar+=' Novas práticas: '+extra.map(l=>l.grammarTopic).join(', ')+'.'});
