import { useEffect, useState } from "react";
import { services, useConsent, visitorMapProvider } from "./consent";
export interface VisitorSummary {
  visits: number;
  updatedAt?: string;
  historical?: boolean;
  from?: string;
  countries: number;
  topCountries: { countryCode: string; visits: number }[];
  points: { latitude: number; longitude: number; visits: number }[];
}
const interval = 5 * 60 * 1000;
const count = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
export function validSummary(value: unknown): value is VisitorSummary {
  if (!value || typeof value !== 'object') return false;
  const v = value as VisitorSummary;
  return count(v.visits) && count(v.countries) && Array.isArray(v.topCountries) && v.topCountries.length <= 8 && v.topCountries.every(p => p && /^[A-Z]{2}$/.test(p.countryCode) && count(p.visits) && p.visits <= v.visits) && Array.isArray(v.points) && v.points.length <= 300 && v.points.every(p => p && Number.isFinite(p.latitude) && Math.abs(p.latitude) <= 90 && Number.isFinite(p.longitude) && Math.abs(p.longitude) <= 180 && count(p.visits) && p.visits <= v.visits);
}
const bucketMs = 30 * 60 * 1000;
const sessionKey = 'seil-visitor-session-v2';
let inMemory: { bucket: number; id: string; sent: boolean } | undefined;
/** One request per consented browser per fixed half-hour bucket, across page navigation. */
export async function recordVisit(signal: AbortSignal) {
  if (signal.aborted || !services.visitorMap.endpoint) return;
  const bucket = Math.floor(Date.now() / bucketMs);
  let stored = inMemory;
  try { const raw = localStorage.getItem(sessionKey); if (raw) stored = JSON.parse(raw); } catch { /* memory fallback */ }
  if (!stored || stored.bucket !== bucket || typeof stored.id !== 'string') stored = { bucket, id: crypto.randomUUID(), sent: false };
  if (stored.sent) return;
  inMemory = stored;
  try { localStorage.setItem(sessionKey, JSON.stringify(stored)); } catch { /* memory fallback */ }
  try {
    const response = await fetch(`${services.visitorMap.endpoint}/visit`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ visitorId: stored.id }), credentials: 'omit', referrerPolicy: 'no-referrer', signal });
    if (!response.ok || signal.aborted) return;
    stored.sent = true;
    try { localStorage.setItem(sessionKey, JSON.stringify(stored)); } catch { /* memory fallback */ }
  } catch { /* next navigation can retry the same ID, server deduplicates */ }
}
export function clearVisitorSession() { inMemory = undefined; }
export function useVisitorSummary() {
  const { allowed } = useConsent();
  const [data, setData] = useState<VisitorSummary>();
  const [isError, setError] = useState(false);
  useEffect(() => {
    setData(undefined); setError(false);
    if (!allowed.visitorMap && !allowed.goatCounter) return;
    const controller = new AbortController(); let pending = false;
    const load = async () => {
      if (document.hidden || pending || controller.signal.aborted) return;
      pending = true;
      try {
        const url = visitorMapProvider === 'goatcounter'
          ? `${import.meta.env.BASE_URL}visitor-stats.json`
          : `${services.visitorMap.endpoint}/summary`;
        const response = await fetch(url, { cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer', signal: controller.signal });
        if (!response.ok) throw Error('summary');
        const value: unknown = await response.json();
        if (!validSummary(value) || (visitorMapProvider === 'goatcounter' && (typeof value.updatedAt !== 'string' || !Number.isFinite(Date.parse(value.updatedAt))))) throw Error('invalid summary');
        if (!controller.signal.aborted) { setData(value); setError(false); }
      } catch { if (!controller.signal.aborted) setError(true); }
      finally { pending = false; }
    };
    void load();
    const timer = setInterval(load, interval);
    document.addEventListener('visibilitychange', load);
    return () => { controller.abort(); clearInterval(timer); document.removeEventListener('visibilitychange', load); };
  }, [allowed.visitorMap, allowed.goatCounter]);
  const enabled = allowed.visitorMap || allowed.goatCounter;
  return { data: enabled ? data : undefined, isLoading: enabled && !data && !isError, isError };
}

/** Public first-party aggregates, not a tracker. No storage or third-party requests. */
export function useVisitorHistory() {
  const [data, setData] = useState<VisitorSummary>();
  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      if (document.hidden || controller.signal.aborted) return;
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}visitor-history.json`, {cache:'no-store', credentials:'omit', signal:controller.signal});
        if (!response.ok) return;
        const value: unknown = await response.json();
        if (validSummary(value) && value.historical === true && typeof value.updatedAt === 'string' && Number.isFinite(Date.parse(value.updatedAt)) && !controller.signal.aborted) setData(value);
      } catch { /* retain the last confirmed snapshot; live provider remains available */ }
    };
    void load();
    document.addEventListener('visibilitychange',load);
    return () => { controller.abort(); document.removeEventListener('visibilitychange',load); };
  }, []);
  return data;
}
