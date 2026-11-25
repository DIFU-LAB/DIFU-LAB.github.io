# External services and privacy

All flags are in `content/site/services.json`. The site works without a backend and without enabling any third-party scripts. Optional external services connect only after the visitor grants the corresponding consent. The banner is bilingual and uses the original visual palette; visitors can reject all, accept all, or choose individual services, and change the decision through the footer. Essential language settings are saved locally.

| Service | Default | If disabled or unavailable |
|---|---|---|
| YouTube | enabled, consent required | local poster and direct external video link; no iframe or thumbnail request before consent |
| Bilibili | enabled, separate consent required | local poster and direct external video link; no iframe before consent |
| Abacus visit counter | fallback when no map provider is configured, consent required | count section disappears; no request |
| Visitor map | disabled until a real endpoint is configured | Cloudflare, GoatCounter or VisitorDots selected by configuration; map section hidden by default, or retain a static outline with `showWhenDisabled: true`; no invented visitor counts |
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

GitHub Pages cannot execute a database backend. Cloudflare runs the Worker and persistent D1 database without a server to host or maintain. The free plans currently provide 100,000 Worker requests/day and D1 quotas of 5 million rows read/day and 100,000 rows written/day; limits and availability can change. [Workers limits](https://developers.cloudflare.com/workers/platform/limits/) · [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/). No API key is exposed in the browser. The website remains on GitHub Pages. Abacus is the fallback only when no map provider is selected and configured; the counters are never used together.

### One-time deployment (required)

1. In Cloudflare, create a D1 database named `seil-visitors` under Workers & Pages / D1. Copy its database UUID. Enable your `workers.dev` subdomain if prompted.
2. In GitHub repository Settings → Secrets and variables → Actions, create secrets `CLOUDFLARE_API_TOKEN` (account-scoped Workers Scripts Edit and D1 Edit permissions) and `CLOUDFLARE_ACCOUNT_ID`, and repository variable `CLOUDFLARE_D1_DATABASE_ID` with the database UUID. Never put tokens in JSON or source control.
3. Run the **Deploy Cloudflare visitor map** workflow manually in Actions. It applies the idempotent schema and deploys `seil-visitor-map`. Copy the HTTPS Worker URL printed in the job output.
4. Verify the deployed service, substituting the real URL: `curl -H 'Origin: https://difulab.org' https://YOUR-WORKER.workers.dev/summary`. A new database returns zero counts and empty arrays, not example numbers.
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

## Simpler hosted visitor map: VisitorDots

[VisitorDots](https://www.visitordots.com/) (formerly Maploco Web Visitors) provides a hosted map and a display-only visitor card. The [free plan](https://www.visitordots.com/faq) includes one website and 25,000 accepted widget views/month. No Worker, database, GitHub secret, third-party script or private API key is needed. This is a documented image embed interface, not a JSON API; geographic data and map rendering stay with the provider. It is an alternative, not a second simultaneous tracker.

1. Create a free account at [VisitorDots](https://www.visitordots.com/) and add `difulab.org`. Add all production hostnames you intend to use under Allowed hosts (see `visitorCounter.hosts`). Choose a map design.
2. Copy the image `src` from the **map** embed into `visitorDots.mapUrl` in `content/site/services.json`. Copy the map's public statistics link (`href`) into `visitorDots.detailsUrl`.
3. In **Edit site & widgets → Visitor card**, copy the visitor card image `src` into `visitorDots.counterUrl`. Do not use a flag-grid image here: a flag grid records another view, while the visitor card does not. Use URLs issued for your own website, not examples or preview URLs. All three must be HTTPS on `visitordots.com` or a subdomain.
4. Keep `visitorMap.enabled` and `visitorDots.enabled` true. Set `visitorMap.provider` to `visitordots` to use it even when a Cloudflare Worker URL exists. `auto` (default) prefers a configured Cloudflare Worker, then configured GoatCounter, then configured VisitorDots, then Abacus; `cloudflare` selects only the Worker, with Abacus as the count-only fallback if unconfigured. This is configuration-time selection, not live failover. The inactive provider never records new visits from this site. Archived provider aggregates are combined separately as described below. Set `visitorMap.enabled` false to disable all map providers.
5. Publish with the existing Pages workflow. On the live home page, opt in to VisitorDots via privacy preferences and check that the map and visitor card appear. Allow a few minutes for an accepted view to reach the provider's public statistics page. Use DevTools to confirm no requests before consent or after withdrawal, and no Cloudflare or Abacus tracking while VisitorDots is selected.

VisitorDots counts accepted **home-page map image loads**, not site-wide 30-minute browser sessions or unique people. Reloads, caches, blockers and the provider's acceptance rules affect the result. The map and counter are embedded images; detailed country/region counts are linked on the provider's public page. The widget images are not cached by our service worker. The request sends only the site's origin as referrer because VisitorDots requires an allowed hostname. It processes network metadata and approximate city/region/country location. It may publicly display approximate locations and counts; unlike our Cloudflare implementation we cannot enforce the three-session threshold. Review the [provider privacy policy](https://www.funkyllama.net/privacy.php?site=visitordot) and institutional requirements before activation. Consent is distinct from Cloudflare consent, and withdrawal removes both images but cannot undo previous counts. Provider image text is controlled by the provider, not site translations; all surrounding UI is localized.

The integration ships with blank URLs, so no external requests go to VisitorDots until a real site is registered, configured and consented. A failed map or counter displays an unavailable message, without switching silently or inventing statistics.

## Optional analytics

Use an Umami Cloud or self-hosted Umami site ID and script URL. Fill `analytics.scriptUrl`, `analytics.websiteId`, set `analytics.enabled` to true. No secret or API token belongs in the site config. The script is loaded only when consent is granted; revoking analytics reloads the page to remove already-installed provider listeners. Analytics and map consent are separate. Verify the provider settings and privacy policy, and update the banner text if using a different analytics vendor. The banner is a technical consent mechanism, not a guarantee of legal compliance. Review provider processing, disclosure, retention and contact details before enabling optional services.

## Fonts

`python3 scripts/prepare-fonts.py` downloads the EB Garamond and Source Sans 3 webfont stylesheet and associated WOFF2 files at build time, as they were not included in the supplied assets. Files and licenses are generated in `client/public/media/fonts/`; the original Chinese subset and license are included from the uploaded archive. The CSS points to local relative URLs. Initial builds require connectivity to Google Fonts and its upstream licenses. The generated files are cached in the local working tree for later builds and ignored by Git.


## Managed geographic API: GoatCounter (existing SEIL map)

[GoatCounter](https://www.goatcounter.com/) is a free, donation-supported managed analytics service for reasonable public use. Its [JSON API](https://www.goatcounter.com/help/api) provides totals and geographic breakdowns. No Worker, database or self-hosted server is needed. The existing SEIL SVG map, rankings, colors and localization are retained. The browser records a single consented document load using the documented [count endpoint](https://www.goatcounter.com/help/pixel); GoatCounter handles visitor deduplication. No external tracking script is loaded. A fixed path (`/`) is used to avoid sharing individual page URLs, referrers or queries. The provider processes IP and user-agent data; see its privacy policy. Use a dedicated site/account for this counter, not an account collecting unrelated traffic or custom events.

### Setup

1. Sign up at https://www.goatcounter.com/signup and enter your lab's domain. Note the public account code from `YOUR-CODE.goatcounter.com`. Ensure geographic collection is enabled in GoatCounter settings.
2. In GoatCounter, go to your username → API and create a token with read-only statistics permission. Do not publish that token or put it in any `VITE_` variable.
3. In GitHub repository Settings → Secrets and variables → Actions, add the repository **secret** `GOATCOUNTER_API_KEY` containing that token. Add the repository **variable** `VITE_GOATCOUNTER_SITE` containing only the public account code (not a URL). Alternatively, `goatCounter.site` in `content/site/services.json` can supply the public code, The daily workflow also reads the public code from this configuration file.
4. In `content/site/services.json`, keep `visitorMap.enabled` and `goatCounter.enabled` true and set `visitorMap.provider` to `goatcounter`. With `auto`, precedence is Cloudflare → GoatCounter → VisitorDots → Abacus; the explicit selection works even when Cloudflare and VisitorDots are configured.
5. Publish with the existing Pages workflow. It calls the official `/api/v0/stats/total` and `/api/v0/stats/locations` endpoints with the secret, paginates country data and publishes only aggregate counts and approximate country marker positions to `dist/visitor-stats.json`. The token and raw API response are not shipped to the browser. The snapshot refreshes with normal deployments and once daily (04:23 UTC, subject to GitHub scheduling). Before a historical archive exists, the last 30 days ending at the most recent complete UTC hour are shown, with an update timestamp; country markers are representative coordinates, not city-level or exact positions. Map points below three visitors are omitted. The country ranking includes up to eight countries, including low counts, just as the Cloudflare map does. The country coordinates come from CountryInfo (MIT, license bundled), with representative coordinates added for missing territories.
6. Visit the production homepage and grant GoatCounter consent in privacy preferences. The dashboard should start receiving opted-in visits; run the Pages workflow again to update the map. Existing consent for a different provider does not authorize GoatCounter. No traffic is sent from local previews. Withdrawal prevents new tracking but cannot undo past aggregate counts.

No fake counts are generated. A missing secret or API failure raises an Actions warning and preserves previously archived records. The optional 30-day fallback snapshot may be unavailable until the next successful request. The browser does not contact the statistics API, so public GitHub Pages users cannot see the key. The snapshot is intentionally public and not cached by the service worker. Stats are not live (up to a day old under normal scheduled operation); the Cloudflare provider remains the option for near-live updates and finer regional points. Different providers measure visits differently; historical totals are aggregated as recorded visits, not deduplicated people. The API contract and pagination were tested using fixtures; live account credentials and production verification are required to complete deployment.


## Permanent visitor history (all providers)

The Pages workflow runs an independent archive job at **04:23 UTC daily**, on default-branch pushes, and on manual runs. It creates or updates the `visitor-history` Git branch (not the source branch), using the built-in `GITHUB_TOKEN` with `contents: write` only for that job. No new hosting or credentials are required beyond the active provider's existing configuration. The archive contains `history.json` (dated, provider-specific aggregate records) and `visitor-history.json` (the compact all-time summary). The latter alone is copied into the static Pages build. History is ordinary Git data, not a time-limited Actions artifact or cache. All tracked history is retained even if the provider is changed, disabled, or stops responding. The archive job runs before the website build and commits independently of build success. A failed Git push blocks publishing a new snapshot; it never force-pushes.

### Collection and merging

| Provider | Archive rule |
|---|---|
| Cloudflare | Read the new `/archive` endpoint with complete lifetime country aggregates. Redeploy the existing Worker once with the updated code via **Deploy Cloudflare visitor map**. No schema migration is required. |
| GoatCounter | Read the totals and paginated country breakdown for each completed UTC day (00:00–23:00 inclusive). On first run, collect the last 30 completed days. Thereafter fill missing days in that window and recheck the last two for delayed data. Older records remain untouched. |
| Abacus | Read `/get/namespace/key`, never `/hit`. Lifetime total only, without geography. |
| VisitorDots | No documented free machine-readable export API. Copy the aggregate totals from your public data page, or use its Pro aggregate CSV export, and enter them as described below. No scraping or fake counts. |

Cumulative readings are **snapshots, not increments**: 100 followed by 105 is 105, not 205. Daily readings are keyed by account and date; reruns replace the same observation only if it does not reduce previously recorded counts. Accounts are isolated by a hash of provider identity and generation. The summary adds the latest cumulative total from each source and the non-overlapping daily records. It keeps country totals separate from the overall count, so total-only sources do not invent geography. Markers and displayed country ranks suppress counts below three. Historical markers use representative country coordinates (rather than Cloudflare's finer live cells), and the UI labels the combined count as historical opt-in visits, not unique people. The map is a first-party static aggregate and requires no tracking consent; all recording remains independently consent-controlled. The hosted VisitorDots widget still loads only with consent and remains separate from the archive map.

### Switching services and resets

* Keep providers exclusive for recording as before. First run the archive with the outgoing provider still configured, then switch `visitorMap.provider`. Leave old public account settings and credentials available if possible: previously archived, still-configured sources continue to be read in case of delayed activity. If replacing account URLs or IDs, run a final archive first. A different account creates a separate source; do not point two account identities at the same underlying counter or reuse counters that collected overlapping/unrelated traffic.
* A lower cumulative reading (or a lower previously archived daily reading) is rejected with a workflow warning. The archive retains the prior data. Verify whether the provider has actually reset rather than temporarily returning incomplete data. For a confirmed Cloudflare or Abacus reset on the **same** account, set the corresponding Actions variable `VISITOR_HISTORY_GENERATION_CLOUDFLARE` or `VISITOR_HISTORY_GENERATION_ABACUS` to a new value such as `2`, and run the workflow. Keep that value until the next real reset. The previous generation remains in history. Do not bump generations to resolve temporary errors; that would count an existing balance twice. GoatCounter uses dated observations and does not require generations for changes in retention.
* If the provider has already discarded data, cannot be reached, resets between two polls, or the workflow is inactive, no archive can reconstruct unobserved visits. GoatCounter can recover missed days within the 30-day automatic backfill window if still retained. Older retained data can be imported manually, using exact non-overlapping UTC days. Check Actions warnings and provider coverage periodically. GitHub can disable scheduled workflows in inactive public repositories (normally after 60 days); re-enable if necessary. Run manually before retiring a provider. Keep a periodic local mirror/backup of the `visitor-history` branch, and restrict deletion/force pushes where possible; the branch is not immune to repository deletion or deliberate history rewriting.

### Importing VisitorDots or older aggregate data

Edit `integrations/visitor-history/imports.json` on the source branch. It is an array of records. For a cumulative VisitorDots reading, use the same public statistics-page URL as `visitorDots.detailsUrl`, the actual date (UTC), and the exact lifetime total, not the current monthly allowance. Optional `countries` must be an object of ISO country codes and cumulative counts. Example (illustrative only; do not import fake numbers):

```json
[
  {
    "provider": "visitordots",
    "account": "https://www.visitordots.com/YOUR-STATISTICS-PAGE",
    "generation": "1",
    "date": "2026-11-25",
    "kind": "cumulative",
    "visits": 123,
    "countries": { "GB": 60, "US": 20 }
  }
]
```

The exact same format works for a known Cloudflare account URL (`provider: cloudflare`), Abacus `namespace/key` (`provider: abacus`), or GoatCounter account code (`provider: goatcounter`, `kind: daily`, `generation: 1`, one record per UTC day). Do not mix cumulative and daily records for the same source. For VisitorDots use a new generation only after a confirmed reset. An empty country object is allowed for a total-only source; the archive keeps previously known cumulative geography. Use complete available country totals rather than overlapping regions/cities. Old import records can be removed from the input once successfully archived; leaving them in place is also safe (replays are idempotent). Never include IPs, visitor IDs, tokens or individual records. A public repository makes **the archive branch and its dated country-level aggregate counts publicly readable**, even though only a compact summary is deployed to Pages; review this retention policy before enabling the archive, especially with low-volume traffic. If that is not acceptable, use a private archive repository with its own appropriately scoped credentials (not included in this implementation).

### Verification and recovery

Use Actions → **Build and deploy SEIL Lab** → Run workflow. Check `Preserve visitor aggregates in Git`, then switch to branch `visitor-history` and inspect `history.json`. The aggregate should appear at `/visitor-history.json` after a successful Pages deployment. A JSON `null` indicates that no counts have yet been captured. Run again and confirm cumulative totals have not doubled. If an archive job is interrupted before the Git push, retry; if the site build fails after the push, history is already safe. `node --experimental-strip-types --test scripts/test-visitor-history.mjs scripts/test-visitor-map.mjs` exercises the ledger, API adapter, reset and outage cases using synthetic test fixtures. Live provider data requires real account configuration; no service is contacted from those tests.
