(()=>{
 'use strict';
 const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
 const names={monthly:'Mensal',semiannual:'Semestral',annual:'Anual'};
 function amount(text){
  if(typeof text!=='string'||!/^\d{1,6}(?:[.,]\d{2})?$/.test(text.trim()))throw Error('Informe o valor com até duas casas decimais, por exemplo 58,99.');
  const [whole,fraction='00']=text.trim().replace(',','.').split('.');
  return Number(whole)*100+Number(fraction);
 }
 function createOperation(randomId=()=>crypto.randomUUID()){
  let previous=null;
  return {
   clear(){previous=null;},
   prepare(input,plans){
    if(input.confirmed!==true)throw Error('Confirme que conferiu o recebimento e o perfil com o responsável.');
    const profileId=String(input.profileId||'').trim(),planId=input.planId;
    if(!uuid.test(profileId))throw Error('Cole o código do perfil enviado pelo responsável.');
    const plan=typeof planId==='string'&&Object.hasOwn(plans,planId)?plans[planId]:null;
    if(!plan||!Number.isSafeInteger(plan.priceCents)||plan.priceCents<=0)throw Error('Selecione um plano disponível.');
    const paymentReference=String(input.paymentReference||'').trim();
    if(!/^[a-zA-Z0-9_-]{12,100}$/.test(paymentReference))throw Error('Use uma referência interna única de 12 a 100 letras, números, traços ou sublinhados.');
    const amountCents=amount(input.amount);
    if(amountCents!==plan.priceCents)throw Error('O valor conferido não corresponde ao plano. Nenhuma ativação foi solicitada.');
    const fingerprint=JSON.stringify([profileId,planId,paymentReference,amountCents]);
    if(!previous||previous.fingerprint!==fingerprint)previous={fingerprint,requestId:randomId()};
    return {profileId,planId,paymentReference,amountCents,requestId:previous.requestId,confirmed:true};
   },
  };
 }
 function mount(panel,{request,task,status}){
  let plans={};const operation=createOperation();
  const section=document.createElement('section');section.id='young-period-tools';section.hidden=true;
  section.innerHTML='<h3>Ativar ou renovar Premium</h3><p>O responsável entra na conta, cria o perfil e copia seu código para você. Confira o código pelo canal pessoal combinado. Esta tela registra um recebimento já conferido; não realiza cobrança.</p><form id="young-period-form"><label>Código do perfil<input name="profileId" required maxlength="36" autocomplete="off" spellcheck="false"></label><label>Plano<select name="planId" required></select></label><p id="young-period-price"></p><label>Valor recebido e conferido (R$)<input name="amount" inputmode="decimal" required maxlength="10" placeholder="58,99" autocomplete="off"></label><label>Referência interna única do recebimento<input name="paymentReference" required minlength="12" maxlength="100" pattern="[a-zA-Z0-9_-]{12,100}" autocomplete="off" aria-describedby="young-reference-help"></label><p id="young-reference-help">Use a mesma referência ao repetir uma tentativa do mesmo recebimento. Não informe dados bancários, CPF, cartão ou comprovante neste campo.</p><label><input name="confirmed" type="checkbox" required> Conferi o recebimento real, o plano e o código do perfil com o responsável.</label><button class="primary">Registrar ou renovar Premium</button></form><p id="young-period-result" role="status" aria-live="polite"></p>';
  panel.append(section);
  const form=section.querySelector('form'),result=section.querySelector('#young-period-result'),select=form.elements.planId;
  const money=cents=>(cents/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  function price(){const plan=plans[select.value];section.querySelector('#young-period-price').textContent=plan?'Valor do plano: '+money(plan.priceCents)+' · '+plan.days+' dias.':'';}
  select.onchange=price;
  form.onsubmit=event=>{event.preventDefault();task(async()=>{
   result.textContent='';
   const payload=operation.prepare({profileId:form.elements.profileId.value,planId:select.value,paymentReference:form.elements.paymentReference.value,amount:form.elements.amount.value,confirmed:form.elements.confirmed.checked},plans);
   let data;
   try{data=await request(payload);}catch(error){
    result.textContent=error.status===409?'Há conflito na referência ou na licença. Confira o registro antes de renovar.':'A confirmação não chegou. Confira o estado e repita com a mesma referência; não crie outra referência para o mesmo recebimento.';
    if(error.status===409){status('Operação não confirmada. Confira a licença e a referência.');return;}
    throw error;
   }
   const confirmation=data.confirmation,license=confirmation?.license;
   if(license?.profileId!==payload.profileId||license.status!=='active'||!Number.isFinite(Date.parse(license.expiresAt)))throw Error('A ativação não foi confirmada. Confira o estado antes de tentar outra referência.');
   result.textContent=(confirmation.repeated?'Operação já registrada; nenhum período duplicado. ':'Período registrado. ')+'Premium ativo até '+new Date(license.expiresAt).toLocaleString('pt-BR')+'. Peça ao responsável para selecionar o perfil novamente.';
   form.elements.confirmed.checked=false;
   status('Registro administrativo confirmado pelo servidor.');
  });};
  return {
   render(identity){
    section.hidden=identity?.permissions?.administrator!==true;
    select.replaceChildren();plans={};operation.clear();form.reset();result.textContent='';
    if(!section.hidden)for(const[id,plan]of Object.entries(identity.plans||{})){
     if(!Object.hasOwn(names,id)||!Number.isSafeInteger(plan.days)||plan.days<=0||!Number.isSafeInteger(plan.priceCents)||plan.priceCents<=0)continue;
     plans[id]={days:plan.days,priceCents:plan.priceCents};select.add(new Option(names[id]+' · '+money(plan.priceCents),id));
    }
    price();
   },
  };
 }
 window.ISMYoungPeriods={amount,createOperation,mount};
})();
