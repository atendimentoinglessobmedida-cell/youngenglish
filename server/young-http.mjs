import {authorizeProfile, authorizePremium, validateProgress, plans} from './commercial-policy.mjs';

const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const fail=(status,message)=>{const error=new Error(message);error.status=status;throw error;};
const reply=(status,data)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'private, no-store','Vary':'Authorization','X-Content-Type-Options':'nosniff'}});

// Mounted by api/young.mjs through the dedicated Young runtime.
// Uses the caller's verified token and RLS; never a service-role key.
export function createYoungHandler({baseUrl,publishableKey,appOrigin,lessonIds,fetcher=fetch,now=()=>Date.now()}) {
  const base=new URL(baseUrl);
  if(base.protocol!=='https:'||base.username||base.password||base.search||base.hash)throw new Error('Trusted HTTPS Supabase URL required');
  if(!publishableKey||!appOrigin||!(lessonIds instanceof Set))throw new Error('Backend configuration incomplete');
  const origin=new URL(appOrigin).origin;
  return async function handle(request) {
    try {
      const url=new URL(request.url),action=url.pathname.split('/').filter(Boolean).at(-1);
      const supported={session:['GET'],profiles:['GET','POST'],progress:['GET','PUT','DELETE'],premium:['GET'],license:['GET'],period:['POST'],teacher:['GET'],feedback:['GET','POST'],'access-link':['POST']};
      if(!Object.hasOwn(supported,action))return reply(404,{error:'Rota indisponível.'});
      if(!supported[action].includes(request.method))return reply(405,{error:'Método indisponível.'});
      if(request.headers.has('origin')&&request.headers.get('origin')!==origin)fail(403,'Origem indisponível.');
      const authorization=request.headers.get('authorization')??'';
      if(!/^Bearer [A-Za-z0-9._-]{1,8192}$/.test(authorization))fail(401,'Entre na conta do responsável.');
      const headers={'apikey':publishableKey,'Authorization':authorization};
      const call=async(path,options={})=>{
        const response=await fetcher(new URL(path,base),{...options,headers:{...headers,...options.headers},signal:AbortSignal.timeout(8000)});
        let value;try{value=await response.json();}catch{fail(502,'Resposta inválida do serviço.');}
        if(!response.ok){
          if(response.status===401)fail(401,'Sessão expirada. Entre novamente.');
          if(value?.code==='40001'||response.status===409)fail(409,'Progresso alterado em outro aparelho.');
          if(value?.code==='42501'||response.status===403)fail(403,'Acesso indisponível.');
          if(value?.code==='22023'||response.status===400)fail(400,'Dados inválidos.');
          fail(502,'Serviço temporariamente indisponível.');
        }
        return value;
      };
      const user=await call('/auth/v1/user');
      if(!user||!uuid.test(user.id)||!user.email_confirmed_at)fail(401,'É necessária uma conta verificada.');
      const actor={id:user.id,verifiedByServer:true};
      const body=async()=>{
        if(request.headers.get('content-type')?.split(';')[0].trim().toLowerCase()!=='application/json')fail(415,'Envie dados em JSON.');
        const raw=await request.text();if(new TextEncoder().encode(raw).length>260000)fail(413,'Dados excedem o limite.');
        let value;try{value=JSON.parse(raw);}catch{fail(400,'JSON inválido.');}
        if(!value||typeof value!=='object'||Array.isArray(value))fail(400,'Dados inválidos.');
        return value;
      };
      if(action==='access-link'){
        if(request.headers.get('origin')!==origin)fail(403,'Origem indisponível.');
        const input=await body();
        if(Object.keys(input).some(key=>!['email','confirmed'].includes(key)))fail(400,'Dados inválidos.');
        return reply(200,await call('/functions/v1/young-manual-access',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify(input)}));
      }
      if(action==='session'){const permissions=await call('/rest/v1/rpc/young_account_permissions',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});return reply(200,{account:{id:user.id,email:user.email},permissions,...(permissions.administrator===true?{plans}:{})});}
      if(action==='teacher'){
        const target=url.searchParams.get('profile'),cursor=url.searchParams.get('after');
        if((target&&!uuid.test(target))||(cursor&&!uuid.test(cursor))||(target&&cursor))fail(400,'Seleção de aluno inválida.');
        const students=await call('/rest/v1/rpc/young_teacher_progress',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({target_profile:target||null,after_profile:cursor||null})});
        if(!Array.isArray(students))fail(502,'Resposta inválida do serviço.');
        return reply(200,{students:students.slice(0,50),nextCursor:students.length>50?students[49].profile_id:null});
      }
      if(action==='feedback'&&request.method==='POST'){
        const input=await body();if(!uuid.test(input.profileId??'')||!lessonIds.has(input.lessonId)||typeof input.message!=='string'||input.message.trim().length<1||input.message.trim().length>2000)fail(400,'Feedback inválido.');
        const feedback=await call('/rest/v1/rpc/young_write_feedback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({target_profile:input.profileId,target_lesson:input.lessonId,feedback_message:input.message.trim()})});
        return reply(201,{feedback});
      }
      if(action==='period'){
        const input=await body(),plan=typeof input.planId==='string'&&Object.hasOwn(plans,input.planId)?plans[input.planId]:null;
        if(!uuid.test(input.profileId??'')||!plan||input.amountCents!==plan.priceCents||!/^[a-zA-Z0-9_-]{12,100}$/.test(input.requestId??'')||!/^[a-zA-Z0-9_-]{12,100}$/.test(input.paymentReference??'')||input.confirmed!==true)fail(400,'Confirmação administrativa inválida.');
        // The RPC checks staff permission from trusted DB data and commits atomically.
        const confirmation=await call('/rest/v1/rpc/young_confirm_period',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({target_profile:input.profileId,selected_plan:input.planId,payment_reference:input.paymentReference,operation_id:input.requestId,paid_amount_cents:input.amountCents})});
        return reply(200,{confirmation});
      }
      if(action==='profiles'){
        if(request.method==='GET')return reply(200,{profiles:await call(`/rest/v1/young_profiles?select=id,nickname,disabled&guardian_id=eq.${user.id}&order=created_at.asc`)});
        const input=await body();if(typeof input.nickname!=='string'||input.nickname.trim().length<1||input.nickname.trim().length>40)fail(400,'Use um apelido de até 40 caracteres.');
        return reply(201,{profile:await call('/rest/v1/rpc/young_create_profile',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({profile_nickname:input.nickname.trim()})})});
      }
      const profileId=url.searchParams.get('profile');if(!uuid.test(profileId??''))fail(400,'Perfil inválido.');
      const profiles=await call(`/rest/v1/young_profiles?select=id,guardian_id,disabled&id=eq.${profileId}&limit=1`);
      const row=Array.isArray(profiles)?profiles[0]:null;
      const profile=row&&{id:row.id,guardianId:row.guardian_id,disabled:row.disabled};
      if(action==='license'||(action==='progress'&&request.method==='DELETE')){
        if(!profile||profile.guardianId!==actor.id)fail(403,'Perfil não pertence a esta conta.');
      }else authorizeProfile(actor,profile);
      if(action==='license'){
        const records=await call(`/rest/v1/young_licenses?select=profile_id,status,plan_id,starts_at,expires_at&profile_id=eq.${profileId}&limit=1`);
        return reply(200,{license:Array.isArray(records)?records[0]??null:null});
      }
      if(action==='feedback')return reply(200,{feedback:await call(`/rest/v1/young_feedback?select=id,lesson_id,message,created_at&profile_id=eq.${profileId}&order=created_at.desc`)});
      if(action==='premium'){
        const permissions=await call('/rest/v1/rpc/young_account_permissions',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});
        actor.permissions=permissions?.administrator===true?['manage_young_licenses']:[];
        const licenses=await call(`/rest/v1/young_licenses?select=profile_id,status,starts_at,expires_at&profile_id=eq.${profileId}&limit=1`);
        const record=Array.isArray(licenses)?licenses[0]:null;
        authorizePremium({actor,profile,license:record&&{profileId:record.profile_id,status:record.status,startsAt:record.starts_at,expiresAt:record.expires_at},now:now()});
        const lessons=await call('/rest/v1/rpc/young_premium_content',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({target_profile:profileId,selected_lesson:null})});
        if(!Array.isArray(lessons))fail(502,'Resposta inválida do serviço.');
        return reply(200,{lessons});
      }
      if(request.method==='GET')return reply(200,{progress:await call(`/rest/v1/young_progress?select=revision,payload,sharing,updated_at&profile_id=eq.${profileId}&limit=1`)});
      const input=await body();
      if(request.method==='DELETE'){
        if(input.confirmed!==true||!Number.isSafeInteger(input.revision)||input.revision<0)fail(400,'Confirme a remoção da cópia da conta.');
        return reply(200,await call('/rest/v1/rpc/young_remove_progress',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({target_profile:profileId,expected_revision:input.revision})}));
      }
      if(!Number.isSafeInteger(input.revision)||input.revision<0||typeof input.sharing!=='boolean')fail(400,'Revisão ou compartilhamento inválido.');
      const payload=validateProgress(input.payload);
      if(payload.done.some(id=>!lessonIds.has(id))||(payload.version===1&&Object.keys(payload.drafts).some(id=>!lessonIds.has(id))))fail(400,'Aula desconhecida.');
      const saved=await call('/rest/v1/rpc/young_save_progress',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({target_profile:profileId,expected_revision:input.revision,progress_payload:payload,share_with_teacher:input.sharing})});
      return reply(200,{progress:saved});
    } catch(error) {
      if(error.status)return reply(error.status,{error:error.message});
      // Do not log tokens, drafts, account data or provider response bodies.
      console.error('Young backend request failed',{type:error.name??'Error'});
      return reply(503,{error:'Não foi possível conectar agora. Seu progresso local permanece disponível.'});
    }
  };
}
