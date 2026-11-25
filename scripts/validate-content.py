from pathlib import Path
from datetime import datetime
import json,re,sys
root=Path(__file__).resolve().parents[1]; content=root/'content'; public=root/'client/public'
errors=[]; records={}
for p in content.rglob('*.json'):
 try: records[p]=json.loads(p.read_text())
 except Exception as e: errors.append(f'{p.relative_to(root)}: {e}')
def fail(p,msg):errors.append(f'{p.relative_to(root)}: {msg}')
def check_paths(p,v):
 if isinstance(v,dict):
  for value in v.values():check_paths(p,value)
 elif isinstance(v,list):
  for value in v:check_paths(p,value)
 elif isinstance(v,str):
  for u in re.findall(r'/media/[^\s,;"\'<>]+',v):
   if not (public/u[1:]).is_file():fail(p,'missing media '+u)
for p,v in records.items():
 if 'provenance' not in p.parts:check_paths(p,v)
def validate_video(p,v,required=False,field='sources'):
 if not isinstance(v,dict):fail(p,'video record must be an object');return
 sources=v.get(field,[])
 if not isinstance(sources,list):fail(p,field+' must be an array');return
 if field=='sources' and not sources:
  sources=([{'provider':'local','src':v['src']}] if v.get('src') else [])+([{'provider':'youtube','id':v['videoId']}] if v.get('videoId') else [])
 if required and not sources:fail(p,'provide at least one video source')
 if field=='sources' and v.get('sources') and (v.get('src') or v.get('videoId')):fail(p,'use sources instead of legacy src/videoId, not both')
 if field=='sources' and v.get('src') and v.get('videoId'):fail(p,'use sources for multiple alternatives')
 seen=set()
 for i,item in enumerate(sources,1):
  label=f'{field}[{i}]'
  if not isinstance(item,dict):fail(p,label+' must be an object');continue
  provider=item.get('provider');id=item.get('id','');src=item.get('src','');page=item.get('page',1)
  if provider=='youtube':
   if not isinstance(id,str) or not re.fullmatch(r'[A-Za-z0-9_-]{11}',id):fail(p,label+' requires an 11-character YouTube ID')
   if src:fail(p,label+' external sources must not contain src')
  elif provider=='bilibili':
   if not isinstance(id,str) or not re.fullmatch(r'BV[0-9A-Za-z]{10}',id):fail(p,label+' requires a Bilibili BV ID')
   if type(page)!=int or page<1:fail(p,label+' page must be a positive integer')
   if src:fail(p,label+' external sources must not contain src')
  elif provider=='local':
   if not isinstance(src,str) or not re.fullmatch(r'/media/[A-Za-z0-9_./-]+\.(mp4|webm)',src) or '..' in Path(src).parts:fail(p,label+' requires a local /media/ MP4 or WebM path')
   if id:fail(p,label+' local sources must not contain a provider ID')
  else:fail(p,label+' provider must be youtube, bilibili or local')
  fingerprint=(str(provider),str(id),str(src),str(page) if provider=='bilibili' else '')
  if fingerprint in seen:fail(p,label+' duplicate video source')
  seen.add(fingerprint)
 for name in ('poster','captionsEn','captionsZh'):
  value=v.get(name)
  if value and (not isinstance(value,str) or not value.startswith('/media/') or '..' in Path(value).parts):fail(p,name+' must be a local /media/ path')

required={'news':['id','title','linkedinUrl','publishedAt'],'gallery':['id','title','image','category','description','width','height'],'publications':['id','title','authors','authorNames','year','doi','url','type','versions','sourceUrl','sourceRecordIds'],'videos':['id','title']}
for collection,fields in required.items():
 seen=set()
 for p,v in records.items():
  if p.parent!=content/collection:continue
  if not isinstance(v,dict):fail(p,'expected one object');continue
  for k in fields:
   if k not in v:fail(p,'missing '+k)
  id=str(v.get('id',''))
  if not id or id in seen:fail(p,'empty or duplicate ID '+id)
  seen.add(id)
  if collection=='news':
   try:datetime.fromisoformat(v['publishedAt'].replace('Z','+00:00'))
   except Exception:fail(p,'publishedAt must be ISO date/time')
  if collection=='videos': validate_video(p,v,required=True)
 if collection!='videos': print(f'{collection}: {len(seen)} records')
