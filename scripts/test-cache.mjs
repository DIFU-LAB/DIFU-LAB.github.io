import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../client/public/sw.js',import.meta.url),'utf8');
test('cache matches only immutable same-origin resources within scope',()=>{
 const c=vm.createContext({URL,self:{registration:{scope:'https://example.org/lab/'},addEventListener(){}}});vm.runInContext(source,c);
 const match=(url,opts)=>c.immutable(new Request(url,opts));const base='https://example.org/lab/';
 assert(match(base+'media/_responsive/'+'a'.repeat(24)+'-800.webp'));assert(match(base+'assets/index-A1b2c3d4.js'));for(const path of ['index.html','research/','media/clip.mp4','media/photo.webp','summary','assets/index.js','assets/index-A1b2c3d4.js?q=1'])assert(!match(base+path));assert(!match('https://other.org/lab/assets/index-A1b2c3d4.js'));assert(!match(base+'assets/index-A1b2c3d4.js',{headers:{Range:'bytes=0-2'}}));assert(!match(base+'assets/index-A1b2c3d4.js',{cache:'reload'}));
});
