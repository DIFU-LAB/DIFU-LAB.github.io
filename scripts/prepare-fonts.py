"""Download original Google webfonts at build time (no request from visitors)."""
from pathlib import Path
import hashlib, re, urllib.request, sys
folder=Path('client/public/media/fonts'); folder.mkdir(parents=True,exist_ok=True)
output=folder/'latin.css'
if output.exists() and all((folder/f).exists() for f in re.findall(r'url\(["\']?([^"\')]+)',output.read_text())):
    sys.exit(0)
url='https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600&family=Source+Sans+3:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&display=swap'
ua='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
def get(url):
    with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':ua}),timeout=40) as f:return f.read()
css=get(url).decode(); found=set(re.findall(r'https://fonts\.gstatic\.com/[^)\s]+',css))
if not found:raise RuntimeError('Google font stylesheet contained no downloadable fonts')
for u in sorted(found):
    filename='latin-'+hashlib.sha256(u.encode()).hexdigest()[:16]+'.woff2'
    data=get(u)
    if data[:4]!=b'wOF2':raise RuntimeError('Expected WOFF2 from '+u)
    (folder/filename).write_bytes(data);css=css.replace(u,filename)
# Retain upstream license with the generated files.
for family,name in [('ebgaramond','EB-Garamond-OFL.txt'),('sourcesans3','Source-Sans-3-OFL.txt')]:
    (folder/name).write_bytes(get('https://raw.githubusercontent.com/google/fonts/main/ofl/'+family+'/OFL.txt'))
output.write_text(css)
print('Prepared',len(found),'local webfont files')
