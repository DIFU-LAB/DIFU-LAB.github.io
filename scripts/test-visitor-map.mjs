import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import worker from '../integrations/visitor-map/worker.mjs';
const origin='https://difulab.com';
function setup(){
 const db=new DatabaseSync(':memory:');db.exec(readFileSync(new URL('../integrations/visitor-map/schema.sql',import.meta.url),'utf8'));
 const env={ALLOWED_ORIGINS:origin,DB:{prepare(sql){const st=db.prepare(sql);return {bind(...args){return {async run(){return {meta:st.run(...args)}}}},all(){return {results:st.all()}}}},async batch(stmts){return stmts.map(s=>s.all())}},VISIT_LIMITER:{async limit(){return {success:true}}}};
 const jobs=[];const ctx={waitUntil(p){jobs.push(p)}};
 const req=(path,body,opts={})=>{const r=new Request('https://worker.example'+path,{method:body===undefined?'GET':'POST',headers:{Origin:origin,'User-Agent':'Mozilla/5.0','Content-Type':'application/json',...opts.headers},...(body===undefined?{}:{body:JSON.stringify(body)})});Object.defineProperty(r,'cf',{value:opts.cf??{country:'GB',latitude:'51.24',longitude:'-0.59'}});return r};
 return {env,ctx,jobs,req,db,call:(path,body,opts)=>worker.fetch(req(path,body,opts),env,ctx)};
}
test('deduplicates, aggregates, suppresses small map cells and retains counts',async()=>{
 const {call,db,env,ctx,jobs}=setup();const id=crypto.randomUUID();
 assert.deepEqual(await (await call('/visit',{visitorId:id})).json(),{recorded:true});
 assert.deepEqual(await (await call('/visit',{visitorId:id})).json(),{recorded:false});
 assert.deepEqual((await (await call('/summary')).json()).points,[]);
 for(let i=0;i<2;i++)await call('/visit',{visitorId:crypto.randomUUID()});
 await call('/visit',{visitorId:crypto.randomUUID()},{cf:{country:'US'}});
 const summary=await (await call('/summary')).json();assert.equal(summary.visits,4);assert.equal(summary.countries,2);assert.deepEqual(summary.points,[{latitude:50,longitude:0,visits:3}]);assert.equal(summary.topCountries[0].visits,3);
 db.exec('UPDATE visit_dedupe SET bucket=0');await worker.scheduled(null,env,ctx);await Promise.all(jobs);assert.equal(db.prepare('SELECT COUNT(*) AS n FROM visit_dedupe').get().n,0);assert.equal((await (await call('/summary')).json()).visits,4);
});
test('rejects unauthorized origins, invalid and oversized requests, bots and rate-limited writes',async()=>{
 const {call,env}=setup();assert.equal((await call('/summary',undefined,{headers:{Origin:'https://other.example'}})).status,403);assert.equal((await call('/visit',{visitorId:'bad'})).status,400);assert.equal((await call('/visit',{visitorId:'x'.repeat(300)})).status,400);assert.deepEqual(await(await call('/visit',{visitorId:crypto.randomUUID()},{headers:{'User-Agent':'Googlebot'}})).json(),{recorded:false});env.VISIT_LIMITER.limit=async()=>({success:false});assert.equal((await call('/visit',{visitorId:crypto.randomUUID()})).status,429);assert.equal((await(await call('/summary')).json()).visits,0);
});
