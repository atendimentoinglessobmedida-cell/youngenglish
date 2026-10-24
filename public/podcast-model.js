/* Playback helpers deliberately do not read course, identity or license state. */
((root)=>{'use strict';
 function format(seconds){const n=Math.max(0,Math.floor(Number(seconds)||0));return Math.floor(n/60)+':'+String(n%60).padStart(2,'0');}
 function chapterAt(chapters,time){let index=0;for(let i=0;i<chapters.length;i++)if(time>=chapters[i].start)index=i;return index;}
 function settings(input,episodes){const value=input&&typeof input==='object'?input:{};return {episode:episodes.some(e=>e.id===value.episode)?value.episode:episodes[0]?.id,language:value.language==='pt'?'pt':'en',speed:[.75,1,1.25].includes(value.speed)?value.speed:1,chapter:Number.isInteger(value.chapter)&&value.chapter>=0&&value.chapter<6?value.chapter:0};}
 root.ISMPodcastModel={format,chapterAt,settings};
})(typeof window==='undefined'?globalThis:window);
