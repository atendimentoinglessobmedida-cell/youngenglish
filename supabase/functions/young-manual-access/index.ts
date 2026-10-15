import {createManualAccess} from './handler.mjs';
// The handler verifies each user with Auth and DB permissions, or an exact
// project secret injected by Supabase. Missing/forged credentials fail closed.
let operatorKeys: string[]=[];
try{const keys=JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')||'{}');operatorKeys=Object.values(keys).filter((value): value is string=>typeof value==='string');}catch{operatorKeys=[];}
Deno.serve(createManualAccess({
 serviceKey:Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
 publishableKey:Deno.env.get('SUPABASE_ANON_KEY'),
 operatorKeys,
}));
