const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const context=vm.createContext({window:{}});vm.runInContext(fs.readFileSync('public/young-periods.js','utf8'),context);
const {amount,createOperation}=context.window.ISMYoungPeriods;
const plans={monthly:{days:30,priceCents:5899}},profileId='11111111-1111-4111-8111-111111111111';
const input={profileId,planId:'monthly',paymentReference:'received_fixture_001',amount:'58,99',confirmed:true};
test('manual amounts preserve cents and reject ambiguous or malformed formats',()=>{
 assert.equal(amount('58,99'),5899);assert.equal(amount('58.99'),5899);assert.equal(amount('58'),5800);assert.equal(amount('0,01'),1);
 for(const value of ['58,9','1.234,56','-58,99','58.999','5e2','Infinity','',null])assert.throws(()=>amount(value));
});
test('retries preserve the operation identifier and real changes select a new one',()=>{
 let id=0;const op=createOperation(()=>`fixture_operation_${++id}`),first=op.prepare(input,plans),retry=op.prepare({...input,amount:'58.99'},plans);
 assert.equal(first.requestId,retry.requestId);assert.equal(first.amountCents,5899);assert.equal(first.profileId,profileId);
 assert.notEqual(first.requestId,op.prepare({...input,paymentReference:'received_fixture_002'},plans).requestId);
 op.clear();assert.notEqual(first.requestId,op.prepare(input,plans).requestId);
});
test('no administrative payload is made before profile, receipt, value and confirmation are valid',()=>{
 const op=createOperation(()=>{throw Error('Must not allocate an operation for invalid input');});
 for(const patch of [{profileId:'other'},{planId:'__proto__'},{planId:'unknown'},{amount:'0,01'},{paymentReference:'short'},{confirmed:false}])assert.throws(()=>op.prepare({...input,...patch},plans));
});
