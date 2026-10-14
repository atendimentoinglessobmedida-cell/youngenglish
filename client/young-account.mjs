import {createClient} from '@supabase/supabase-js';
const config=window.youngBackendConfig;
const client=createClient(config.url,config.key,{auth:{storage:sessionStorage,persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:'ism-young-auth-session'}});
window.youngAuth=client;
window.dispatchEvent(new Event('young-auth-ready'));
