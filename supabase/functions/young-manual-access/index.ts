import {createManualAccess} from './handler.mjs';
Deno.serve(createManualAccess({
  serviceKey:Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
  publishableKey:Deno.env.get('SUPABASE_ANON_KEY'),
}));
