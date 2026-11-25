import { useSyncExternalStore } from 'react';
import { services, useConsent } from './consent';

// No identity or location is sent in the request body or URL. Abacus still
// receives ordinary network metadata (including IP) as a third party.
const config = services.visitorCounter;
const sessionKey = `seil-counter:${config.namespace}:${config.key}`;
let current: number | undefined;
let countedInMemory = false;
const listeners = new Set<() => void>();
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
function getSnapshot() { return current; }
function publish(value: number | undefined) {
  current = value;
  listeners.forEach(listener => listener());
}
/** Called only by the consent-controlled root integration. */
export function loadVisitorCounter(signal: AbortSignal) {
  if (signal.aborted) return;
  let counted = countedInMemory;
  try { counted ||= sessionStorage.getItem(sessionKey) === '1'; } catch { /* storage may be blocked */ }
  const endpoint = `https://abacus.jasoncameron.dev/${counted ? 'get' : 'hit'}/${encodeURIComponent(config.namespace)}/${encodeURIComponent(config.key)}`;
  // Mark the attempt in memory before fetching: an aborted HTTP response
  // does not prove the server did not increment the counter.
  countedInMemory = true;
  return fetch(endpoint, {credentials:'omit', cache:'no-store', referrerPolicy:'no-referrer', signal})
    .then(async response => {
      if (!response.ok) throw new Error('Counter unavailable');
      const data = await response.json();
      if (!Number.isSafeInteger(data.value) || data.value < 0) throw new Error('Invalid count');
      if (signal.aborted) return;
      try { sessionStorage.setItem(sessionKey, '1'); } catch { /* in-memory fallback */ }
      publish(data.value);
    })
    .catch(() => { if (!signal.aborted) publish(undefined); });
}
export function useVisitorCounter() {
  const {allowed} = useConsent();
  const count = useSyncExternalStore(subscribe, getSnapshot, () => undefined);
  return allowed.visitorCounter ? count : undefined;
}
