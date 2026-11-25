import { useTranslation } from "react-i18next";
import { createContext, useContext, useState, type ReactNode } from "react";
import config from "@content/site/services.json";
const endpoint = (import.meta.env.VITE_VISITOR_MAP_ENDPOINT || config.visitorMap.endpoint).trim().replace(/\/+$/, "");
const validEndpoint = /^https:\/\/[^/?#]+(?:\/[^?#]*)?$/.test(endpoint);
export const services = { ...config, visitorMap: { ...config.visitorMap, endpoint: validEndpoint ? endpoint : "" } };
export type Consent = { youtube: boolean; bilibili: boolean; visitorCounter: boolean; analytics: boolean; visitorMap: boolean };
const empty: Consent = {youtube:false, bilibili:false, visitorCounter:false, analytics:false, visitorMap:false};
const key = "seil-consent-v2";
const mapConfigured = services.visitorMap.enabled && !!services.visitorMap.endpoint;
const productionHost = config.visitorCounter.hosts.includes(window.location.hostname);
const available: Consent = {youtube:config.youtube.enabled, bilibili:config.bilibili.enabled, visitorCounter:!mapConfigured && config.visitorCounter.enabled && !!config.visitorCounter.namespace && !!config.visitorCounter.key && config.visitorCounter.hosts.includes(window.location.hostname), analytics:config.analytics.enabled && !!config.analytics.scriptUrl && !!config.analytics.websiteId, visitorMap:mapConfigured && productionHost};
function read(): Consent | null {
  try {const raw=localStorage.getItem(key); if(!raw)return null;const value=JSON.parse(raw);return {youtube:value.youtube===true, bilibili:value.bilibili===true, visitorCounter:value.visitorCounter===true, analytics:value.analytics===true, visitorMap:value.visitorMap===true};} catch {return null;}
}
const Context = createContext({allowed:empty, open:()=>{}, decided:false, available});
export const useConsent = () => useContext(Context);
export function ConsentProvider({children}:{children:ReactNode}) {
  const [stored,setStored]=useState<Consent|null>(read);
  const [visible,setVisible]=useState(false);
  // Previously stored choices never imply consent to a newly added provider.
  const [reviewNew,setReviewNew]=useState(()=>{try{const raw=localStorage.getItem(key);if(!raw)return false;const value=JSON.parse(raw);return (Object.keys(available) as (keyof Consent)[]).some(k=>available[k] && typeof value[k]!=="boolean");}catch{return false;}});
  const { t } = useTranslation();
  
  const [draft,setDraft]=useState<Consent>(stored ?? empty);
  const allowed: Consent={youtube:available.youtube && !!stored?.youtube, bilibili:available.bilibili && !!stored?.bilibili, visitorCounter:available.visitorCounter && !!stored?.visitorCounter, analytics:available.analytics && !!stored?.analytics, visitorMap:available.visitorMap && !!stored?.visitorMap};
  const open=()=>{setDraft(stored??empty);setVisible(true);};
  function save(next:Consent){const reload=!!stored?.analytics && !next.analytics; try{localStorage.setItem(key,JSON.stringify(Object.fromEntries(Object.entries(next).filter(([k])=>available[k as keyof Consent]))));if(!next.visitorMap){ localStorage.removeItem("seil-visitor-id"); localStorage.removeItem("seil-visitor-session-v2"); }}catch{}setStored(next);setVisible(false);setReviewNew(false);if(reload)window.location.reload();}
  const show=visible || reviewNew || (!stored && Object.values(available).some(Boolean));
  const label:Record<keyof Consent,string>={youtube:t("YouTube videos (Google)"),bilibili:t("Bilibili videos"),visitorCounter:t("Visit count (Abacus)"),analytics:t("Website analytics"),visitorMap:t("Visitor map statistics (Cloudflare)")};
  return <Context.Provider value={{allowed,open,decided:!!stored,available}}>{children}{show && <aside aria-label={t("Privacy preferences")} className="fixed bottom-4 left-4 right-4 z-[100] sm:left-auto sm:max-w-lg bg-white border border-[#E2E8F0] shadow-xl p-5 sm:p-6 text-[#1B2A4A] rounded-sm">
    <h2 className="font-heading text-2xl">{t("Privacy & cookies")}</h2>
    <p className="text-sm text-[#4A5568] mt-2">{t("Essential preferences are stored on your device. Optional third-party services connect only with your permission and may process your IP address or use cookies. Change your choices at any time in the footer.")}</p>
    <div className="mt-3 space-y-2">{(Object.keys(available) as (keyof Consent)[]).filter(k=>available[k]).map(k=><label key={k} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft[k]} onChange={e=>setDraft(v=>({...v,[k]:e.target.checked}))}/>{label[k]}</label>)}</div>
    <p className="text-xs mt-3 text-[#64748B]">{t("External service information:")} <a className="underline" href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">{t("Google privacy policy")}</a>{available.bilibili && <> · <a className="underline" href="https://www.bilibili.com/blackboard/privacy-pc.html" target="_blank" rel="noreferrer">{t("Bilibili privacy policy")}</a></>}{available.visitorMap && <> · <a className="underline" href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noreferrer">{t("Cloudflare privacy policy")}</a></>}{available.visitorCounter && <> · <a className="underline" href="https://v2.jasoncameron.dev/abacus/" target="_blank" rel="noreferrer">Abacus</a></>}</p>
    <div className="mt-4 flex flex-wrap gap-2"><button className="px-3 py-2 bg-[#1B2A4A] text-white text-sm" onClick={()=>save(available)}>{t("Accept all")}</button><button className="px-3 py-2 border border-[#1B2A4A] text-sm" onClick={()=>save(empty)}>{t("Reject optional")}</button><button className="px-3 py-2 border border-[#1B2A4A] text-sm" onClick={()=>save(draft)}>{t("Save choices")}</button></div>
  </aside>}</Context.Provider>;
}
