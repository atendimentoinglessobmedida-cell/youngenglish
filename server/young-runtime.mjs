import {createYoungHandler} from './young-http.mjs';
const actions=new Set(['session','profiles','progress','premium','license','period','teacher','feedback']);
const unavailable=()=>new Response(JSON.stringify({error:'O acesso por conta está em preparação.'}),{status:503,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});

// Configure only after provisioning the dedicated Young project. No service key.
export function createYoungRuntime({env,lessonIds,fetcher=fetch}) {
  let handler;
  try {
    const ref=env.YOUNG_SUPABASE_PROJECT_REF;
    if(!/^[a-z]{20}$/.test(ref??'')||ref==='bfuoykappwybuxdlrbmo')throw new Error('Dedicated Young project required');
    const base=new URL(env.YOUNG_SUPABASE_URL);
    if(base.href!==`https://${ref}.supabase.co/`)throw new Error('Project reference mismatch');
    if(!/^sb_publishable_[A-Za-z0-9_-]{20,}$/.test(env.YOUNG_SUPABASE_PUBLISHABLE_KEY??''))throw new Error('Publishable key required');
    const origin=new URL(env.YOUNG_APP_ORIGIN);
    if(origin.protocol!=='https:'||origin.href!==origin.origin+'/')throw new Error('Canonical app origin required');
    handler=createYoungHandler({baseUrl:base.href,publishableKey:env.YOUNG_SUPABASE_PUBLISHABLE_KEY,appOrigin:origin.origin,lessonIds,fetcher});
  } catch { return async()=>unavailable(); }
  return async request=>{
    const url=new URL(request.url);
    // Vercel rewrites preserve the selected action explicitly in the query.
    const action=url.searchParams.get('action')??url.pathname.split('/').at(-1);
    if(!actions.has(action))return new Response(JSON.stringify({error:'Rota indisponível.'}),{status:404,headers:{'Content-Type':'application/json','Cache-Control':'private, no-store'}});
    url.pathname='/api/young/'+action;url.searchParams.delete('action');
    return handler(new Request(url,request));
  };
}
