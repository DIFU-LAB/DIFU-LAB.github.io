// Optional Cloudflare Workers + D1 integration, hosted separately from Pages.
// Only an opaque opted-in browser identifier (hashed), coarse location, and
// 30-minute bucket are persisted. No raw IP, URL, UA or email is written.
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const bots=/bot|crawl|spider|slurp|headless|lighthouse|preview|curl|wget|monitor|uptime/i;
export default {async fetch(request,env){
 const origin=request.headers.get('Origin')||'';
 const allowed=(env.ALLOWED_ORIGINS||'').split(',').map(s=>s.trim());
 if(!origin||!allowed.includes(origin))return new Response('Forbidden',{status:403});
 const headers={'Access-Control-Allow-Origin':origin,'Vary':'Origin','Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Cache-Control':'no-store'};
 const json=(value,status=200)=>Response.json(value,{status,headers});
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
 const path=new URL(request.url).pathname.replace(/\/$/,'');
 try{
  if(path==='/visit'&&request.method==='POST'){
   if(!request.headers.get('user-agent')||bots.test(request.headers.get('user-agent')))return json({recorded:false});
   const raw=await request.text();if(raw.length>256)return json({error:'Invalid request'},400);
   let payload;try{payload=JSON.parse(raw);}catch{return json({error:'Invalid JSON'},400);}
   if(!UUID.test(payload.visitorId||''))return json({error:'Invalid identifier'},400);
   const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(payload.visitorId));
   const id=Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,'0')).join('');
   const cf=request.cf||{};const country=/^[A-Z]{2}$/.test(cf.country||'')&&cf.country!=='XX'?cf.country:null;
   const coord=(v,max)=>v==null||v===''||!Number.isFinite(Number(v))||Math.abs(Number(v))>max?null:Math.round(Number(v));
   const result=await env.DB.prepare('INSERT OR IGNORE INTO visits(visitor_id,bucket,country,latitude,longitude) VALUES(?,?,?,?,?)').bind(id,Math.floor(Date.now()/1800000),country,coord(cf.latitude,90),coord(cf.longitude,180)).run();
   return json({recorded:!!result.meta?.changes});
  }
  if(path==='/summary'&&request.method==='GET'){
   const [total,countries,points]=await env.DB.batch([
    env.DB.prepare('SELECT COUNT(DISTINCT visitor_id) AS visitors, COUNT(*) AS visits, COUNT(DISTINCT country) AS countries FROM visits'),
    env.DB.prepare('SELECT country AS countryCode, COUNT(DISTINCT visitor_id) AS visitors FROM visits WHERE country IS NOT NULL GROUP BY country ORDER BY visitors DESC LIMIT 8'),
    env.DB.prepare('SELECT latitude, longitude, COUNT(DISTINCT visitor_id) AS visitors FROM visits WHERE latitude IS NOT NULL AND longitude IS NOT NULL GROUP BY latitude,longitude HAVING COUNT(DISTINCT visitor_id)>=2 ORDER BY visitors DESC LIMIT 300')
   ]);
   return json({...total.results[0],topCountries:countries.results,points:points.results});
  }
  return json({error:'Not found'},404);
 }catch{return json({error:'Service unavailable'},503);}
}};
