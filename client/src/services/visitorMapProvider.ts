/** Only public, provider-issued HTTPS URLs are accepted; never embed API secrets. */
export function visitorDotsUrl(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) return '';
  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'https:' || url.username || url.password || url.port || url.hash ||
        !(url.hostname === 'visitordots.com' || url.hostname.endsWith('.visitordots.com'))) return '';
    return url.href;
  } catch { return ''; }
}

export function selectVisitorMapProvider(preference: string, cloudflare: boolean, hosted: boolean, goatcounter = false) {
  if (preference === 'cloudflare') return cloudflare ? 'cloudflare' : null;
  if (preference === 'visitordots') return hosted ? 'visitordots' : null;
  if (preference === 'goatcounter') return goatcounter ? 'goatcounter' : null;
  if (preference === 'auto') return cloudflare ? 'cloudflare' : goatcounter ? 'goatcounter' : hosted ? 'visitordots' : null;
  return null;
}

/** A public GoatCounter account code, not an API token or arbitrary URL. */
export function goatCounterSite(value: unknown): string {
  return typeof value === 'string' && /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(value.trim()) ? value.trim() : '';
}
