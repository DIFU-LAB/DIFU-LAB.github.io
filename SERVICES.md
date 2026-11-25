# External services and privacy

All flags are in `content/site/services.json`. The site works without a backend and without enabling any third-party scripts. Optional external services connect only after the visitor grants the corresponding consent. The banner is bilingual and uses the original visual palette; visitors can reject all, accept all, or choose individual services, and change the decision through the footer. Essential language settings are saved locally.

| Service | Default | If disabled or unavailable |
|---|---|---|
| YouTube | enabled, consent required | local poster and direct external video link; no iframe or thumbnail request before consent |
| Bilibili | enabled, separate consent required | local poster and direct external video link; no iframe before consent |
| Abacus visit counter | enabled on production hosts, consent required | count section disappears; no request |
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

## Visitor map

The original app used a database and IP lookup. GitHub Pages cannot execute that code. The original SVG world-map component, layout, stats and marker animations are retained, with a small JSON adapter instead of tRPC. Configure an independent HTTPS service returning the contract below, or deploy the included Cloudflare Workers + D1 example. The worker is not deployed automatically, and historical visitor data was not exported. It starts with an empty database. Never place secrets in `content/site/services.json`.

### Deploy the example

Use a Cloudflare account and Wrangler CLI (`npx wrangler`), then:

```sh
cd integrations/visitor-map
npx wrangler d1 create seil-visitors
cp wrangler.example.toml wrangler.toml
# Insert the returned database ID and allowed site origin(s) into wrangler.toml.
npx wrangler d1 execute seil-visitors --remote --file=schema.sql
npx wrangler deploy
```

Set `ALLOWED_ORIGINS` to comma-separated exact origins (e.g. `https://difulab.com,https://yourname.github.io`), with no path/trailing slash. Set `visitorMap.endpoint` to the resulting HTTPS Worker URL (without `/visit` or `/summary`) and `visitorMap.enabled` to true. The visitor map appears after consent unless `showWhenDisabled` is true. It fetches `/summary` on load and every minute. For public use, consider Cloudflare rate limiting and bot protection. CORS is not a strong anti-abuse/authentication boundary; the public write endpoint can be abused if unprotected. Review retention and privacy obligations with your institution before enabling.

The example uses a random local visitor identifier only after consent, hashes it at the worker, and records a coarse approximate location from Cloudflare request metadata (rounded to whole degrees), plus a half-hour bucket. Raw IP, URL, user-agent and email are not written to D1. Cloudflare receives request IP and may have its own logging policies. Public point data require at least two distinct browser identifiers in a location; counts represent opted-in browser identifiers, not verified unique people. Revoking consent removes the local identifier and stops requests; it does not retroactively erase aggregate records. Configure deletion/retention policy and privacy contact before production use. The older server counted hashed IPs, so new stats are not directly comparable.

Adapter contract: `POST /visit` accepts `{ "visitorId": "UUID" }`; `GET /summary` returns:

```json
{
  "visitors": 0,
  "visits": 0,
  "countries": 0,
  "topCountries": [],
  "points": []
}
```

`topCountries` rows are `{countryCode, visitors}`; `points` rows are `{latitude, longitude, visitors}`. Replace the endpoint with another service implementing this contract if preferred. Network errors do not affect other content. A static map without live data can be enabled using `showWhenDisabled`.

## Optional analytics

Use an Umami Cloud or self-hosted Umami site ID and script URL. Fill `analytics.scriptUrl`, `analytics.websiteId`, set `analytics.enabled` to true. No secret or API token belongs in the site config. The script is loaded only when consent is granted; revoking analytics reloads the page to remove already-installed provider listeners. Analytics and map consent are separate. Verify the provider settings and privacy policy, and update the banner text if using a different analytics vendor. The banner is a technical consent mechanism, not a guarantee of legal compliance. Review provider processing, disclosure, retention and contact details before enabling optional services.

## Fonts

`python3 scripts/prepare-fonts.py` downloads the EB Garamond and Source Sans 3 webfont stylesheet and associated WOFF2 files at build time, as they were not included in the supplied assets. Files and licenses are generated in `client/public/media/fonts/`; the original Chinese subset and license are included from the uploaded archive. The CSS points to local relative URLs. Initial builds require connectivity to Google Fonts and its upstream licenses. The generated files are cached in the local working tree for later builds and ignored by Git.
