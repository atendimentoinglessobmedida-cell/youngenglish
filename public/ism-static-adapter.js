/* Thin bridges to the existing app commands. No entitlement, audio or progress implementation lives here. */
(()=>{
const ui=globalThis.ISMStrings.adapter;
 const app=document.currentScript?.dataset.ismApp;if(!['easy','young','business'].includes(app))return;
 const names={easy:ui.label001,young:ui.label002,business:ui.label003};
 const rootPage=/\/(?:index\.html)?$/.test(location.pathname);
 const isInteractive=()=>app==='business'?typeof show==='function':typeof render==='function'&&typeof lessons!=='undefined';
 const oldHeader=document.querySelector('header'),oldNavs=[...document.querySelectorAll('nav')].filter(n=>!n.closest('main,dialog,[role="dialog"]'));
 const oldMain=app==='business'?(document.querySelector('.app')||document.querySelector('main')):document.querySelector('main');if(!oldMain)return;
 const link=(label,href,tab='praticar')=>({label,href,tab});
 const action=(label,id,fallback,tab='praticar')=>({label,tab,run:()=>{const node=oldHeader?.querySelector('#'+id);if(node)node.click();else location.href=fallback;}});
 const review={label:ui.label004,tab:'praticar',run:()=>{const node=[...(oldHeader?.querySelectorAll('button')||[])].find(n=>/Review|Revisão|Revisar/.test(n.textContent));if(node)node.click();else location.href=app==='business'?'reviews.html':'index.html#ism/praticar/revisao';}};
 function legacyResume(){
  if(!isInteractive())return null;
  if(app==='business'){const last=typeof lastLesson==='function'?lastLesson():null;if(!last)return null;const stage=typeof lessonStageSaved==='function'?lessonStageSaved(last.lid):'context';return '/index.html#lesson/'+last.mid+'.'+(Number(last.index)+1)+'/'+stage;}
  if(app==='young'){const saved=typeof resumeLesson!=='undefined'?resumeLesson:null;if(!saved||!lessons.some(l=>l.id===saved.id))return null;return '/index.html?'+new URLSearchParams({ismLesson:saved.id,ismStage:String(Math.min(5,Math.max(0,Math.floor(Number(saved.step)||0))))});}
  if(done.size||Object.keys(answers).length||Object.keys(drafts).length){const next=lessons.findIndex(l=>!done.has(l.id)&&!l._locked);return '/index.html#lesson/'+Math.max(0,next)+'/0';}
  return null;
 }
 let resumeOpened=false;
 function restoreYoung(url){const id=url.searchParams.get('ismLesson'),n=typeof lessons!=='undefined'?lessons.findIndex(l=>l.id===id):-1;if(n<0)return;openLesson(n);step=Math.min(5,Math.max(0,Number(url.searchParams.get('ismStage'))||0));render();resumeOpened=true;}
 if(app==='young'&&isInteractive()&&new URLSearchParams(location.search).has('ismLesson'))restoreYoung(new URL(location.href));
 const props={
  app,name:names[app],homeHref:'index.html',canonicalHome:rootPage?'':'index.html#ism/inicio',legacyResume,roots:()=>[oldMain],chrome:()=>[oldHeader,...oldNavs,document.querySelector('footer'),...document.querySelectorAll('body > p:has(> a[href="student-start.html"])')],
  canPersistResume:()=>app!=='young'||(typeof remember==='boolean'&&remember),
  resumeScope:()=>app==='young'?(typeof progressKey==='string'?progressKey:'session'):'',
  firstLesson:app==='easy'?'/index.html#lesson/0/0':app==='young'?'/index.html?ismLesson=elementary-01&ismStage=0':'/index.html#lesson/1.1/0',
  allowedResume:url=>{
   if(!/\/(?:index\.html)?$/.test(url.pathname))return false;
   if(app==='young')return /^[-a-zA-Z0-9]+$/.test(url.searchParams.get('ismLesson')||'')&&/^[0-5]$/.test(url.searchParams.get('ismStage')||'')&&[...url.searchParams.keys()].every(k=>['ismLesson','ismStage'].includes(k));
   return !url.search&&(app==='easy'?/^#lesson\/\d+\/[0-5]$/:/^#lesson\/\d+\.\d+(?:\/[a-zA-Z0-9-]+)?$/).test(url.hash);
  },
  resume:()=>{
   if(!isInteractive())return null;
   if(app==='business')return /^#lesson\//.test(location.hash)?'/index.html'+location.hash:null;
   if(view!=='learn')return null;
   if(app==='easy')return '/index.html#lesson/'+current+'/'+step;
   return '/index.html?'+new URLSearchParams({ismLesson:lessons[current].id,ismStage:String(step)});
  },
  openResume:href=>{
   const url=new URL(href,location.origin);
   if(!isInteractive()){location.href=href;return;}
   if(app==='young'){history.pushState({},'',url);restoreYoung(url);return;}
   if(app==='easy'){const match=url.hash.match(/^#lesson\/(\d+)\/([0-5])$/);if(match){current=Math.min(lessons.length-1,Number(match[1]));step=Number(match[2]);view='learn';history.pushState({},'',url);render();return;}}
   if(location.hash===url.hash){if(app==='business')void applyRoute();}else location.href=href;
  },
  state:()=>{if(!isInteractive())return {};if(app==='business')return {complete:typeof mastered==='function'?mastered():0,total:typeof TOTAL==='number'?TOTAL:98};return {complete:done.size,total:lessons.length};},
  isDefault:()=>!resumeOpened&&!new URLSearchParams(location.search).has('ismLesson')&&rootPage&&(!location.hash||['#','#home'].includes(location.hash)),
  tabForLocation:()=>/practice|games|simulate|toolkit|businessmode|smartreview|conversation|listening|debate|review/.test(location.href)?'praticar':/progress|rewards/.test(location.href)?'progresso':'aulas',
  lessons:()=>{if(isInteractive()&&app==='business'){goJourney();return;}const node=oldHeader?.querySelector('#levels');if(node)node.click();else location.href=app==='business'?'index.html#journey':'index.html#levels';},
  refresh:()=>{if(isInteractive()&&app!=='business')render();}
 };
 if(app==='easy'){
  props.shortcuts=[action(ui.label005,'levels','index.html#levels','aulas'),{label:ui.label006,group:'revisao'},{label:ui.label007,group:'conversacao'}];
  props.pillars=[
   {id:'aulas',label:ui.label005,description:ui.label008,resources:[]},
   {id:'revisao',label:ui.label006,description:ui.label009,resources:[review]},
   {id:'situacoes',label:ui.label010,description:ui.label011,resources:[action(ui.label012,'practice','index.html#practice/read'),action('Jogos','games','index.html#games'),action('Projetos','projects','index.html#projects'),action(ui.label013,'guide','index.html#guide')]},
   {id:'conversacao',label:ui.label007,description:ui.label014,resources:[link(ui.label015,'conversation-lab.html'),link(ui.label016,'podcasts.html'),link(ui.label017,'sala-de-aula.html'),link(ui.label018,'caderno-do-aluno.html')]}
  ];
  props.profileGroups=[
   {id:'conta',label:ui.label019,resources:[link(ui.label020,'access.html','perfil'),link(ui.label021,'account','perfil')]},
   {id:'preferencias',label:ui.label022,resources:[action(ui.label023,'language-support','index.html#ism/perfil/preferencias','perfil')],widgets:['.topline label','#adult-audio-controls']},
   {id:'informacoes',label:ui.label024,resources:[link(ui.label025,'professor.html','perfil'),link(ui.label026,'student-start.html','perfil'),link(ui.label027,'visual-credits.html','perfil')]},
   {id:'instalar',label:ui.label028,resources:[link(ui.label029,'install.html','perfil')]}
  ];
  props.progressResources=[action(ui.label030,'progress','index.html#progress','progresso')];
 }else if(app==='young'){
  props.shortcuts=[action(ui.label005,'levels','index.html#levels','aulas'),{label:ui.label031,group:'situacoes'},{label:ui.label007,group:'conversacao'}];
  props.pillars=[
   {id:'aulas',label:ui.label005,description:ui.label032,resources:[]},
   {id:'revisao',label:ui.label006,description:ui.label033,resources:[review,action(ui.label013,'guide','index.html#levels')]},
   {id:'situacoes',label:ui.label010,description:ui.label034,resources:[action('Jogos','games','index.html#levels'),action('Projetos','projects','index.html#levels'),action(ui.label035,'videos','index.html#levels'),link(ui.label036,'listening-lab.html')]},
   {id:'conversacao',label:ui.label007,description:ui.label037,resources:[link(ui.label038,'speaking-coach.html'),link(ui.label015,'conversation-lab.html'),link(ui.label016,'podcasts.html'),link(ui.label039,'debate.html')]}
  ];
  props.profileGroups=[
   {id:'conta',label:ui.label040,resources:[action(ui.label021,'young-account-open','assinatura.html','perfil'),action(ui.label041,'premium','assinatura.html','perfil'),link(ui.label042,'assinatura.html','perfil')]},
   {id:'preferencias',label:ui.label043,resources:[],widgets:['.topline label','#student-progress','#young-audio-controls']},
   {id:'informacoes',label:ui.label024,resources:[link('Professor','professor.html','perfil'),link('Contato','contato.html','perfil'),link(ui.label026,'student-start.html','perfil'),link(ui.label017,'sala-de-aula.html','perfil')]},
   {id:'instalar',label:ui.label028,resources:[action(ui.label044,'install-app','index.html#ism/perfil/instalar','perfil')]}
  ];
  props.progressResources=[action(ui.label045,'rewards','index.html#levels','progresso'),{label:ui.label046,tab:'perfil',run:()=>window.ISMNavigation.navigate('perfil','preferencias')}];
 }else{
  const command=(label,page)=>({label,run:()=>{if(isInteractive()){setNav(page);show(page);if(page==='toolkit')renderToolkit();if(page==='simulate')renderSimulation();}else location.href='index.html#'+page;}});
  props.shortcuts=[link('Entrevistas','interview.html'),{label:ui.label006,group:'revisao'},{label:ui.label047,group:'situacoes'}];
  props.pillars=[
   {id:'aulas',label:ui.label005,description:ui.label048,resources:[]},
   {id:'revisao',label:ui.label006,description:ui.label049,resources:[command(ui.label050,'smartreview'),link(ui.label051,'reviews.html'),review]},
   {id:'situacoes',label:ui.label010,description:ui.label052,resources:[command(ui.label053,'practice'),command(ui.label054,'simulate'),command(ui.label055,'businessmode'),command(ui.label056,'toolkit'),link(ui.label012,'practice-lab.html'),link(ui.label057,'business-ideas-lab.html'),link(ui.label058,'business-practice.html'),link(ui.label059,'skills-studio.html')]},
   {id:'conversacao',label:ui.label007,description:ui.label060,resources:[link(ui.label015,'conversation-lab.html'),link(ui.label061,'real-business-listening.html'),link(ui.label016,'business-podcasts.html'),link(ui.label039,'debate.html')]}
  ];
  props.profileGroups=[
   {id:'conta',label:ui.label019,resources:[link(ui.label062,'premium.html','perfil'),link(ui.label063,'planos.html','perfil')]},
   {id:'preferencias',label:ui.label064,resources:[command(ui.label065,'support'),link(ui.label017,'sala-de-aula.html','perfil'),link(ui.label018,'caderno-do-aluno.html','perfil'),link(ui.label066,'level-pathways.html','perfil')]},
   {id:'informacoes',label:ui.label024,resources:[link(ui.label067,'professor.html','perfil'),link(ui.label026,'student-start.html','perfil'),link(ui.label068,'photo-credits.html','perfil')]},
   {id:'instalar',label:ui.label028,resources:[link(ui.label029,'install.html','perfil')]}
  ];
  props.progressResources=['core','xp','stars'].map((type,index)=>({label:[ui.label069,ui.label070,ui.label071][index],tab:'progresso',run:()=>{if(isInteractive())openProgressInsight(type);else location.href='index.html#journey';}}));
 }

 const originalGroups=props.profileGroups;
 props.teacherResource=link('Conhecer o professor','professor.html','perfil');
 props.planResource=link('Conhecer os planos',app==='business'?'planos.html':app==='easy'?'professor.html':'assinatura.html','perfil');
 props.profileGroups=[
 {id:'professor',label:'Professor',resources:[]},
 {id:'planos',label:'Planos',resources:[props.planResource,...originalGroups.filter(g=>g.id==='conta').flatMap(g=>g.resources)]},
 {id:'guia',label:'Guia / Primeiros passos',resources:[link('Ler os primeiros passos','student-start.html','perfil')]},
 {id:'instalacao',label:'Instalar o app',resources:[]},
 {id:'preferencias',label:'Configurações',resources:originalGroups.filter(g=>g.id==='preferencias').flatMap(g=>g.resources),widgets:originalGroups.find(g=>g.id==='preferencias')?.widgets},
 {id:'creditos',label:'Créditos',resources:[link('Ver créditos',app==='business'?'photo-credits.html':app==='easy'?'visual-credits.html':'professor.html','perfil')]},
 {id:'informacoes',label:'Conta e outras informações',resources:originalGroups.filter(g=>g.id==='informacoes').flatMap(g=>g.resources)}
 ];
 if(app==='business'){
 props.shortcuts=[{label:'Business Mode',group:'situacoes'},{label:'Smart Review',group:'revisao'},{label:'Meu Progresso',tab:'progresso'}];
 props.interviewResource=link('Abrir as atividades de entrevista já disponíveis','interview.html','aulas');
 const all=props.pillars.flatMap(p=>p.resources);props.pillars=[
 {id:'conversacao',label:'Falar',description:'Practice · pratique sua comunicação.',resources:all.filter(r=>/conversa|debate|simula|comunica/i.test(r.label))},
 {id:'ouvir',label:'Ouvir',description:'Listening · ouça com atenção.',resources:all.filter(r=>/escuta|miniaula|listening|áudio/i.test(r.label))},
 {id:'situacoes',label:'Refletir',description:'Business Mode · ideias e situações profissionais.',resources:all.filter(r=>!/conversa|debate|simula|comunica|escuta|miniaula|listening|áudio|revis/i.test(r.label))},
 {id:'revisao',label:'Revisar',description:'Smart Review · reforce o que aprendeu.',resources:all.filter(r=>/revis/i.test(r.label))}];
 props.profileGroups.splice(2,0,{id:'conteudos',label:'Curso principal e Pacote Premium',resources:[link('Curso principal (98 lições + 12 simulações)','index.html#journey','aulas'),link('Pacote Premium (88 lições em 8 trilhas)','premium.html','aulas'),link('Trilhas por nível','level-pathways.html','aulas')]});
 }else if(app==='easy')props.shortcuts=[link('Audio lessons · EN/PT','podcasts.html'),{label:'Teste rápido de nível',screen:'nivel'},{label:'Smart Review',group:'revisao'}];
 for(const pillar of props.pillars){if(app!=='business')pillar.label=({revisao:'Smart Review',situacoes:'Practice',conversacao:'Conversation Lab'})[pillar.id]||pillar.label;}

 if(app==='young'){props.shortcuts[2].label='Conversation Lab';}
 if(app==='business'){
  const named=props.pillars.flatMap(p=>p.resources);
  const mode=named.find(r=>r.label===ui.label055),review=named.find(r=>r.label===ui.label050);
  if(mode&&review)props.shortcuts=[{...mode,label:'Business Mode'},{...review,label:'Smart Review'},{label:'Meu Progresso',tab:'progresso'}];
  const names=new Map([[ui.label055,'Business Mode'],[ui.label050,'Smart Review'],[ui.label012,'Practice Lab'],[ui.label015,'Conversation Lab'],[ui.label057,'Business Ideas Lab'],[ui.label061,'Real Business Listening']]);
  for(const item of named)if(names.has(item.label))item.label=names.get(item.label);
 }
 const api=window.ISMNavigationKit.mount(props);
 if(app==='easy'){const menu=document.createElement('nav');menu.className='ism-desktop-menu';menu.setAttribute('aria-label','Menu Easy');[['Aulas',()=>api.navigate('aulas')],['Praticar',()=>api.navigate('praticar')],['Jogos',()=>api.openResource(props.pillars.find(p=>p.id==='situacoes').resources.find(r=>r.label==='Jogos'))],['Meu progresso',()=>api.navigate('progresso')],['Mais',()=>api.navigate('perfil')]].forEach(([label,run])=>{const b=document.createElement('button');b.textContent=label;b.type='button';b.onclick=run;menu.append(b);});document.querySelector('.ism-header').append(menu);}
 
 function connect(){if(isInteractive()&&app!=='business'){const previous=render;render=function(){const value=previous.apply(this,arguments);api.legacyRendered();return value;};}if(app==='young'&&isInteractive()&&new URLSearchParams(location.search).has('ismLesson'))restoreYoung(new URL(location.href));api.legacyRendered();}
 if(document.readyState==='loading'||document.readyState==='interactive')document.addEventListener('DOMContentLoaded',connect,{once:true});else connect();
})();
