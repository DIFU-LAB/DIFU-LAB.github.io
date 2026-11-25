import {useEffect,useState} from 'react';
import {services,useConsent} from './consent';
export interface VisitorSummary {visitors:number;visits:number;countries:number;topCountries:{countryCode:string;visitors:number}[];points:{latitude:number;longitude:number;visitors:number}[]}
export function useVisitorSummary(){
 const {allowed}=useConsent();const [data,setData]=useState<VisitorSummary>();const [isError,setError]=useState(false);
 useEffect(()=>{setData(undefined);setError(false);if(!allowed.visitorMap)return;const controller=new AbortController();let active=true;
 const load=()=>fetch(services.visitorMap.endpoint.replace(/\/$/,'')+'/summary',{credentials:'omit',signal:controller.signal}).then(r=>{if(!r.ok)throw Error('summary');return r.json();}).then((v:VisitorSummary)=>{if(!Number.isFinite(v.visitors)||!Number.isFinite(v.countries)||!Array.isArray(v.points)||!Array.isArray(v.topCountries))throw Error('invalid summary');if(active){setData(v);setError(false);}}).catch(()=>{if(active)setError(true);});
 load();const timer=setInterval(load,60000);return()=>{active=false;controller.abort();clearInterval(timer);};},[allowed.visitorMap]);
 return {data:allowed.visitorMap?data:undefined,isLoading:allowed.visitorMap&&!data&&!isError,isError};
}
