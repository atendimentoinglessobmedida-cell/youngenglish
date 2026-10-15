const origin='https://youngenglish.vercel.app';
const endpoint='https://pttmctaxklaotdvnmjqc.supabase.co';
const reply=(status,data)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'private, no-store','Vary':'Authorization, Origin','X-Content-Type-Options':'nosniff'}});

// Shared with Node tests. Secrets are injected by the hosted Edge runtime only.
export function createManualAccess({serviceKey,publishableKey,fetcher=fetch,now=Date.now}){
  const limits=new Map();
  return async request=>{
    if(request.method!=='POST')return reply(405,{error:'Use POST para gerar um acesso individual.'});
    const requestOrigin=request.headers.get('origin');
    if(requestOrigin&&requestOrigin!==origin)return reply(403,{error:'Origem indisponível.'});
    const authorization=request.headers.get('authorization')||'';
    if(!/^Bearer [A-Za-z0-9._-]{1,8192}$/.test(authorization))return reply(401,{error:'Entre com uma conta administrativa.'});
    if(!serviceKey||!publishableKey)return reply(503,{error:'Serviço administrativo indisponível.'});
    const token=authorization.slice(7);
    try{
      let actor;
      // Supabase dashboard operators may bootstrap their own account without SMTP.
      // The service key is never accepted from, or exposed to, the public app UI.
      if(token===serviceKey){actor='project-operator';}
      else{
        const headers={apikey:publishableKey,Authorization:authorization};
        const verified=await fetcher(endpoint+'/auth/v1/user',{headers,signal:AbortSignal.timeout(8000)});
        if(!verified.ok)return reply(401,{error:'Sessão administrativa inválida.'});
        const user=await verified.json();
        if(!user.email_confirmed_at||!user.id)return reply(401,{error:'Conta administrativa não verificada.'});
        const permitted=await fetcher(endpoint+'/rest/v1/rpc/young_account_permissions',{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:'{}',signal:AbortSignal.timeout(8000)});
        if(!permitted.ok||(await permitted.json()).administrator!==true)return reply(403,{error:'Acesso exclusivo da administração.'});
        actor=user.id;
      }
      if(request.headers.get('content-type')?.split(';')[0].trim()!=='application/json')return reply(415,{error:'Envie dados em JSON.'});
      const raw=await request.text();
      if(new TextEncoder().encode(raw).length>1024)return reply(413,{error:'Solicitação excede o limite.'});
      let input;try{input=JSON.parse(raw);}catch{return reply(400,{error:'JSON inválido.'});}
      if(!input||Array.isArray(input)||Object.keys(input).some(key=>!['email','confirmed'].includes(key))||input.confirmed!==true||typeof input.email!=='string')return reply(400,{error:'Confirme o destinatário responsável.'});
      const email=input.email.trim().toLowerCase();
      if(email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return reply(400,{error:'Informe um e-mail válido do responsável.'});
      // Per-instance backstop; administrator authentication remains the primary gate.
      const time=now(),recent=(limits.get(actor)||[]).filter(at=>time-at<3600000);
      if(recent.length>=10)return reply(429,{error:'Limite desta sessão de emissão atingido. Tente mais tarde.'});
      if(limits.size>500)for(const[key,list]of limits)if(!list.some(at=>time-at<3600000))limits.delete(key);
      limits.set(actor,[...recent,time]);
      const response=await fetcher(endpoint+'/auth/v1/admin/generate_link',{method:'POST',headers:{apikey:serviceKey,Authorization:'Bearer '+serviceKey,'Content-Type':'application/json'},body:JSON.stringify({type:'magiclink',email,redirect_to:origin+'/index.html'}),signal:AbortSignal.timeout(10000)});
      if(!response.ok)return reply(502,{error:'Não foi possível gerar o link. Confira o destinatário e tente mais tarde.'});
      const data=await response.json();
      const link=new URL(data.action_link);
      if(link.origin!==endpoint||link.pathname!=='/auth/v1/verify'||!link.searchParams.get('token')||!['magiclink','signup'].includes(link.searchParams.get('type'))||link.searchParams.get('redirect_to')!==origin+'/index.html')throw Error('Invalid provider response');
      return reply(200,{link:link.href,email,message:'Link individual de uso único. O prazo é definido pelo Supabase. Envie somente ao responsável conferido; gerar login não ativa Premium.'});
    }catch{
      // Do not log the request, recipient, provider body, link or credentials.
      return reply(503,{error:'Serviço administrativo temporariamente indisponível.'});
    }
  };
}
