import fs from 'node:fs';
import assert from 'node:assert/strict';
const nav=JSON.parse(fs.readFileSync('content/site/navigation.json','utf8'));
for (const {href} of nav) {
  const file='dist'+(href==='/'?'':href)+'/index.html';
  assert(fs.existsSync(file),file+' missing');
  const html=fs.readFileSync(file,'utf8');
  assert(!html.includes('%BASE_URL%'),file+' has unresolved base');
  assert(!html.includes('VITE_ANALYTICS'),file+' has old analytics');
}
assert(fs.existsSync('dist/404.html'));
assert(fs.existsSync('dist/.nojekyll'));
assert(fs.existsSync('dist/media/fonts/latin.css'));
console.log('Static output and route entries OK');
assert(fs.existsSync('dist/sw.js'));
const media = JSON.parse(fs.readFileSync('.cache/responsive-media.json','utf8'));
for (const entry of Object.values(media)) for (const variant of entry.variants) assert(fs.existsSync('dist/media/'+variant.path),variant.path+' missing');
console.log('Responsive assets and service worker OK');
