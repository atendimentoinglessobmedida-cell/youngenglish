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
 let resumeOpened=false;
 function restoreYoung(url){const id=url.searchParams.get('ismLesson'),n=typeof lessons!=='undefined'?lessons.findIndex(l=>l.id===id):-1;if(n<0)return;openLesson(n);step=Math.min(5,Math.max(0,Number(url.searchParams.get('ismStage'))||0));render();resumeOpened=true;}
 if(app==='young'&&isInteractive()&&new URLSearchParams(location.search).has('ismLesson'))restoreYoung(new URL(location.href));
 const props={
  app,name:names[app],homeHref:'index.html',roots:()=>[oldMain],chrome:()=>[oldHeader,...oldNavs,document.querySelector('footer'),...document.querySelectorAll('body > p:has(> a[href="student-start.html"])')],
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
 const api=window.ISMNavigationKit.mount(props);
 function connect(){if(isInteractive()&&app!=='business'){const previous=render;render=function(){const value=previous.apply(this,arguments);api.legacyRendered();return value;};}if(app==='young'&&isInteractive()&&new URLSearchParams(location.search).has('ismLesson'))restoreYoung(new URL(location.href));api.legacyRendered();}
 if(document.readyState==='loading'||document.readyState==='interactive')document.addEventListener('DOMContentLoaded',connect,{once:true});else connect();
})();
