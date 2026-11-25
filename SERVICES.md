# External services and privacy

All flags are in `content/site/services.json`. The site works without a backend and without enabling any third-party scripts. Optional external services connect only after the visitor grants the corresponding consent. The banner is bilingual and uses the original visual palette; visitors can reject all, accept all, or choose individual services, and change the decision through the footer. Essential language settings are saved locally.

| Service | Default | If disabled or unavailable |
|---|---|---|
| YouTube | enabled, consent required | local poster and direct external video link; no iframe or thumbnail request before consent |
| Bilibili | enabled, separate consent required | local poster and direct external video link; no iframe before consent |
| Abacus visit counter | fallback when no Worker is configured, consent required | count section disappears; no request |
| Visitor map | disabled until a real endpoint is configured | map section hidden by default, or retain a static outline with `showWhenDisabled: true`; no invented visitor counts |
| Analytics (Umami-compatible script) | disabled | no script loaded; no layout change |
| Latin fonts | build-time local download | same font families served locally; no optional browser provider |
| News | local static content | works offline; original source links are normal outbound links |

Ordinary outbound links (DOI, LinkedIn, YouTube, university, Google Scholar) are user-initiated navigations, not embedded services. Disabling YouTube stops the embedded player and thumbnail requests but does not remove source links; clicking one voluntarily navigates to YouTube. Self-hosted video and subtitles need no optional consent.

## Video providers

