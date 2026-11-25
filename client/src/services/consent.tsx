import { createContext, useContext, useState, type ReactNode } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import config from "@content/site/services.json";
export const services = config;
export type Consent = { youtube: boolean; bilibili: boolean; visitorCounter: boolean; analytics: boolean; visitorMap: boolean };
const empty: Consent = {youtube:false, bilibili:false, visitorCounter:false, analytics:false, visitorMap:false};
const key = "seil-consent-v1";
const available: Consent = {youtube:config.youtube.enabled, bilibili:config.bilibili.enabled, visitorCounter:config.visitorCounter.enabled && !!config.visitorCounter.namespace && !!config.visitorCounter.key && config.visitorCounter.hosts.includes(window.location.hostname), analytics:config.analytics.enabled && !!config.analytics.scriptUrl && !!config.analytics.websiteId, visitorMap:config.visitorMap.enabled && !!config.visitorMap.endpoint};
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
  const {language}=useLanguage();
  const zh=language==="zh";
  const [draft,setDraft]=useState<Consent>(stored ?? empty);
  const allowed: Consent={youtube:available.youtube && !!stored?.youtube, bilibili:available.bilibili && !!stored?.bilibili, visitorCounter:available.visitorCounter && !!stored?.visitorCounter, analytics:available.analytics && !!stored?.analytics, visitorMap:available.visitorMap && !!stored?.visitorMap};
  const open=()=>{setDraft(stored??empty);setVisible(true);};
  function save(next:Consent){const reload=!!stored?.analytics && !next.analytics; try{localStorage.setItem(key,JSON.stringify(next));if(!next.visitorMap)localStorage.removeItem("seil-visitor-id");}catch{}setStored(next);setVisible(false);setReviewNew(false);if(reload)window.location.reload();}
  const show=visible || reviewNew || (!stored && Object.values(available).some(Boolean));
  const label:Record<keyof Consent,string>={youtube:zh?"YouTube 视频（Google）":"YouTube videos (Google)",bilibili:zh?"哔哩哔哩视频":"Bilibili videos",visitorCounter:zh?"访问次数统计（Abacus）":"Visit count (Abacus)",analytics:zh?"网站访问分析":"Website analytics",visitorMap:zh?"访客地图统计":"Visitor map statistics"};
  return <Context.Provider value={{allowed,open,decided:!!stored,available}}>{children}{show && <aside aria-label={zh?"隐私设置":"Privacy preferences"} className="fixed bottom-4 left-4 right-4 z-[100] sm:left-auto sm:max-w-lg bg-white border border-[#E2E8F0] shadow-xl p-5 sm:p-6 text-[#1B2A4A] rounded-sm">
    <h2 className="font-heading text-2xl">{zh?"隐私与 Cookie 设置":"Privacy & cookies"}</h2>
    <p className="text-sm text-[#4A5568] mt-2">{zh?"网站的必要设置保存在您的设备上。只有您同意后，才会连接所选的第三方服务；这些服务可能处理您的 IP 地址或使用 Cookie。您可随时在页脚修改选择。":"Essential preferences are stored on your device. Optional third-party services connect only with your permission and may process your IP address or use cookies. Change your choices at any time in the footer."}</p>
    <div className="mt-3 space-y-2">{(Object.keys(available) as (keyof Consent)[]).filter(k=>available[k]).map(k=><label key={k} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft[k]} onChange={e=>setDraft(v=>({...v,[k]:e.target.checked}))}/>{label[k]}</label>)}</div>
    <p className="text-xs mt-3 text-[#64748B]">{zh?"外部服务详情：":"External service information:"} <a className="underline" href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">{zh?"Google 隐私政策":"Google privacy policy"}</a>{available.bilibili && <> · <a className="underline" href="https://www.bilibili.com/blackboard/privacy-pc.html" target="_blank" rel="noreferrer">{zh?"哔哩哔哩隐私政策":"Bilibili privacy policy"}</a></>}{available.visitorCounter && <> · <a className="underline" href="https://v2.jasoncameron.dev/abacus/" target="_blank" rel="noreferrer">Abacus</a></>}</p>
    <div className="mt-4 flex flex-wrap gap-2"><button className="px-3 py-2 bg-[#1B2A4A] text-white text-sm" onClick={()=>save(available)}>{zh?"全部接受":"Accept all"}</button><button className="px-3 py-2 border border-[#1B2A4A] text-sm" onClick={()=>save(empty)}>{zh?"拒绝可选服务":"Reject optional"}</button><button className="px-3 py-2 border border-[#1B2A4A] text-sm" onClick={()=>save(draft)}>{zh?"保存选择":"Save choices"}</button></div>
  </aside>}</Context.Provider>;
}
