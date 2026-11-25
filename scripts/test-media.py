from pathlib import Path
from PIL import Image
import json
root=Path(__file__).resolve().parents[1];media=root/'client/public/media'
manifest=json.loads((root/'.cache/responsive-media.json').read_text());count=0
for source,entry in manifest.items():
 original=media/source; widths=[]
 for variant in entry['variants']:
  path=media/variant['path'];assert path.is_file();assert path.stat().st_size<original.stat().st_size
  with Image.open(path) as img:
   assert img.format=='WEBP' and img.width==variant['width']<=entry['width'];assert abs(img.height-round(entry['height']*img.width/entry['width']))<=1
  widths.append(variant['width']);count+=1
 assert widths==sorted(set(widths))
print(f'Validated {count} responsive WebP variants')
