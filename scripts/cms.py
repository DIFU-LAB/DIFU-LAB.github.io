"""Local file-based editor. No production server, account, or remote credentials."""
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import json, secrets, re, subprocess, sys, os, threading
from urllib.parse import urlparse,parse_qs
ROOT=Path(__file__).resolve().parents[1]; CONTENT=ROOT/'content'; MEDIA=ROOT/'client/public/media'; TOKEN=secrets.token_urlsafe(32); LOCK=threading.Lock()
PORT=int(os.environ.get('CMS_PORT','8765')); HOST=f'127.0.0.1:{PORT}'
COLLECTIONS={'news','gallery','publications','videos'}
EXT={'.webp','.png','.jpg','.jpeg','.svg','.mp4','.webm','.vtt','.pdf','.avif'}

def safe(base,rel):
    if not isinstance(rel,str) or '\\' in rel or rel.startswith('/') or any(part in ('','.','..') for part in rel.split('/')):raise ValueError('Invalid path')
    p=(base/rel).resolve()
    if not p.is_relative_to(base.resolve()):raise ValueError('Invalid path')
    return p

def content_path(rel):
    p=safe(CONTENT,rel)
    if p.suffix!='.json' or p.relative_to(CONTENT).parts[0] in ('provenance','templates'):raise ValueError('Only editable JSON content is supported')
    return p

class Handler(BaseHTTPRequestHandler):
    def send(self,body,status=200,mime='application/json; charset=utf-8'):
        if not isinstance(body,bytes):body=json.dumps(body,ensure_ascii=False).encode()
        self.send_response(status);self.send_header('Content-Type',mime);self.send_header('Content-Length',str(len(body)));self.send_header('Cache-Control','no-store');self.send_header('X-Content-Type-Options','nosniff');self.end_headers();self.wfile.write(body)
    def guard(self,write=False):
        if self.headers.get('Host')!=HOST:raise ValueError('Use the printed localhost address')
        if write and self.headers.get('X-CMS-Token')!=TOKEN:raise ValueError('Invalid editor token')
    def do_GET(self):
        try:
            self.guard();u=urlparse(self.path);q=parse_qs(u.query)
            if u.path=='/':return self.send((ROOT/'scripts/cms.html').read_text().replace('__CMS_TOKEN__',TOKEN).encode(),mime='text/html; charset=utf-8')
            if u.path=='/api/files':return self.send([str(p.relative_to(CONTENT)) for p in sorted(CONTENT.rglob('*.json')) if p.relative_to(CONTENT).parts[0] not in ('provenance','templates')])
            if u.path=='/api/read':return self.send(json.loads(content_path(q['path'][0]).read_text()))
            if u.path=='/api/template':
                collection=q['collection'][0]
                if collection not in COLLECTIONS:raise ValueError('Unknown collection')
                return self.send(json.loads((CONTENT/'templates'/f'{collection}.json.example').read_text()))
            if u.path=='/api/media':return self.send([str(p.relative_to(MEDIA)) for p in sorted(MEDIA.rglob('*')) if p.is_file() and p.suffix.lower() in EXT])
            return self.send({'error':'Not found'},404)
        except (ValueError,KeyError,OSError) as e:self.send({'error':str(e)},400)
    def do_POST(self):
        try:
            self.guard(True);u=urlparse(self.path);length=int(self.headers.get('Content-Length','0'))
            if length<0 or length>=100*1024*1024:raise ValueError('File is too large for GitHub')
            if u.path=='/api/upload':
                rel=parse_qs(u.query)['path'][0];p=safe(MEDIA,rel)
                if p.suffix.lower() not in EXT:raise ValueError('Unsupported media type')
                with LOCK:
                    if p.exists():raise ValueError('File already exists; choose a new filename')
                    p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(self.rfile.read(length))
                return self.send({'path':'/media/'+rel})
            data=json.loads(self.rfile.read(length));p=content_path(data['path']);rel=p.relative_to(CONTENT)
            if u.path not in ('/api/save','/api/delete'):return self.send({'error':'Not found'},404)
            if (not p.exists() or u.path=='/api/delete') and (len(rel.parts)!=2 or rel.parts[0] not in COLLECTIONS):raise ValueError('Only collection entries can be created/deleted')
            with LOCK:
                old=p.read_bytes() if p.exists() else None
                if u.path=='/api/delete':p.unlink()
                else:
                    p.parent.mkdir(parents=True,exist_ok=True)
                    tmp=p.with_suffix('.tmp');tmp.write_text(json.dumps(data['value'],ensure_ascii=False,indent=2)+'\n');tmp.replace(p)
                result=subprocess.run([sys.executable,str(ROOT/'scripts/validate-content.py')],capture_output=True,text=True,cwd=ROOT)
                if result.returncode:
                    if old is None:p.unlink(missing_ok=True)
                    else:p.write_bytes(old)
                    raise ValueError(result.stderr.strip() or result.stdout.strip())
            return self.send({'ok':True})
        except (ValueError,KeyError,OSError,TypeError) as e:self.send({'error':str(e)},400)

if __name__=='__main__':
    print(f'SEIL content editor: http://{HOST}/ (local only; Ctrl+C to stop)',flush=True)
    ThreadingHTTPServer(('127.0.0.1',PORT),Handler).serve_forever()
