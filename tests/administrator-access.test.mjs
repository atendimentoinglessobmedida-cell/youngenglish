import test from 'node:test';
import assert from 'node:assert/strict';
import {authorizePremium} from '../server/commercial-policy.mjs';
test('administrator access requires a verified server actor, DB permission and owned enabled profile',()=>{
 const actor={id:'owner',verifiedByServer:true,permissions:['manage_young_licenses']};
 const profile={id:'profile',guardianId:'owner',disabled:false};
 assert.equal(authorizePremium({actor,profile}).administrator,true);
 assert.throws(()=>authorizePremium({actor:{...actor,verifiedByServer:false},profile}));
 assert.throws(()=>authorizePremium({actor:{...actor,permissions:[]},profile}));
 assert.throws(()=>authorizePremium({actor,profile:{...profile,guardianId:'other'}}));
 assert.throws(()=>authorizePremium({actor,profile:{...profile,disabled:true}}));
});
