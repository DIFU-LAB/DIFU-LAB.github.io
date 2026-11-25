import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { collectGoatCounterRaw } from './snapshot-goatcounter.mjs';
import { goatCounterSite, selectVisitorMapProvider, visitorDotsUrl } from '../client/src/services/visitorMapProvider.ts';
const centres = JSON.parse(await readFile(new URL('../integrations/goatcounter/country-centres.json', import.meta.url), 'utf8'));
const providers = ['cloudflare','goatcounter','visitordots','abacus'];
const dayMs = 86400000;
const day = d => d.toISOString().slice(0,10);
const count = n => Number.isSafeInteger(n) && n >= 0;
const validDay = s => typeof s === 'string' && /^\d{4}-\d\d-\d\d$/.test(s) && Number.isFinite(Date.parse(s)) && day(new Date(s)) === s;
const sum = a => a.reduce((x,y) => { if (!count(x+y)) throw Error('Count overflow'); return x+y; },0);
export function sourceId(provider, account, generation='1') {
  if (!providers.includes(provider) || typeof account !== 'string' || !account.trim() || typeof generation !== 'string' || !/^[\w.-]{1,64}$/.test(generation)) throw Error('Invalid history source');
  return `${provider}-${createHash('sha256').update(JSON.stringify([account,generation])).digest('hex').slice(0,24)}`;
}
export const emptyHistory = () => ({version:1,sources:{}});
export function normalizeCounts(visits, countries={}) {
  if (!count(visits) || !countries || typeof countries !== 'object' || Array.isArray(countries)) throw Error('Invalid aggregate counts');
  const entries = Object.entries(countries);
  for (const [code,n] of entries) if (!/^[A-Z]{2}$/.test(code) || ['XX','ZZ','EU','AP','T1'].includes(code) || !count(n)) throw Error('Invalid country aggregate');
  if (sum(entries.map(([,n])=>n)) > visits) throw Error('Country counts exceed total');
  return {visits,countries:Object.fromEntries(entries.filter(([,n])=>n>0).sort(([a],[b])=>a.localeCompare(b)))};
}
function checkEntry(entry) {
  if (!entry || !validDay(entry.date) || !['daily','cumulative'].includes(entry.kind)) throw Error('Invalid historical date or kind');
  return normalizeCounts(entry.visits,entry.countries);
}
export function ingest(history, {provider, account, generation='1', date, kind, visits, countries}) {
  const id = sourceId(provider,account,generation);
  const value = checkEntry({date,kind,visits,countries});
  let source = history.sources[id];
  if (source && (source.kind !== kind || source.provider !== provider)) throw Error('Cannot mix daily and cumulative records for one source');
  const records = source?.records ?? {};
  const previous = records[date];
  const dates = Object.keys(records).sort();
  const before = kind === 'cumulative' ? records[dates.filter(d=>d<=date).at(-1)] : previous;
  const after = kind === 'cumulative' ? records[dates.find(d=>d>date)] : undefined;
  if ((before && value.visits < before.visits) || (after && value.visits > after.visits)) throw Error('Counter decreased or historical snapshot is out of order; previous data retained. Verify provider or explicitly start a new generation.');
  // Do not accept a temporary geography loss as a reset. Missing geography in a
  // total-only manual import retains the last known cumulative country counts.
  if (kind === 'cumulative') {
    const merged = {...before?.countries,...value.countries};
    for (const [code,n] of Object.entries(before?.countries ?? {})) if ((merged[code]??0)<n) throw Error('Country counter decreased; previous data retained');
    if (after) for (const [code,n] of Object.entries(merged)) if ((after.countries[code]??0)<n) throw Error('Historical country snapshot is out of order');
    Object.assign(value,normalizeCounts(value.visits,merged));
  }
  if (kind === 'daily' && previous && Object.keys(previous.countries).some(code=>(value.countries[code]??0)<previous.countries[code])) throw Error('Daily geography decreased; previous data retained');
  if (!source) history.sources[id] = source = {provider,kind,records:{}};
  source.records[date] = value;
  return id;
}
export function validateHistory(h) {
  if (h?.version!==1 || !h.sources || typeof h.sources!=='object' || Array.isArray(h.sources)) throw Error('Invalid history version');
  for (const [id,s] of Object.entries(h.sources)) {
    if (!providers.includes(s.provider) || !new RegExp(`^${s.provider}-[a-f0-9]{24}$`).test(id) || !['daily','cumulative'].includes(s.kind) || !s.records || Array.isArray(s.records) || typeof s.records!=='object') throw Error('Invalid history source');
    let prev;
    for (const date of Object.keys(s.records).sort()) {
      const v=checkEntry({date,kind:s.kind,...s.records[date]});
      if(s.kind==='cumulative' && prev && (v.visits<prev.visits || Object.keys(prev.countries).some(c=>(v.countries[c]??0)<prev.countries[c]))) throw Error('Invalid decreasing history');
      prev=v;
    }
  }
  return h;
}
export function summarize(history) {
  validateHistory(history);
  let visits=0, updatedAt, from;
  const countries={}, byProvider={};
  for (const source of Object.values(history.sources)) {
    const dates=Object.keys(source.records).sort(); if (!dates.length) continue;
    if (!from || dates[0]<from) from=dates[0];
    if (!updatedAt || dates.at(-1)>updatedAt) updatedAt=dates.at(-1);
    const entries=source.kind==='cumulative' ? [source.records[dates.at(-1)]] : dates.map(d=>source.records[d]);
    for (const e of entries) {
      visits=sum([visits,e.visits]); byProvider[source.provider]=sum([byProvider[source.provider]??0,e.visits]);
      for (const [c,n] of Object.entries(e.countries)) countries[c]=sum([countries[c]??0,n]);
    }
  }
  if (!updatedAt) return null;
  const ranked=Object.entries(countries).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
  const cells=new Map();
  for (const [code,n] of ranked) if (n>=3 && Object.hasOwn(centres,code)) {
    const [latitude,longitude]=centres[code]; const key=`${latitude},${longitude}`;
    const cell=cells.get(key)??{latitude,longitude,visits:0}; cell.visits=sum([cell.visits,n]); cells.set(key,cell);
  }
  return {historical:true,visits,countries:ranked.length,topCountries:ranked.filter(([,n])=>n>=3).slice(0,8).map(([countryCode,visits])=>({countryCode,visits})),points:[...cells.values()].sort((a,b)=>b.visits-a.visits).slice(0,300),updatedAt,from,byProvider};
}
export function selectedConfig(cfg,env=process.env) {
  const endpoint=(env.VITE_VISITOR_MAP_ENDPOINT||cfg.visitorMap.endpoint).trim().replace(/\/+$/,'');
  const site=goatCounterSite(env.VITE_GOATCOUNTER_SITE||cfg.goatCounter.site);
  const vd=[cfg.visitorDots.mapUrl,cfg.visitorDots.counterUrl,cfg.visitorDots.detailsUrl].map(visitorDotsUrl);
  const validEndpoint=/^https:\/\/[^/?#]+(?:\/[^?#]*)?$/.test(endpoint);
  const provider=cfg.visitorMap.enabled && selectVisitorMapProvider(cfg.visitorMap.provider,validEndpoint,cfg.visitorDots.enabled&&vd.every(Boolean)&&new Set(vd).size===3,cfg.goatCounter.enabled&&!!site);
  if(provider==='cloudflare') return {provider,account:endpoint};
  if(provider==='goatcounter') return {provider,account:site};
  if(provider==='visitordots') return {provider,account:vd[2]};
  if(cfg.visitorCounter.enabled && cfg.visitorCounter.namespace && cfg.visitorCounter.key) return {provider:'abacus',account:`${cfg.visitorCounter.namespace}/${cfg.visitorCounter.key}`};
  return null;
}
async function getJson(url,headers={},fetcher=fetch) {
  const response=await fetcher(url,{headers,redirect:'error',signal:AbortSignal.timeout(20000)});
  if(!response.ok) throw Error(`Provider returned HTTP ${response.status}`);
  return response.json();
}
export async function collectCumulative(source,cfg,fetcher=fetch) {
  if(source.provider==='abacus') {
    const {namespace,key}=cfg.visitorCounter;
    const data=await getJson(`https://abacus.jasoncameron.dev/get/${encodeURIComponent(namespace)}/${encodeURIComponent(key)}`,{},fetcher);
    return normalizeCounts(data.value);
  }
  if(source.provider==='cloudflare') {
    const origin=`https://${cfg.visitorCounter.hosts[0]}`;
    const data=await getJson(`${source.account}/archive`,{Origin:origin},fetcher);
    return normalizeCounts(data.visits,data.countries);
  }
  throw Error('No automatic cumulative API for this provider');
}
export function goatDays(records,now=new Date(),lookback=30) {
  const days=[];
  for(let i=lookback;i>=1;i--) {const d=day(new Date(now.getTime()-i*dayMs)); if(!Object.hasOwn(records,d)||i<=2) days.push(d);}
  return days;
}
export async function runArchive({history,cfg,imports=[],env=process.env,now=new Date(),fetcher=fetch,wait}={}) {
  validateHistory(history);
  const warnings=[]; const today=day(now);
  if(!Array.isArray(imports)) throw Error('Manual imports must be an array');
  for(const entry of imports) {
    if(!entry || entry.date>today) throw Error('Invalid future import');
    const value=checkEntry(entry);
    const id=sourceId(entry.provider,entry.account,entry.generation);
    const old=history.sources[id]?.records[entry.date];
    // Replayed imports must not undo a more complete automatic observation.
    if(old && history.sources[id].kind===entry.kind && old.visits>=value.visits && Object.entries(value.countries).every(([c,n])=>(old.countries[c]??0)>=n)) continue;
    ingest(history,entry);
  }
  const active=selectedConfig(cfg,env);
  const generationFor=p=>p==='goatcounter'?'1':env[`VISITOR_HISTORY_GENERATION_${p.toUpperCase()}`]||'1';
  const candidates=providers.map(provider=>selectedConfig({...cfg,visitorMap:{...cfg.visitorMap,enabled:provider!=='abacus',provider},visitorCounter:{...cfg.visitorCounter,enabled:provider==='abacus'}},env)).filter(Boolean);
  const sources=candidates.filter(s=>s.provider===active?.provider || Object.hasOwn(history.sources,sourceId(s.provider,s.account,generationFor(s.provider))));
  if(active?.provider==='visitordots') warnings.push('VisitorDots has no documented free export API; import its aggregate totals manually.');
  for(const source of sources) {
  if(source.provider==='visitordots') continue;
  const generation=generationFor(source.provider);
  try {
    if(source.provider==='goatcounter') {
      const id=sourceId(source.provider,source.account,generation);
      for(const date of goatDays(history.sources[id]?.records??{},now)) {
        try {
          const start=new Date(`${date}T00:00:00Z`),end=new Date(`${date}T23:00:00Z`);
          const {total,rows}=await collectGoatCounterRaw(source.account,env.GOATCOUNTER_API_KEY,{start,end,fetcher,...(wait?{wait}:{})});
          const countries={};
          for(const row of rows) {
            if(!row||typeof row.id!=='string'||!count(row.count)) throw Error('Invalid GoatCounter country row');
            const code=row.id.toUpperCase(); if(!/^[A-Z]{2}$/.test(code)||['XX','ZZ','EU','AP','T1'].includes(code)) continue;
            if(Object.hasOwn(countries,code)) throw Error('Duplicate country'); countries[code]=row.count;
          }
          ingest(history,{...source,generation,date,kind:'daily',visits:total.total_utc,countries});
        } catch(e) { warnings.push(`GoatCounter ${date}: ${e.message}`); if(/HTTP (401|403|429)|key required/.test(e.message)) break; }
      }
    } else {
      const counts=await collectCumulative(source,cfg,fetcher);
      ingest(history,{...source,generation,date:today,kind:'cumulative',...counts});
    }
  } catch(e) { warnings.push(`${source.provider}: ${e.message}`); }
  }
  return warnings;
}
async function main() {
  const dir=resolve(process.argv[2]||''); if(!process.argv[2]) throw Error('Archive directory required');
  await mkdir(dir,{recursive:true});
  const file=resolve(dir,'history.json');
  let history; try{history=JSON.parse(await readFile(file,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;history=emptyHistory();}
  const cfg=JSON.parse(await readFile('content/site/services.json','utf8'));
  const imports=JSON.parse(await readFile('integrations/visitor-history/imports.json','utf8'));
  const warnings=await runArchive({history,cfg,imports});
  const summary=summarize(history);
  await writeFile(file,JSON.stringify(history,null,2)+'\n');
  await writeFile(resolve(dir,'visitor-history.json'),JSON.stringify(summary)+'\n');
  for(const warning of warnings) console.warn(`::warning::${warning.replace(/[\r\n]/g,' ')}`);
  if(warnings.length) console.warn('Historical data preserved; one or more imports incomplete.');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href) main().catch(e=>{console.error(e.message);process.exitCode=1;});
