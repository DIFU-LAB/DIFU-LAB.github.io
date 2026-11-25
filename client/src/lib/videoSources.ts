/** Shared content schema for playable videos. Provider IDs, not arbitrary iframe URLs. */
export interface VideoSource {
  provider: string;
  id?: string;
  src?: string;
  page?: number;
}
export interface VideoRecord {
  sources?: VideoSource[];
  videoId?: string;
  src?: string;
}
export type PlayableSource =
  | { provider: 'youtube'; id: string }
  | { provider: 'bilibili'; id: string; page: number }
  | { provider: 'local'; src: string };
export function getVideoSources(record: VideoRecord): PlayableSource[] {
  const input = record.sources?.length ? record.sources : [
    ...(record.src ? [{provider: 'local', src: record.src}] : []),
    ...(record.videoId ? [{provider: 'youtube', id: record.videoId}] : []),
  ];
  const result: PlayableSource[] = [];
  for (const item of input as VideoSource[]) {
    if (item.provider === 'youtube' && /^[\w-]{11}$/.test(item.id ?? '')) result.push({provider:'youtube', id:item.id!});
    else if (item.provider === 'bilibili' && /^BV[0-9A-Za-z]{10}$/.test(item.id ?? '')) result.push({provider:'bilibili', id:item.id!, page:item.page ?? 1});
    else if (item.provider === 'local' && item.src && /^\/(?:[^/]+\/)*media\//.test(item.src) && !item.src.startsWith('//')) result.push({provider:'local', src:item.src});
  }
  return result;
}
export function providerLabel(provider: PlayableSource['provider'], zh: boolean) {
  return provider === 'local' ? (zh ? '本站视频' : 'On-site video') : provider === 'bilibili' ? (zh ? '哔哩哔哩' : 'Bilibili') : 'YouTube';
}
export function sourceUrl(source: PlayableSource, start = 0) {
  const seconds = Math.max(0, Math.floor(start));
  if (source.provider === 'local') return source.src + (seconds ? `#t=${seconds}` : '');
  if (source.provider === 'youtube') return `https://www.youtube.com/watch?v=${source.id}${seconds ? `&t=${seconds}s` : ''}`;
  return `https://www.bilibili.com/video/${source.id}/?p=${source.page}${seconds ? `&t=${seconds}` : ''}`;
}
export function embedUrl(source: Exclude<PlayableSource, {provider:'local'}>, start = 0) {
  const seconds = Math.max(0, Math.floor(start));
  if (source.provider === 'youtube') return `https://www.youtube-nocookie.com/embed/${source.id}?autoplay=1&rel=0&vq=hd1080${seconds ? `&start=${seconds}` : ''}`;
  return `https://player.bilibili.com/player.html?bvid=${source.id}&p=${source.page}&autoplay=1&danmaku=0&t=${seconds}`;
}
