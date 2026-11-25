import { useConsent } from "@/services/consent";
import { researchImagery } from "@/lib/researchImagery";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState, type ReactNode } from "react";
import { getVideoSources, providerLabel, sourceUrl, embedUrl, type VideoSource } from "@/lib/videoSources";
import { Play } from "lucide-react";

export interface VideoPoster {
  src: string;
  srcSet?: string;
  width: number;
  height: number;
}

export function ResearchVideo({
  videoId,
  sources,
  captionsEn,
  captionsZh,
  title,
  poster,
  showTitle = true,
  playPosition = "center",
  start = 0,
  autoLoad = false,
  playbackRequest = 0,
  sizes = "(min-width: 1024px) 720px, calc(100vw - 48px)",
  prominent = false,
  cover,
}: {
  videoId?: string;
  sources?: VideoSource[];
  captionsEn?: string;
  captionsZh?: string;
  title: string;
  /** Optional custom high-resolution cover; defaults to YouTube's 1280x720 frame. */
  poster?: VideoPoster;
  showTitle?: boolean;
  /** "corner" keeps the play control clear of text designed into a custom cover. */
  playPosition?: "center" | "corner";
  /** Start time in seconds, e.g. for chapter links. */
  start?: number;
  /** Load the player immediately (used after a chapter is chosen). */
  autoLoad?: boolean;
  playbackRequest?: number;
  sizes?: string;
  /** Larger play control for a featured video. */
  prominent?: boolean;
  /** Custom cover markup (live text + real photo), rendered instead of a poster image. */
  cover?: ReactNode;
}) {
  const { t, language } = useLanguage();
  const consent=useConsent();
  const alternatives = getVideoSources({sources, videoId});
  const zh = language === "zh";
  const preferred = zh ? "bilibili" : "youtube";
  const enabledSource = (source: typeof alternatives[number]) => source.provider === "local" || consent.available[source.provider];
  const allowedSource = (source: typeof alternatives[number]) => source.provider === "local" || consent.allowed[source.provider];
  const defaultSource = alternatives.find(s => s.provider === "local") ?? alternatives.find(s => s.provider === preferred && allowedSource(s)) ?? alternatives.find(allowedSource) ?? alternatives.find(s => s.provider === preferred && enabledSource(s)) ?? alternatives.find(enabledSource) ?? alternatives[0];
  const [selection, setSelection] = useState<number | null>(() => autoLoad && defaultSource ? alternatives.indexOf(defaultSource) : null);
  const source = selection === null ? defaultSource : alternatives[selection] ?? defaultSource;
  const [loaded, setLoaded] = useState(autoLoad);
  const [fallback, setFallback] = useState(false);
  // Keep the chosen provider when another chapter is selected.
  useEffect(() => { if (playbackRequest > 0) setLoaded(true); }, [playbackRequest]);
  if (!source) return null;
  const enabled = enabledSource(source);
  const permitted = allowedSource(source);
  const firstYoutube = alternatives.find((s): s is Extract<typeof s, {provider:"youtube"}> => s.provider === "youtube");
  const originalId = videoId ?? firstYoutube?.id;
  const localPoster = originalId === "bjiYEs1x-7E" ? researchImagery.icubAttention.src : originalId === "Jv8lMv8z85M" ? researchImagery.collaboration.src : researchImagery.humanAttention.src;
  const youtubePoster = source.provider === "youtube" && permitted ? `https://i.ytimg.com/vi/${source.id}/${fallback ? "hqdefault" : "maxresdefault"}.jpg` : localPoster;

  return (
    <div>
    <div className="aspect-video w-full overflow-hidden rounded-sm bg-[#1B2A4A]">
      {loaded && source.provider === "local" ? (
        <video key={`${sourceUrl(source, start)}:${playbackRequest}`} src={sourceUrl(source, start)} controls autoPlay playsInline poster={poster?.src} className="w-full h-full object-contain" aria-label={t(title)}>
          {captionsEn && <track kind="captions" src={captionsEn} srcLang="en" label="English"/>}
          {captionsZh && <track kind="captions" src={captionsZh} srcLang="zh" label="中文"/>}
        </video>
      ) : loaded && permitted && source.provider !== "local" ? (
        <iframe
          key={`${embedUrl(source,start)}:${playbackRequest}`}
          src={embedUrl(source,start)}
          title={t(title)}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => { if (!enabled) { window.open(sourceUrl(source,start), "_blank", "noopener,noreferrer"); return; } setSelection(alternatives.indexOf(source)); setLoaded(true); if (!permitted) consent.open(); }}
          aria-label={`${t("Play video")}: ${t(title)}`}
          className="group relative w-full h-full cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-[#8B1A1A]"
        >
          {cover ?? (
            <img
              src={poster?.src ?? youtubePoster}
              srcSet={poster?.srcSet}
              sizes={sizes}
              width={poster?.width ?? 1280}
              height={poster?.height ?? 720}
              alt=""
              loading="lazy"
              decoding="async"
              onError={e => { if (!poster && !fallback && permitted && source.provider === "youtube") setFallback(true); else if (!poster && e.currentTarget.getAttribute("src") !== localPoster) e.currentTarget.src=localPoster; }}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.015]"
            />
          )}
          {showTitle && (
            <span className="absolute inset-0 bg-gradient-to-t from-[#1B2A4A]/70 via-transparent to-transparent" />
          )}
          {playPosition === "corner" ? (
            <span
              className={
                prominent
                  ? "absolute left-[4.3%] bottom-[4%] sm:bottom-[5%] inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-[#8B1A1A] px-3 py-1 text-xs md:px-6 md:py-3 md:text-base font-medium text-white shadow-lg group-hover:scale-105 transition-transform duration-200"
                  : "absolute left-[4.3%] bottom-[4%] inline-flex items-center gap-1.5 rounded-full bg-[#8B1A1A] px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white shadow-md group-hover:scale-105 transition-transform duration-200"
              }
            >
              <Play
                size={14}
                fill="currentColor"
                aria-hidden="true"
                className={prominent ? "md:h-[18px] md:w-[18px]" : undefined}
              />
              {t("Play video")}
            </span>
          ) : (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#8B1A1A] text-white shadow-md group-hover:scale-105 transition-transform duration-200">
                <Play size={25} fill="currentColor" className="ml-1" />
              </span>
            </span>
          )}
          {!permitted && <span className="absolute top-3 right-3 bg-[#1B2A4A]/90 text-white text-xs px-2 py-1">{enabled ? (language === "zh" ? "需同意外部视频" : "Video consent required") : (zh ? `在 ${providerLabel(source.provider,zh)} 观看` : `Watch on ${providerLabel(source.provider,zh)}`)}</span>}
          {showTitle && (
            <span className="absolute bottom-4 left-5 right-5 text-left text-sm text-white leading-relaxed">
              {t(title)}
            </span>
          )}
        </button>
      )}
    </div>
    {alternatives.length > 1 && <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-white text-[#1B2A4A] border-b border-[#E2E8F0] text-xs" role="group" aria-label={zh ? "视频来源" : "Video source"}>
      <span className="text-[#64748B]">{zh ? "来源" : "Source"}</span>
      {alternatives.map((item,index) => <button key={index} type="button" aria-pressed={source === item} className={`px-2.5 py-1 border rounded-sm ${source === item ? "bg-[#1B2A4A] text-white" : "border-[#E2E8F0] hover:bg-[#EEF1F5]"}`} onClick={() => {setSelection(index);setLoaded(false);setFallback(false);}}>{providerLabel(item.provider,zh)}{!enabledSource(item) ? (zh ? "（外链）" : " (external)") : ""}</button>)}
    </div>}
    {loaded && source.provider !== "local" && <div className="px-3 py-1 text-xs bg-white text-[#8B1A1A]"><a href={sourceUrl(source,start)} target="_blank" rel="noopener noreferrer" className="hover:underline">{zh ? `在 ${providerLabel(source.provider,zh)} 打开` : `Open on ${providerLabel(source.provider,zh)}`}</a></div>}
    </div>
  );
}
