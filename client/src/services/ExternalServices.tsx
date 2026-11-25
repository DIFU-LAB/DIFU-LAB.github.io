import { recordVisit, clearVisitorSession } from "./visitor";
import {useEffect} from "react";
import {useLocation} from "wouter";
import {loadVisitorCounter} from "./visitorCounter";
import { recordGoatCounterVisit } from "./goatCounter";
import {services,useConsent} from "./consent";
export function ExternalServices(){
  const {allowed}=useConsent();const [path]=useLocation();
  useEffect(()=>{
    if (!allowed.visitorCounter) return;
    const controller = new AbortController();
    // Defer until the effect is committed; avoids duplicate development StrictMode hits.
    const timer = window.setTimeout(() => { void loadVisitorCounter(controller.signal); }, 0);
    return () => {window.clearTimeout(timer);controller.abort();};
  },[allowed.visitorCounter]);
  useEffect(()=>{
    if(!allowed.analytics)return;
    const script=document.createElement('script');script.src=services.analytics.scriptUrl;script.async=true;script.dataset.websiteId=services.analytics.websiteId;document.head.append(script);
    return ()=>script.remove();
  },[allowed.analytics]);
  useEffect(()=>{
    if (!allowed.visitorMap) { clearVisitorSession(); return; }
    const controller = new AbortController();
    const timer = window.setTimeout(() => { void recordVisit(controller.signal); }, 0);
    return () => { window.clearTimeout(timer); controller.abort(); };
  },[allowed.visitorMap,path]);
  useEffect(()=>{
    if (!allowed.goatCounter) return;
    const timer = window.setTimeout(() => recordGoatCounterVisit(services.goatCounter.site), 0);
    return () => window.clearTimeout(timer);
  },[allowed.goatCounter]);
  return null;
}
