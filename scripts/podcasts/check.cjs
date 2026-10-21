const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto'),path=require('node:path');
const pub=fs.existsSync('web/podcasts.html')?'web':'public',context={window:{}};
for(const name of ['podcast-data.js','podcast-model.js'])vm.runInNewContext(fs.readFileSync(path.join(pub,name),'utf8'),context);
const episodes=context.window.ISMPodcasts,model=context.window.ISMPodcastModel;
assert.equal(episodes.length,3);let count=0;
for(const episode of episodes){
 const voices=new Map();assert.match(episode.disclosure,/Kokoro/);
 for(const [language,v]of Object.entries(episode.versions)){
  count++;assert.ok(['en','pt'].includes(language));assert.equal(v.chapters.length,6);assert.ok(v.duration>120&&v.duration<600);
  assert.match(v.audio,/^assets\/podcasts\/[a-z-]+-(en|pt)\.mp3$/);
  const bytes=fs.readFileSync(path.join(pub,v.audio));assert.equal(bytes.length,v.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),v.sha256);
  let cursor=0;for(const chapter of v.chapters){assert.equal(chapter.start,cursor);assert.ok(chapter.end>chapter.start);let previous=chapter.start;
   for(const s of chapter.segments){assert.ok(s.text.trim());assert.ok(s.start>=previous&&s.end>s.start);previous=s.end;assert.ok(['en-US','pt-BR'].includes(s.lang));if(language==='en')assert.equal(s.lang,'en-US');assert.ok(['pf_dora','af_heart','am_michael'].includes(s.voice));if(s.lang==='pt-BR')assert.equal(s.voice,'pf_dora');if(s.role!=='narrator'){if(voices.has(s.role))assert.equal(voices.get(s.role),s.voice);voices.set(s.role,s.voice);}}
   cursor=chapter.end;
  }
  assert.equal(cursor,v.duration);assert.equal(v.chapters[3].segments.filter(s=>s.role!=='narrator').length,12);assert.equal(v.chapters[4].segments.filter(s=>s.pauseMs===4500).length,3);
 }
 assert.equal(new Set(voices.values()).size,2);
}
assert.equal(count,6);assert.equal(model.settings(null,episodes).language,'en');assert.equal(model.settings({language:'pt'},episodes).language,'pt');assert.equal(model.format(65),'1:05');
for(const episode of episodes)for(const v of Object.values(episode.versions))for(const [i,ch]of v.chapters.entries())assert.equal(model.chapterAt(v.chapters,ch.start),i);
const player=fs.readFileSync(path.join(pub,'podcasts.js'),'utf8'),html=fs.readFileSync(path.join(pub,'podcasts.html'),'utf8');
assert.ok(!/autoplay|speechSynthesis|fetch\(/.test(player+html));assert.ok(player.includes('stop(true)'));assert.ok(player.includes('pagehide'));assert.ok(player.includes('sha256.slice(0,12)'));assert.ok(html.includes('Ver em português'));assert.ok(html.includes('tabindex="-1"'));
assert.ok(!/supabase|api\/progress|api\/premium|api\/access/.test(player));
for(const [,link]of html.matchAll(/(?:src|href)="([^"#]+)"/g)){if(link==='/')continue;assert.ok(fs.existsSync(path.join(pub,link)),link);}
console.log('PASS: three original episodes, six matching MP3s, 36 dialogue turns, 18 timed chapters per language, stable neural character voices, practice pauses, no autoplay or account/progress writes.');