findings_path=content/'research/findings.json'
for finding in records.get(findings_path,[]):validate_video(findings_path,finding)
keynote_path=content/'research/keynote.json'
validate_video(keynote_path,records.get(keynote_path,{}),required=True)
film_path=content/'pages/home/film.json'
validate_video(film_path,records.get(film_path,{}),field='alternatives')
for p in public.rglob('*'):
 if p.is_file() and p.stat().st_size>=100*1024*1024:fail(p,'exceeds GitHub 100 MiB file limit')
def check_translations(p, value):
 if isinstance(value,list):
  for item in value:check_translations(p,item)
 elif isinstance(value,dict):
  if 'translations' in value:
   translations=value['translations']
   if not isinstance(translations,dict):fail(p,'translations must be an object keyed by language ID')
   else:
    for lang,fields in translations.items():
     if not re.fullmatch(r'[a-z]{2,3}(?:-[A-Za-z0-9]+)*',lang) or not isinstance(fields,dict):fail(p,'invalid translation language '+lang);continue
     for k,v in fields.items():
      if k not in value or not isinstance(v,str) or not (isinstance(value[k],str) or value[k] is None):fail(p,'invalid translated text field '+lang+'.'+k)
  for k,v in value.items():
   if k!='translations':check_translations(p,v)
for p,v in records.items():
 if 'provenance' not in p.parts and 'translations' not in p.parts:check_translations(p,v)
locales=root/'translations/locales'
try:
 en=json.loads((locales/'en.json').read_text()); zh=json.loads((locales/'zh-CN.json').read_text())
 if set(en)!=set(zh):fail(locales,'English and Chinese UI catalog keys must match')
 for lang,items in [('en',en),('zh-CN',zh)]:
  for k,v in items.items():
   if not isinstance(v,str) or not v.strip():fail(locales/(lang+'.json'),'empty UI translation '+k)
except (OSError,ValueError) as exc:fail(locales,str(exc))
for p in (root/'client/src').rglob('*'):
 if p.suffix not in ('.ts','.tsx','.css'):continue
 t=p.read_text()
 if re.search(r'https://(?:files\.manuscdn\.com|d2xsxph8kpxj0f\.cloudfront\.net)',t):fail(p,'legacy media URL')
 # Literal media references only, dynamic family paths checked by manifest.
 for u in re.findall(r'/media/[^\s,;"\'<>`{}]+\.(?:webp|png|jpeg|jpg|svg|mp4|vtt|woff2|txt)',t):
  if not (public/u[1:]).is_file():fail(p,'missing media '+u)
for key,cfg in records.get(content/'site/services.json',{}).items():
 if not isinstance(cfg.get('enabled'),bool):fail(content/'site/services.json',key+' enabled must be boolean')
 if cfg.get('enabled') and key in ('analytics','visitorMap'):
  field='scriptUrl' if key=='analytics' else 'endpoint'
  if not cfg.get(field,'').startswith('https://') and not (key=='visitorMap' and not cfg.get(field)):fail(content/'site/services.json',key+' requires HTTPS '+field)
  if key=='analytics' and not cfg.get('websiteId'):fail(content/'site/services.json','analytics requires websiteId')
 if key=='visitorCounter' and cfg.get('enabled'):
  for field in ('namespace','key'):
   if not isinstance(cfg.get(field),str) or not re.fullmatch(r'[A-Za-z0-9_.-]{3,64}',cfg[field]):fail(content/'site/services.json','visitorCounter requires valid '+field)
  hosts=cfg.get('hosts')
  if not isinstance(hosts,list) or not hosts or any(not isinstance(host,str) or not re.fullmatch(r'[a-zA-Z0-9.-]+',host) for host in hosts):fail(content/'site/services.json','visitorCounter requires production hostnames without protocol or path')
if errors: print('\n'.join(errors),file=sys.stderr);sys.exit(1)
print(f'Validated {len(records)} content files and local media references.')
