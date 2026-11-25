import {useEffect} from "react";
import {useLocation} from "wouter";
import {loadVisitorCounter} from "./visitorCounter";
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
    if(!allowed.visitorMap)return;
    const controller=new AbortController();
    let visitorId:string;try{visitorId=localStorage.getItem('seil-visitor-id')||crypto.randomUUID();localStorage.setItem('seil-visitor-id',visitorId);}catch{return;}
    fetch(services.visitorMap.endpoint.replace(/\/$/,'')+'/visit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({visitorId}),credentials:'omit',signal:controller.signal}).catch(()=>{});
    return ()=>controller.abort();
  },[allowed.visitorMap,path]);
  return null;
}
