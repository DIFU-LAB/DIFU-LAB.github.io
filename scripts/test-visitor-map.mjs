import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import worker from '../integrations/visitor-map/worker.mjs';
const origin = 'https://difulab.org';
function setup() {
    const db = new DatabaseSync(':memory:'); db.exec(readFileSync(new URL('../integrations/visitor-map/schema.sql', import.meta.url), 'utf8'));
    const env = { ALLOWED_ORIGINS: origin, DB: { prepare(sql) { const st = db.prepare(sql); return { bind(...args) { return { async run() { return { meta: st.run(...args) } } } }, all() { return { results: st.all() } } } }, async batch(stmts) { return stmts.map(s => s.all()) } }, VISIT_LIMITER: { async limit() { return { success: true } } } };
    const jobs = []; const ctx = { waitUntil(p) { jobs.push(p) } };
    const req = (path, body, opts = {}) => { const r = new Request('https://worker.example' + path, { method: body === undefined ? 'GET' : 'POST', headers: { Origin: origin, 'User-Agent': 'Mozilla/5.0', 'Content-Type': 'application/json', ...opts.headers }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) }); Object.defineProperty(r, 'cf', { value: opts.cf ?? { country: 'GB', latitude: '51.24', longitude: '-0.59' } }); return r };
    return { env, ctx, jobs, req, db, call: (path, body, opts) => worker.fetch(req(path, body, opts), env, ctx) };
}
test('deduplicates, aggregates, suppresses small map cells and retains counts', async () => {
    const { call, db, env, ctx, jobs } = setup(); const id = crypto.randomUUID();
    assert.deepEqual(await (await call('/visit', { visitorId: id })).json(), { recorded: true });
    assert.deepEqual(await (await call('/visit', { visitorId: id })).json(), { recorded: false });
    assert.deepEqual((await (await call('/summary')).json()).points, []);
    for (let i = 0; i < 2; i++)await call('/visit', { visitorId: crypto.randomUUID() });
    await call('/visit', { visitorId: crypto.randomUUID() }, { cf: { country: 'US' } });
    const summary = await (await call('/summary')).json(); assert.equal(summary.visits, 4); assert.equal(summary.countries, 2); assert.deepEqual(summary.points, [{ latitude: 50, longitude: 0, visits: 3 }]); assert.equal(summary.topCountries[0].visits, 3); assert.deepEqual(await (await call('/archive')).json(), { visits: 4, countries: { GB: 3, US: 1 } });
    db.exec('UPDATE visit_dedupe SET bucket=0'); await worker.scheduled(null, env, ctx); await Promise.all(jobs); assert.equal(db.prepare('SELECT COUNT(*) AS n FROM visit_dedupe').get().n, 0); assert.equal((await (await call('/summary')).json()).visits, 4);
});
test('rejects unauthorized origins, invalid and oversized requests, bots and rate-limited writes', async () => {
    const { call, env } = setup(); assert.equal((await call('/summary', undefined, { headers: { Origin: 'https://other.example' } })).status, 403); assert.equal((await call('/visit', { visitorId: 'bad' })).status, 400); assert.equal((await call('/visit', { visitorId: 'x'.repeat(300) })).status, 400); assert.deepEqual(await (await call('/visit', { visitorId: crypto.randomUUID() }, { headers: { 'User-Agent': 'Googlebot' } })).json(), { recorded: false }); env.VISIT_LIMITER.limit = async () => ({ success: false }); assert.equal((await call('/visit', { visitorId: crypto.randomUUID() })).status, 429); assert.equal((await (await call('/summary')).json()).visits, 0);
});

import { visitorDotsUrl, selectVisitorMapProvider, goatCounterSite } from '../client/src/services/visitorMapProvider.ts';
test('hosted map only accepts provider-issued public HTTPS URLs', () => {
    assert.equal(visitorDotsUrl('https://www.visitordots.com/map/test'), 'https://www.visitordots.com/map/test');
    for (const value of ['', null, 'http://visitordots.com/map', 'https://visitordots.com.evil.test/map', 'https://evilvisitordots.com/map', 'https://user:pass@visitordots.com/map', 'javascript:alert(1)', 'https://visitordots.com:444/map', 'https://visitordots.com/map#test']) assert.equal(visitorDotsUrl(value), '');
});
test('visitor map provider selection never activates both trackers', () => {
    for (const cf of [false, true]) for (const vd of [false, true]) {
        assert.equal(selectVisitorMapProvider('auto', cf, vd), cf ? 'cloudflare' : vd ? 'visitordots' : null);
        assert.equal(selectVisitorMapProvider('cloudflare', cf, vd), cf ? 'cloudflare' : null);
        assert.equal(selectVisitorMapProvider('visitordots', cf, vd), vd ? 'visitordots' : null);
    }
    assert.equal(selectVisitorMapProvider('invalid', true, true), null);
});

import { collectGoatCounter, normalizeGoatCounter } from './snapshot-goatcounter.mjs';
test('GoatCounter selection is exclusive and account validation rejects URLs and tokens', () => {
    for (const cf of [false, true]) for (const vd of [false, true]) for (const gc of [false, true]) {
        assert.equal(selectVisitorMapProvider('auto', cf, vd, gc), cf ? 'cloudflare' : gc ? 'goatcounter' : vd ? 'visitordots' : null);
        assert.equal(selectVisitorMapProvider('goatcounter', cf, vd, gc), gc ? 'goatcounter' : null);
    }
    assert.equal(goatCounterSite('lab-1'), 'lab-1');
    for (const site of ['', 'https://lab.goatcounter.com', 'lab.evil', '-lab', 'lab-', 'a/b', 'abc:secret', null]) assert.equal(goatCounterSite(site), '');
});
test('GoatCounter API reads paginated country counts and UTC totals, emits only aggregates', async () => {
    const calls = []; const now = new Date('2026-11-25T19:23:00Z');
    const out = await collectGoatCounter('lab', 'private-key', {
        now, wait: async () => { }, fetcher: async (url, options) => {
            const parsed = new URL(url); calls.push(parsed); assert.equal(options.headers.Authorization, 'Bearer private-key'); assert.equal(options.redirect, 'error');
            assert.equal(parsed.searchParams.get('start'), '2026-10-26T19:00:00.000Z'); assert.equal(parsed.searchParams.get('end'), '2026-11-25T19:00:00.000Z');
            return { ok: true, json: async () => parsed.pathname.endsWith('/total') ? { total: 14, total_utc: 10 } : parsed.searchParams.get('offset') === '0' ? { stats: [{ id: 'GB', name: 'UK', count: 6 }], more: true } : { stats: [{ id: 'US', count: 2 }, { id: 'XX', count: 2 }], more: false } };
        }
    });
    assert.equal(calls.length, 3); assert.equal(out.visits, 10); assert.equal(out.countries, 2); assert.deepEqual(out.topCountries, [{ countryCode: 'GB', visits: 6 }, { countryCode: 'US', visits: 2 }]); assert.deepEqual(out.points, [{ latitude: 54, longitude: -2, visits: 6 }]); assert.equal(out.updatedAt, '2026-11-25T19:00:00.000Z'); assert(!JSON.stringify(out).includes('private-key'));
    assert.throws(() => normalizeGoatCounter({ total_utc: 1 }, [{ id: 'US', count: 2 }], 'now'));
    assert.throws(() => normalizeGoatCounter({ total_utc: 5 }, [{ id: 'US', count: 2 }, { id: 'US', count: 2 }], 'now'));
    await assert.rejects(collectGoatCounter('lab', 'key', { fetcher: async () => ({ ok: false, status: 401 }) }), /401/);
});
