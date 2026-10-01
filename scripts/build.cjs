const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const source=path.join(root,'public');
let files=0, pages=0, scripts=0;
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory()){walk(file);continue;}files++;if(file.endsWith('.js')){new vm.Script(fs.readFileSync(file,'utf8'),{filename:file});scripts++;}if(file.endsWith('.html')){pages++;const html=fs.readFileSync(file,'utf8');for(const match of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)){const link=match[1].split(/[?#]/)[0];if(!link||/^(?:[a-z]+:|\/\/)/i.test(link))continue;const target=link.startsWith('/')?path.join(source,link):path.resolve(path.dirname(file),link);if(!fs.existsSync(target))throw new Error('Missing file: '+file+' → '+link);}}}}
walk(source);
if(!fs.existsSync(path.join(source,'index.html')))throw new Error('Missing index.html');
if(!process.argv.includes('--check'))fs.cpSync(source,path.join(root,'dist'),{recursive:true});
console.log(JSON.stringify({files,pages,scripts,status:'passed',build:!process.argv.includes('--check')}));
