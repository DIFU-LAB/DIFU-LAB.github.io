// Cloudflare-managed Worker + D1. This is independent of GitHub Pages.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const bots = /bot|crawl|spider|slurp|headless|lighthouse|preview|curl|wget|monitor|uptime/i;
const BUCKET_MS = 30 * 60 * 1000;
const UNKNOWN = 999;
const grid = (value, max) => value == null || value === '' || !Number.isFinite(Number(value)) || Math.abs(Number(value)) > max ? UNKNOWN : Math.round(Number(value) / 5) * 5;
const digest = async value => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))), b => b.toString(16).padStart(2, '0')).join('');

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') || '';
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim());
    if (!origin || !allowed.includes(origin)) return new Response('Forbidden', { status: 403 });
    const headers = { 'Access-Control-Allow-Origin': origin, 'Vary': 'Origin', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '600', 'Cache-Control': 'no-store' };
    const json = (value, status = 200, cacheControl = 'no-store') => Response.json(value, { status, headers: { ...headers, 'Cache-Control': cacheControl } });
    const path = new URL(request.url).pathname.replace(/\/$/, '');
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    try {
      if (path === '/visit' && request.method === 'POST') {
        const ua = request.headers.get('user-agent');
        if (!ua || bots.test(ua)) return json({ recorded: false });
        if (env.VISIT_LIMITER) {
          // Cloudflare rate-limit key is transient and is never written to D1.
          const { success } = await env.VISIT_LIMITER.limit({ key: request.headers.get('CF-Connecting-IP') || 'unknown' });
          if (!success) return json({ error: 'Rate limited' }, 429);
        }
        if (!request.headers.get('content-type')?.startsWith('application/json') || Number(request.headers.get('content-length') || 0) > 256) return json({ error: 'Invalid request' }, 400);
        // Read at most 256 bytes, including requests without Content-Length.
        const reader = request.body?.getReader();
        if (!reader) return json({ error: 'Invalid request' }, 400);
        const chunks = []; let length = 0;
        while (true) {
          const { done, value } = await reader.read(); if (done) break;
          length += value.length; if (length > 256) { await reader.cancel(); return json({ error: 'Invalid request' }, 400); }
          chunks.push(value);
        }
        const bytes = new Uint8Array(length); let offset = 0;
        for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
        let payload; try { payload = JSON.parse(new TextDecoder().decode(bytes)); } catch { return json({ error: 'Invalid JSON' }, 400); }
        if (!payload || typeof payload.visitorId !== 'string' || !UUID.test(payload.visitorId)) return json({ error: 'Invalid identifier' }, 400);
        const bucket = Math.floor(Date.now() / BUCKET_MS);
        const fingerprint = await digest(`${bucket}:${payload.visitorId.toLowerCase()}`);
        const cf = request.cf || {};
        const country = /^[A-Z]{2}$/.test(cf.country || '') && !['XX', 'T1'].includes(cf.country) ? cf.country : '';
        const lat = grid(cf.latitude, 90), lon = grid(cf.longitude, 180);
        const located = country && lat !== UNKNOWN && lon !== UNKNOWN;
        const result = await env.DB.prepare('INSERT OR IGNORE INTO visit_dedupe(fingerprint,bucket,country,latitude,longitude) VALUES(?,?,?,?,?)').bind(fingerprint, bucket, country, located ? lat : UNKNOWN, located ? lon : UNKNOWN).run();
        return json({ recorded: !!result.meta?.changes });
      }
      if (path === '/archive' && request.method === 'GET') {
        // Full country-level aggregates only; no raw IP, fingerprint or cell details.
        const [total, countries] = await env.DB.batch([
          env.DB.prepare('SELECT COALESCE(SUM(visits),0) AS visits FROM visit_regions'),
          env.DB.prepare("SELECT country AS countryCode, SUM(visits) AS visits FROM visit_regions WHERE country <> '' GROUP BY country ORDER BY country")
        ]);
        return json({visits:total.results[0].visits,countries:Object.fromEntries(countries.results.map(row=>[row.countryCode,row.visits]))});
      }
      if (path === '/summary' && request.method === 'GET') {
        // Fixed cache key per allowed origin; arbitrary query strings cannot bust it.
        const cacheUrl = new URL(request.url); cacheUrl.search = ''; cacheUrl.searchParams.set('origin', origin); cacheUrl.searchParams.set('version', '2');
        const cacheKey = new Request(cacheUrl.toString());
        const cache = globalThis.caches?.default;
        const cached = await cache?.match(cacheKey);
        if (cached) return cached;
        const [total, countries, points] = await env.DB.batch([
          env.DB.prepare("SELECT COALESCE(SUM(visits),0) AS visits, COUNT(DISTINCT NULLIF(country,'')) AS countries FROM visit_regions"),
          env.DB.prepare("SELECT country AS countryCode, SUM(visits) AS visits FROM visit_regions WHERE country <> '' GROUP BY country ORDER BY visits DESC, country LIMIT 8"),
          env.DB.prepare('SELECT latitude, longitude, SUM(visits) AS visits FROM visit_regions WHERE latitude <> 999 AND longitude <> 999 GROUP BY latitude,longitude HAVING SUM(visits)>=3 ORDER BY visits DESC, latitude, longitude LIMIT 300')
        ]);
        const response = json({ ...total.results[0], topCountries: countries.results, points: points.results }, 200, 'public, max-age=120');
        if (cache) ctx.waitUntil(cache.put(cacheKey, response.clone()).catch(() => {}));
        return response;
      }
      return json({ error: 'Not found' }, 404);
    } catch { return json({ error: 'Service unavailable' }, 503); }
  },
  async scheduled(_event, env, ctx) {
    // Dedupe fingerprints expire after two days; aggregate counts remain.
    ctx.waitUntil(env.DB.prepare('DELETE FROM visit_dedupe WHERE bucket < ?').bind(Math.floor(Date.now() / BUCKET_MS) - 96).run());
  }
};
