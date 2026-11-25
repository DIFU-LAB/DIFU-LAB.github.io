import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { goatCounterSite, selectVisitorMapProvider, visitorDotsUrl } from '../client/src/services/visitorMapProvider.ts';
const centres = JSON.parse(await readFile(new URL('../integrations/goatcounter/country-centres.json', import.meta.url), 'utf8'));
const isCount = v => Number.isSafeInteger(v) && v >= 0;
export function normalizeGoatCounter(total, rows, updatedAt) {
  // Geographic stats are UTC; use the corresponding UTC total (not pageviews).
  if (!isCount(total.total_utc) || !Array.isArray(rows)) throw Error('Invalid GoatCounter statistics');
  const visits = total.total_utc;
  const countries = new Map();
  for (const row of rows) {
    if (!row || typeof row.id !== 'string' || !isCount(row.count) || row.count > visits) throw Error('Invalid location row');
    const code = row.id.toUpperCase();
    if (!/^[A-Z]{2}$/.test(code) || ['XX','ZZ','EU','AP'].includes(code) || !row.count) continue;
    if (countries.has(code)) throw Error('Duplicate country in geographic report');
    countries.set(code, row.count);
  }
  const sorted = [...countries].sort((a,b) => b[1]-a[1] || a[0].localeCompare(b[0]));
  // Multiple country points can share coordinates; combine those map cells.
  const cells = new Map();
  for (const [code, count] of sorted) {
    if (count < 3 || !Object.hasOwn(centres, code)) continue;
    const [latitude, longitude] = centres[code];
    const key = `${latitude},${longitude}`;
    const cell = cells.get(key) ?? {latitude, longitude, visits: 0};
    cell.visits += count;
    if (cell.visits > visits) throw Error('Geographic count exceeds total');
    cells.set(key, cell);
  }
  return { visits, countries: countries.size, topCountries: sorted.slice(0,8).map(([countryCode, visits]) => ({countryCode, visits})), points: [...cells.values()], updatedAt };
}
export async function collectGoatCounterRaw(site, key, {fetcher=fetch, start, end, wait=delay}={}) {
  if (!goatCounterSite(site) || !key) throw Error('GoatCounter site and read-only API key required');
  const params = new URLSearchParams({start:start.toISOString(), end:end.toISOString()});
  const get = async (path, extra={}) => {
    const query = new URLSearchParams(params);
    for (const [k,v] of Object.entries(extra)) query.set(k,String(v));
    const response = await fetcher(`https://${site}.goatcounter.com/api/v0/stats/${path}?${query}`, {headers:{Authorization:`Bearer ${key}`, 'Content-Type':'application/json'}, redirect:'error', signal:AbortSignal.timeout(15000)});
    if (!response.ok) throw Error(`GoatCounter ${path} HTTP ${response.status}`);
    return response.json();
  };
  const total = await get('total');
  const rows = [];
  for (let page=0; page<10; page++) {
    await wait(500);
    const data = await get('locations',{limit:100,offset:rows.length});
    if (!Array.isArray(data.stats) || typeof data.more !== 'boolean' || (data.more && !data.stats.length)) throw Error('Invalid geographic pagination');
    rows.push(...data.stats);
    if (!data.more) return {total,rows};
  }
  throw Error('Incomplete geographic report');
}
export async function collectGoatCounter(site,key,{fetcher=fetch,now=new Date(),wait=delay}={}) {
  const end = new Date(Math.floor(now.getTime()/3600000)*3600000);
  const start = new Date(end.getTime()-30*86400000);
  const {total,rows}=await collectGoatCounterRaw(site,key,{fetcher,start,end,wait});
  return normalizeGoatCounter(total,rows,end.toISOString());
}
async function main() {
  const cfg = JSON.parse(await readFile('content/site/services.json','utf8'));
  const site = goatCounterSite(process.env.VITE_GOATCOUNTER_SITE || cfg.goatCounter.site);
  const endpoint = (process.env.VITE_VISITOR_MAP_ENDPOINT || cfg.visitorMap.endpoint).trim().replace(/\/+$/, '');
  const vd = [cfg.visitorDots.mapUrl,cfg.visitorDots.counterUrl,cfg.visitorDots.detailsUrl].map(visitorDotsUrl);
  const provider = cfg.visitorMap.enabled && selectVisitorMapProvider(cfg.visitorMap.provider,/^https:\/\/[^/?#]+(?:\/[^?#]*)?$/.test(endpoint),cfg.visitorDots.enabled && vd.every(Boolean) && new Set(vd).size===3,cfg.goatCounter.enabled && !!site);
  if (provider !== 'goatcounter') return console.log('GoatCounter is not selected; no snapshot needed.');
  const snapshot = await collectGoatCounter(site,process.env.GOATCOUNTER_API_KEY);
  await writeFile('dist/visitor-stats.json', JSON.stringify(snapshot)+'\n');
  console.log('Published aggregate GoatCounter snapshot.');
}
if (process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href) main().catch(err => { console.error(err.message); process.exitCode=1; });
