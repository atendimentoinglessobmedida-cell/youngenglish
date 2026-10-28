(function(root){'use strict';
 const levels=['B1','B2','C1'];
 function pair(value){const parts=String(value||'').split('|');return {en:parts[0],pt:parts.slice(1).join('|')};}
 function check(item,choice){if(!Number.isInteger(choice)||choice<0||choice>=item[1].length)return null;return {correct:choice===item[2],feedback:pair(item[3])};}
 function draft(value,unitId){if(!value||value.unitId!==unitId||!value.answers||typeof value.answers!=='object'||Array.isArray(value.answers))return {};return Object.fromEntries(Object.entries(value.answers).filter(([key,text])=>/^[a-z]+-[0-9]+$/.test(key)&&typeof text==='string'&&text.length<=4000));}
 function coverage(unit){return {recycled:unit.recycle.length,newItems:unit.words.length,dialogueTurns:unit.dialogue.length,questions:unit.questions.length,grammar:unit.checks.length};}
 const api={levels,pair,check,draft,coverage};if(typeof module==='object'&&module.exports)module.exports=api;else root.ISMDebateModel=api;
})(typeof window==='object'?window:globalThis);
