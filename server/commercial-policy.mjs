// Server-only policy. Identity/permissions must come from a verified server session,
import {validateYoungCloudProgress} from './progress-codec.mjs';
// never from request body or editable profile metadata. Not included in public build.
export const plans=Object.freeze({monthly:{days:30,priceCents:5899},semiannual:{days:180,priceCents:32999},annual:{days:365,priceCents:58999}});
const reject=(message,status=403)=>{const error=new Error(message);error.status=status;throw error;};
const timestamp=value=>{const time=Date.parse(value);if(!Number.isFinite(time))reject('Data inválida.',400);return time;};
export function authorizeProfile(actor,profile){if(!actor?.verifiedByServer||!actor.id)reject('Sessão necessária.',401);if(!profile||profile.guardianId!==actor.id)reject('Perfil não pertence a esta conta.');if(profile.disabled)reject('Perfil indisponível.');return profile;}
export function authorizePremium({actor,profile,license,now=Date.now()}){authorizeProfile(actor,profile);if(!license||license.profileId!==profile.id||license.status!=='active')reject('Acesso Premium não ativo.');if(timestamp(license.startsAt)>now||timestamp(license.expiresAt)<=now)reject('Período Premium indisponível.');return {profileId:profile.id,expiresAt:license.expiresAt};}
export function recordConfirmedPeriod({operator,profile,payment,planId,requestId,existing=null,priorOperation=null,now=Date.now()}){
 if(!operator?.verifiedByServer||!operator.permissions?.includes('manage_young_licenses'))reject('Operação exclusiva da administração.');
 const plan=typeof planId==='string'&&Object.hasOwn(plans,planId)?plans[planId]:null;if(!plan||!profile?.id||profile.disabled||typeof requestId!=='string'||!/^[a-zA-Z0-9_-]{12,100}$/.test(requestId))reject('Solicitação inválida.',400);
 if(!payment||payment.status!=='confirmed'||payment.confirmedBy!==operator.id||!payment.id||payment.profileId!==profile.id||payment.planId!==planId||payment.amountCents!==plan.priceCents)reject('Pagamento precisa de confirmação administrativa correspondente.',400);
 if(timestamp(payment.confirmedAt)>now+60000)reject('Confirmação com data inválida.',400);
 const fingerprint=[profile.id,payment.id,planId,plan.priceCents].join(':');if(priorOperation){if(priorOperation.requestId!==requestId||priorOperation.fingerprint!==fingerprint)reject('Solicitação já usada com dados diferentes.',409);return {...priorOperation,repeated:true};}
 if(existing?.profileId&&existing.profileId!==profile.id)reject('Licença de outro perfil.',400);
 if(existing?.status==='suspended')reject('Resolva a suspensão antes de renovar.',409);
 // Preserve already-paid remaining time rather than shortening it on early renewal.
 const base=existing?.status==='active'?Math.max(now,timestamp(existing.expiresAt)):now;
 const license={profileId:profile.id,status:'active',planId,startsAt:new Date(existing?.status==='active'&&timestamp(existing.expiresAt)>now?timestamp(existing.startsAt):now).toISOString(),expiresAt:new Date(base+plan.days*86400000).toISOString()};
 return {requestId,fingerprint,paymentId:payment.id,operatorId:operator.id,createdAt:new Date(now).toISOString(),license,repeated:false};
}
export function validateProgress(payload){if(payload?.version===2)return validateYoungCloudProgress(payload);if(!payload||payload.version!==1||!Array.isArray(payload.done)||payload.done.length>500||payload.done.some(id=>typeof id!=='string'||id.length>100)||typeof payload.drafts!=='object'||!payload.drafts||Array.isArray(payload.drafts))reject('Progresso inválido.',400);for(const[key,value]of Object.entries(payload.drafts))if(key.length>120||typeof value!=='string'||value.length>20000)reject('Rascunho inválido.',400);if(JSON.stringify(payload).length>250000)reject('Progresso excede o limite.',400);return {version:1,done:[...new Set(payload.done)],drafts:{...payload.drafts}};}
export function saveRevision({actor,profile,expectedRevision,record,payload,sharing=false}){authorizeProfile(actor,profile);if(!Number.isSafeInteger(expectedRevision)||expectedRevision<0||typeof sharing!=='boolean')reject('Revisão inválida.',400);if(record&&(record.profileId!==profile.id||record.guardianId!==actor.id))reject('Registro de outra conta.');if(expectedRevision!==(record?.revision??0))reject('Progresso alterado em outro aparelho.',409);return {guardianId:actor.id,profileId:profile.id,revision:expectedRevision+1,payload:validateProgress(payload),sharing};}
export function teacherCanRead({operator,record}){return !!(operator?.verifiedByServer&&operator.permissions?.includes('read_young_progress')&&record?.sharing===true);}
