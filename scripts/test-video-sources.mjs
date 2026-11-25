import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getVideoSources, embedUrl, sourceUrl} from '../client/src/lib/videoSources.ts';

test('provider records support both platforms and a local source',()=>{
  const sources=getVideoSources({sources:[
    {provider:'youtube',id:'jpFk4xBFm9E'},
    {provider:'bilibili',id:'BV1B7411m7LV',page:2},
    {provider:'local',src:'/media/research/demo.mp4'},
  ]});
  assert.equal(sources.length,3);
  assert.equal(embedUrl(sources[0],226),'https://www.youtube-nocookie.com/embed/jpFk4xBFm9E?autoplay=1&rel=0&vq=hd1080&start=226');
  const bili=new URL(embedUrl(sources[1],226));
  assert.equal(bili.origin,'https://player.bilibili.com');
  assert.equal(bili.searchParams.get('bvid'),'BV1B7411m7LV');
  assert.equal(bili.searchParams.get('p'),'2');
  assert.equal(bili.searchParams.get('t'),'226');
  assert.equal(sourceUrl(sources[2],226),'/media/research/demo.mp4#t=226');
});
test('legacy entries, default part and project-base paths work',()=>{
  assert.deepEqual(getVideoSources({videoId:'jpFk4xBFm9E'}),[{provider:'youtube',id:'jpFk4xBFm9E'}]);
  assert.deepEqual(getVideoSources({sources:[{provider:'bilibili',id:'BV1B7411m7LV'}]}),[{provider:'bilibili',id:'BV1B7411m7LV',page:1}]);
  assert.deepEqual(getVideoSources({src:'/project/media/clip.mp4'}),[{provider:'local',src:'/project/media/clip.mp4'}]);
});
test('arbitrary remote iframe or video URLs are not accepted as sources',()=>{
  assert.deepEqual(getVideoSources({sources:[{provider:'youtube',id:'https://example.org'},{provider:'bilibili',id:'invalid'},{provider:'local',src:'https://example.org/media/clip.mp4'},{provider:'unknown',id:'anything'}]}),[]);
});
