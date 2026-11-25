import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyHistory, ingest, summarize, sourceId, validateHistory, runArchive, goatDays, collectCumulative } from './visitor-history.mjs';
// Keep provider tests independent of editable production service settings.
const cfg = {
    visitorMap: { enabled: true, endpoint: '', provider: 'auto' },
    visitorCounter: { enabled: true, namespace: 'example.org', key: 'test-counter', hosts: ['example.com', 'example.org'] },
    goatCounter: { enabled: true, site: '' },
    visitorDots: { enabled: true, mapUrl: '', counterUrl: '', detailsUrl: '' },
};
const cf = (date, visits, countries = {}, generation = '1') => ({ provider: 'cloudflare', account: 'https://example.workers.dev', kind: 'cumulative', date, visits, countries, generation });
const gc = (date, visits, countries = {}) => ({ provider: 'goatcounter', account: 'lab', kind: 'daily', date, visits, countries });
test('daily snapshots of cumulative sources are not summed; retries replace the same date', () => {
    const h = emptyHistory(); ingest(h, cf('2026-11-23', 100, { GB: 60 })); ingest(h, cf('2026-11-24', 110, { GB: 65 })); ingest(h, cf('2026-11-24', 112, { GB: 66 })); ingest(h, cf('2026-11-24', 112, { GB: 66 }));
    assert.equal(summarize(h).visits, 112); assert.equal(summarize(h).topCountries[0].visits, 66); assert.equal(Object.keys(h.sources[Object.keys(h.sources)[0]].records).length, 2);
    assert.throws(() => ingest(h, cf('2026-11-25', 10, { GB: 3 })), /decreased/); assert.equal(summarize(h).visits, 112);
    assert.throws(() => ingest(h, cf('2026-11-25', 115, { GB: 62 })), /Country counter decreased/);
    ingest(h, cf('2026-11-25', 8, { GB: 4 }, 'reset-2')); assert.equal(summarize(h).visits, 120); assert.equal(summarize(h).topCountries[0].visits, 70);
});
test('non-overlapping daily GoatCounter data and provider changes aggregate without duplication', () => {
    const h = emptyHistory(); ingest(h, cf('2026-11-23', 40, { GB: 10 })); ingest(h, gc('2026-11-24', 5, { GB: 2, US: 3 })); ingest(h, gc('2026-11-24', 6, { GB: 3, US: 3 })); ingest(h, gc('2026-11-25', 8, { GB: 3, DE: 5 }));
    const vd = { provider: 'visitordots', account: 'https://visitordots.com/data/a', kind: 'cumulative', date: '2026-11-26', visits: 9, countries: { DE: 6 } }; ingest(h, vd); ingest(h, vd);
    const a = summarize(h); assert.equal(a.visits, 63); assert.equal(a.countries, 3); assert.deepEqual(a.byProvider, { cloudflare: 40, goatcounter: 14, visitordots: 9 }); assert.equal(a.topCountries.find(x => x.countryCode === 'GB').visits, 16); assert.equal(a.topCountries.find(x => x.countryCode === 'DE').visits, 11);
    assert.throws(() => ingest(h, gc('2026-11-25', 1, {})), /decreased/); assert.deepEqual(summarize(h), a);
    assert.throws(() => ingest(h, gc('2026-11-27', 1, { GB: 2 })), /exceed/); assert.throws(() => ingest(h, gc('2026-02-30', 2)), /Invalid/);
    assert.throws(() => validateHistory({ version: 1, sources: { x: { provider: 'cloudflare' } } }));
});
test('archive suppresses small geographic markers, keeps total-only counters and stores no account identifiers', () => {
    const h = emptyHistory(); ingest(h, { provider: 'abacus', account: 'private-name/private-key', kind: 'cumulative', date: '2026-11-24', visits: 500 }); ingest(h, gc('2026-11-24', 4, { GB: 3, US: 1 }));
    const a = summarize(h); assert.equal(a.visits, 504); assert.equal(a.countries, 2); assert.deepEqual(a.topCountries, [{ countryCode: 'GB', visits: 3 }]); assert.equal(a.points.length, 1); assert(!JSON.stringify(h).includes('private-name')); assert.equal(summarize(emptyHistory()), null);
});
test('Abacus reads without incrementing; Cloudflare requests complete country aggregates', async () => {
    const seen = []; const fetcher = async (url, opts) => { seen.push([url, opts.headers]); return { ok: true, json: async () => url.includes('abacus') ? { value: 77 } : { visits: 100, countries: { GB: 50, US: 2 } } }; };
    const a = await collectCumulative({ provider: 'abacus' }, cfg, fetcher); assert.equal(a.visits, 77); assert(seen[0][0].includes('/get/')); assert(!seen[0][0].includes('/hit/'));
    const b = await collectCumulative({ provider: 'cloudflare', account: 'https://example.workers.dev' }, cfg, fetcher); assert.equal(b.countries.US, 2); assert.equal(seen[1][0], 'https://example.workers.dev/archive'); assert.equal(seen[1][1].Origin, 'https://example.com');
    const reversed = structuredClone(cfg); reversed.visitorCounter.hosts.reverse();
    await collectCumulative({ provider: 'cloudflare', account: 'https://example.workers.dev' }, reversed, fetcher);
    assert.equal(seen[2][1].Origin, 'https://example.org');
});
test('switching services continues reading previously archived configured sources, failed fetch retains data', async () => {
    const h = emptyHistory(), c = structuredClone(cfg); c.visitorMap.endpoint = 'https://example.workers.dev'; c.visitorMap.provider = 'cloudflare'; const now = new Date('2026-11-25T04:00:00Z');
    const fetcher = async (url) => ({ ok: true, json: async () => url.includes('abacus') ? { value: 13 } : { visits: 100, countries: { GB: 60 } } });
    await runArchive({ history: h, cfg: c, now, env: {}, fetcher }); assert.equal(summarize(h).visits, 100);
    c.visitorMap.enabled = false; await runArchive({ history: h, cfg: c, now: new Date('2026-11-26T04:00:00Z'), env: {}, fetcher }); assert.equal(summarize(h).visits, 113);
    const warnings = await runArchive({ history: h, cfg: c, now: new Date('2026-11-27T04:00:00Z'), env: {}, fetcher: async () => ({ ok: false, status: 503 }) }); assert.equal(warnings.length, 2); assert.equal(summarize(h).visits, 113);
});
test('GoatCounter backfills missing closed UTC days, retries only the last two and paginates', async () => {
    const h = emptyHistory(), c = structuredClone(cfg); c.visitorMap.provider = 'goatcounter'; c.goatCounter.site = 'lab'; const now = new Date('2026-11-25T04:00:00Z'); const calls = [];
    for (const d of goatDays({}, now).slice(0, -2)) ingest(h, gc(d, 0));
    const fetcher = async (url) => { const u = new URL(url); calls.push(u); return { ok: true, json: async () => u.pathname.endsWith('/total') ? { total_utc: 7 } : u.searchParams.get('offset') === '0' ? { stats: [{ id: 'GB', count: 4 }], more: true } : { stats: [{ id: 'US', count: 2 }], more: false } }; };
    assert.deepEqual(await runArchive({ history: h, cfg: c, env: { GOATCOUNTER_API_KEY: 'secret' }, now, fetcher, wait: async () => { } }), []);
    assert.equal(calls.length, 6); assert.equal(calls[0].searchParams.get('start'), '2026-11-23T00:00:00.000Z'); assert.equal(calls[0].searchParams.get('end'), '2026-11-23T23:00:00.000Z'); assert.equal(calls[3].searchParams.get('start'), '2026-11-24T00:00:00.000Z'); assert.equal(summarize(h).visits, 14); assert(!JSON.stringify(h).includes('secret'));
    assert.equal(goatDays(h.sources[sourceId('goatcounter', 'lab')].records, now).length, 2);
    await runArchive({ history: h, cfg: c, env: { GOATCOUNTER_API_KEY: 'secret' }, now, fetcher, wait: async () => { } }); assert.equal(summarize(h).visits, 14);
});
test('VisitorDots manual imports work without a tracking request; repeated older imports do not regress', async () => {
    const h = emptyHistory(), c = structuredClone(cfg); c.visitorMap.provider = 'visitordots'; c.visitorDots = { enabled: true, mapUrl: 'https://visitordots.com/map/a', counterUrl: 'https://visitordots.com/card/a', detailsUrl: 'https://visitordots.com/data/a' };
    const e = { provider: 'visitordots', account: c.visitorDots.detailsUrl, kind: 'cumulative', date: '2026-11-24', visits: 20, countries: { GB: 4 } };
    const opt = { history: h, cfg: c, env: {}, now: new Date('2026-11-25T04:00:00Z'), fetcher: async () => { throw Error('unexpected network') } };
    assert.match((await runArchive({ ...opt, imports: [e] }))[0], /no documented free export/); await runArchive({ ...opt, imports: [{ ...e, visits: 30, countries: { GB: 7 } }] }); await runArchive({ ...opt, imports: [e] }); assert.equal(summarize(h).visits, 30);
});