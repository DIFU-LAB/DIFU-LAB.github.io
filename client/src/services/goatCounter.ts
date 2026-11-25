import { goatCounterSite } from './visitorMapProvider';

let recorded = false;
/** The documented browser pixel, no third-party JS or private API key.
 * Count one consented document load; GoatCounter handles visitor deduplication.
 * Fixed path deliberately avoids sending individual page URLs, queries or referrers.
 */
export function recordGoatCounterVisit(site: string) {
  if (recorded || !goatCounterSite(site) || navigator.webdriver) return;
  recorded = true;
  void fetch(`https://${site}.goatcounter.com/count?p=%2F&rnd=${encodeURIComponent(crypto.randomUUID())}`, {
    mode: 'no-cors', credentials: 'omit', referrerPolicy: 'no-referrer', cache: 'no-store', keepalive: true,
  }).catch(() => { /* No retry: an opaque response cannot establish whether the hit was recorded. */ });
}
