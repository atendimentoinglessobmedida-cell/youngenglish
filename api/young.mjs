import {readFileSync} from 'node:fs';
import {createYoungRuntime} from '../server/young-runtime.mjs';
const lessonIds=new Set(JSON.parse(readFileSync(new URL('../server/young-lesson-ids.json',import.meta.url),'utf8')));
const config=JSON.parse(readFileSync(new URL('../server/young-public-config.json',import.meta.url),'utf8'));
const handler=createYoungRuntime({env:{...config,...process.env},lessonIds});
export default {fetch:handler};
