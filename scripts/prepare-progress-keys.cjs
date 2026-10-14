const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),catalog=JSON.parse(fs.readFileSync(path.join(root,'server/young-activity-keys.json'),'utf8'));
const rows=Object.entries(catalog).flatMap(([kind,keys])=>keys.map(key=>{if(!/^[a-zA-Z0-9:_-]+$/.test(key))throw Error('Unsafe activity key');return `('${kind}','${key}')`}));
const sql="-- Dedicated Young only. Catalog metadata, no student or private lesson text.\ncreate table young_private.activity_keys(kind text not null,activity_key text not null,primary key(kind,activity_key));\nrevoke all on young_private.activity_keys from public,anon,authenticated;\ninsert into young_private.activity_keys(kind,activity_key) values\n"+rows.join(',\n')+';\n';
fs.writeFileSync(path.join(root,'supabase/migrations/202610120006_young_activity_keys.sql'),sql);console.log('Prepared '+rows.length+' validated activity keys locally.');
