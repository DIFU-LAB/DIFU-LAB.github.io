#!/usr/bin/env python3
"""Generate content-addressed WebP variants, never overwrite original assets.
Existing hand-tuned srcsets remain authoritative at runtime. Animated files,
explicit originals and small assets are left alone. The manifest is build-only.
"""
from pathlib import Path
from hashlib import sha256
import json
from PIL import Image, ImageOps, UnidentifiedImageError

ROOT = Path(__file__).resolve().parents[1]
MEDIA = ROOT / 'client/public/media'
OUTPUT = MEDIA / '_responsive'
MANIFEST = ROOT / '.cache/responsive-media.json'
WIDTHS = (320, 480, 800, 1200, 1600, 2400)
# Bump this string when changing encoding policy; version also includes Pillow.
from PIL import __version__ as pillow_version
POLICY = f'webp-v1:{pillow_version}:quality84:method4:{WIDTHS}'
OUTPUT.mkdir(exist_ok=True)
MANIFEST.parent.mkdir(exist_ok=True)
try:
    previous = json.loads(MANIFEST.read_text())
except (OSError, ValueError):
    previous = {}
manifest = {}
keep = set()
source_bytes = largest_bytes = 0
for source in sorted(MEDIA.rglob('*')):
    if not source.is_file() or source.suffix.lower() not in {'.jpg', '.jpeg', '.png', '.webp', '.avif', '.tiff', '.tif'}:
        continue
    relative = source.relative_to(MEDIA)
    if relative.parts[0] in {'_responsive', 'fonts'} or source.stem.endswith('-original') or '-original-' in source.stem or 'full-resolution' in source.stem:
        continue
    try:
        with Image.open(source) as raw:
            if getattr(raw, 'is_animated', False):
                continue
            width, height = ImageOps.exif_transpose(raw).size
            if source.stat().st_size < 24_000 and width <= 800:
                continue
            fingerprint = sha256(POLICY.encode() + b'\0' + source.read_bytes()).hexdigest()[:24]
            old = previous.get(relative.as_posix(), {})
            if old.get('fingerprint') == fingerprint and all((MEDIA / item['path']).is_file() for item in old.get('variants', [])):
                entry = old
            else:
                image = ImageOps.exif_transpose(raw)
                # Preserve transparency; normalise CMYK/palette images for WebP.
                image = image.convert('RGBA' if 'A' in image.getbands() or 'transparency' in raw.info else 'RGB')
                widths = sorted(set([w for w in WIDTHS if w < width] + [min(width, WIDTHS[-1])]))
                variants = []
                for w in widths:
                    h = max(1, round(height * w / width))
                    filename = f'{fingerprint}-{w}.webp'
                    target = OUTPUT / filename
                    if not target.exists():
                        resized = image if w == width else image.resize((w, h), Image.Resampling.LANCZOS)
                        resized.save(target, 'WEBP', quality=84, method=4)
                    # Do not publish a same-size or larger encode than the source.
                    if target.stat().st_size < source.stat().st_size * .95:
                        variants.append({'path': target.relative_to(MEDIA).as_posix(), 'width': w})
                entry = {'fingerprint': fingerprint, 'width': width, 'height': height, 'variants': variants}
            manifest[relative.as_posix()] = entry
            keep.update(item['path'] for item in entry['variants'])
            if entry['variants']:
                source_bytes += source.stat().st_size
                largest_bytes += (MEDIA / entry['variants'][-1]['path']).stat().st_size
    except (OSError, ValueError, UnidentifiedImageError) as exc:
        raise RuntimeError(f'Cannot optimise {relative}') from exc
# Clean up orphaned variants only inside the dedicated generated directory.
for item in OUTPUT.glob('*.webp'):
    if item.relative_to(MEDIA).as_posix() not in keep:
        item.unlink()
MANIFEST.write_text(json.dumps(manifest, separators=(',', ':')) + '\n')
print(f'Prepared {len(keep)} variants for {sum(bool(e["variants"]) for e in manifest.values())} images; original {source_bytes:,} bytes vs largest generated variants {largest_bytes:,} bytes.')