Configure `youtube.enabled` and `bilibili.enabled` independently. The shared player accepts a `sources` array containing YouTube IDs, Bilibili BV IDs (optional `page`) and same-site video paths. See the [README video guide](README.md#4-add-videos-and-alternate-hosts). The research findings, keynote, extra videos, and optional home-film alternatives use this schema. Local posters and captions do not require third-party consent; YouTube thumbnails are only loaded with YouTube consent. Bilibili uses the documented HTTPS player and local cover. Chapter timestamps are passed through via the provider's start parameter. Outbound links are user-initiated; no iframe is mounted without provider-specific consent. Revoking consent unmounts the iframe and stops remote thumbnail requests. A disabled provider remains available as an outbound link, not as an embed. External hosts manage their own audio and subtitles. Provider regional availability and embedding restrictions can vary.

Provider references: [Bilibili external player documentation](https://player.bilibili.com/), [Google privacy policy](https://policies.google.com/privacy), [Bilibili privacy policy](https://www.bilibili.com/blackboard/privacy-pc.html).

## Free visitor count (Abacus)

The site has an enabled, no-account counter using [Abacus](https://v2.jasoncameron.dev/abacus/). No backend, API key or separate service registration is required. Set `visitorCounter.enabled` to false to disable it. The `hosts` array limits tracking to the production domains; local previews and other hosts never increment the production count. Change `namespace` and `key` only if starting a separate count.

The first consented request uses the documented `/hit/{namespace}/{key}` endpoint, which creates the counter when necessary. Subsequent reloads in the same browser tab session use `/get/{namespace}/{key}`. The browser uses a simple sessionStorage marker, not a unique personal identifier, to avoid most duplicate increments. A new tab, expired storage or blocked storage can affect accuracy. Counts represent opted-in browser sessions approximately, not unique visitors, pageviews or locations. No coordinates are collected, no location is inferred or fabricated, and no personal data are intentionally sent in the counter key or request body. Abacus still receives ordinary network metadata, including the IP address, and may maintain its own logs. Requests omit credentials and referrer. No count request is sent before consent; withdrawal stops new requests and removes the section. A request already received by the provider cannot be undone. On failure, the section stays hidden, rather than displaying fake numbers.

The provider documents a rate limit of 30 requests per 10 seconds per IP and expiry after six months without access. Public increments can be abused; the service provides no contractual uptime or accuracy guarantee. It is suitable for indicative public website traffic, not authoritative analytics. Review third-party data processing with your institution before retaining the enabled setting. If you need country-level statistics or the original world map, configure the separate map service below.

## Visitor map: Cloudflare-managed Workers + D1

GitHub Pages cannot execute a database backend. Cloudflare runs the Worker and persistent D1 database without a server to host or maintain. The free plans currently provide 100,000 Worker requests/day and D1 quotas of 5 million rows read/day and 100,000 rows written/day; limits and availability can change. [Workers limits](https://developers.cloudflare.com/workers/platform/limits/) · [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/). No API key is exposed in the browser. The website remains on GitHub Pages. Abacus is the fallback only until the Worker endpoint is configured; the two counters are never used together.

### One-time deployment (required)

1. In Cloudflare, create a D1 database named `seil-visitors` under Workers & Pages / D1. Copy its database UUID. Enable your `workers.dev` subdomain if prompted.
2. In GitHub repository Settings → Secrets and variables → Actions, create secrets `CLOUDFLARE_API_TOKEN` (account-scoped Workers Scripts Edit and D1 Edit permissions) and `CLOUDFLARE_ACCOUNT_ID`, and repository variable `CLOUDFLARE_D1_DATABASE_ID` with the database UUID. Never put tokens in JSON or source control.
3. Run the **Deploy Cloudflare visitor map** workflow manually in Actions. It applies the idempotent schema and deploys `seil-visitor-map`. Copy the HTTPS Worker URL printed in the job output.
4. Verify the deployed service, substituting the real URL: `curl -H 'Origin: https://difulab.com' https://YOUR-WORKER.workers.dev/summary`. A new database returns zero counts and empty arrays, not example numbers.
5. Set the GitHub Actions repository variable `VITE_VISITOR_MAP_ENDPOINT` to that URL (no `/summary` suffix). Alternatively put the public HTTPS URL in `content/site/services.json` under `visitorMap.endpoint`. Run the Pages workflow again. The map activates after consent on the configured production hosts. Update `ALLOWED_ORIGINS` in `wrangler.example.toml` and `visitorCounter.hosts` in the JSON if the site domain changes.

Manual deployment alternative:

```sh
cd integrations/visitor-map
npx --yes wrangler@4 login
npx --yes wrangler@4 d1 create seil-visitors
cp wrangler.example.toml wrangler.toml
# Replace REPLACE_WITH_D1_DATABASE_ID with the real UUID.
npx --yes wrangler@4 d1 execute seil-visitors --remote --file=schema.sql
npx --yes wrangler@4 deploy
```

This patch cannot provision an account-owned endpoint without Cloudflare credentials. It is deployment-ready, not a claim that a Worker is already running. No historical visits are invented or imported from Abacus. The map will start accumulating new real counts after activation.

### Counting and privacy

`POST /visit` takes `{ "visitorId": "UUID" }`; `GET /summary` returns `{ "visits": 0, "countries": 0, "topCountries": [], "points": [] }`. Countries use `{countryCode, visits}` and points use `{latitude, longitude, visits}`. Counts are consented fixed 30-minute browser sessions, not unique people or page views. A new session ID is generated per time bucket and deduplicated atomically in D1. Cloudflare provides approximate geolocation; coordinates are rounded to 5-degree grid cells. Cells with fewer than three recorded sessions are not displayed. The top country list shows up to eight countries. No raw IP, exact position, user agent or URL is stored in D1. Fingerprints expire after two days and aggregate totals persist. Consent withdrawal stops tracking and removes the browser session ID; it does not remove prior aggregate counts. Previously stored consent choices are reviewed again for new providers. Cloudflare processes network metadata, and the institution should review the processing, privacy notice and retention policy.

The Worker rejects unapproved origins, obvious bots and malformed/oversized requests, and has rate limiting. These measures reduce abuse but do not prove visits came from humans. The public endpoint is not an authenticated analytics dashboard. Summaries are edge-cached for two minutes and refreshed by the browser every five minutes when visible; a temporary network failure never invents counts. A static map outline may be enabled with `showWhenDisabled`.

## Optional analytics

Use an Umami Cloud or self-hosted Umami site ID and script URL. Fill `analytics.scriptUrl`, `analytics.websiteId`, set `analytics.enabled` to true. No secret or API token belongs in the site config. The script is loaded only when consent is granted; revoking analytics reloads the page to remove already-installed provider listeners. Analytics and map consent are separate. Verify the provider settings and privacy policy, and update the banner text if using a different analytics vendor. The banner is a technical consent mechanism, not a guarantee of legal compliance. Review provider processing, disclosure, retention and contact details before enabling optional services.

## Fonts

`python3 scripts/prepare-fonts.py` downloads the EB Garamond and Source Sans 3 webfont stylesheet and associated WOFF2 files at build time, as they were not included in the supplied assets. Files and licenses are generated in `client/public/media/fonts/`; the original Chinese subset and license are included from the uploaded archive. The CSS points to local relative URLs. Initial builds require connectivity to Google Fonts and its upstream licenses. The generated files are cached in the local working tree for later builds and ignored by Git.
