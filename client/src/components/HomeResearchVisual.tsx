import { ResponsiveImage } from "@/components/ResponsiveImage";
import { useTranslation } from "react-i18next";
import { useLanguage, type Language } from "@/contexts/LanguageContext";
import { useEffect, useRef, useState, type ComponentType } from "react";
import { AudioLines, Captions, Play } from "lucide-react";
import { ResearchVideo } from "@/components/ResearchVideo";
import { getVideoSources, type VideoSource } from "@/lib/videoSources";
import { ScrollReveal } from "@/components/ScrollReveal";

// SEIL lab film (2:58), built from the lab's own experiment footage and paper
// figures. The picture carries no burned-in text: viewers choose the narration
// (English or Chinese, one MP4 each) and the subtitles (English, Chinese or
// off, one WebVTT file per narration and language) with the buttons under the
// frame. Subtitles are drawn by our own overlay, so the choice looks the same
// on phones and computers; in native fullscreen or picture-in-picture the same
// track is handed to the browser to display.
import { default as labFilm } from "@content/pages/home/film.json";
export { labFilm };
type Narration = Language;
type Subtitles = Language | "off";

const SUBTITLE_LANGUAGES: Language[] = ["en", "zh"];
const CAPTION_FONT =
  '"Source Sans 3", "SEIL Han Sans", "PingFang SC", "Microsoft YaHei", sans-serif';

function sourceFor(narration: Narration) {
  const wide =
    typeof window !== "undefined" &&
    window.matchMedia("(min-width: 768px)").matches;
  return wide ? labFilm.video[narration].hd : labFilm.video[narration].sd;
}

type VideoWithWebkit = HTMLVideoElement & { webkitPresentationMode?: string };

interface Choice<T extends string> {
  value: T;
  label: string;
  lang: string;
}

function ChoiceGroup<T extends string>({
  icon: Icon,
  label,
  options,
  value,
  onChange,
}: {
  icon: ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
  label: string;
  options: Choice<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex items-center gap-3">
      <span className="flex w-28 sm:w-auto items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#1B2A4A]/75">
        <Icon size={16} aria-hidden={true} />
        {label}
      </span>
      <span className="inline-flex overflow-hidden rounded-sm border border-[#1B2A4A]/25">
        {options.map(option => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              lang={option.lang}
              aria-pressed={active}
              onClick={() => onChange(option.value)}
              className={`min-h-9 px-3.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#8B1A1A] [&+button]:border-l [&+button]:border-[#1B2A4A]/25 ${
                active
                  ? "bg-[#1B2A4A] text-white"
                  : "bg-white text-[#1B2A4A] hover:bg-[#1B2A4A]/[0.06]"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </span>
    </div>
  );
}

export function HomeResearchVisual() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [alternativesOpen,setAlternativesOpen]=useState(false);
  const externalAlternatives=getVideoSources({sources:labFilm.alternatives as VideoSource[]});
  const [started, setStarted] = useState(false);
  const [narration, setNarration] = useState<Narration>(language);
  const [subtitles, setSubtitles] = useState<Subtitles>(language);
  const [caption, setCaption] = useState("");
  // true in native fullscreen or picture-in-picture, where our overlay is not
  // visible and the browser shows the selected track itself
  const [nativeCaptions, setNativeCaptions] = useState(false);
  const narrationChosen = useRef(false);
  const subtitlesChosen = useRef(false);
  const nativeRef = useRef(false);
  nativeRef.current = nativeCaptions;

  // Until the viewer picks, both choices follow the site language.
  useEffect(() => {
    if (!subtitlesChosen.current) setSubtitles(language);
    if (!narrationChosen.current && !started) setNarration(language);
  }, [language, started]);

  const start = () => {
    const video = videoRef.current;
    if (!video) return;
    video.src = sourceFor(narration);
    setStarted(true);
    video.play().catch(() => undefined);
  };

  const chooseNarration = (next: Narration) => {
    narrationChosen.current = true;
    if (next === narration) return;
    setNarration(next);
    const video = videoRef.current;
    if (!video || !started) return;
    // Swap to the other narration file at the same moment of the film.
    const time = video.ended ? 0 : video.currentTime;
    const wasPlaying = !video.paused && !video.ended;
    video.src = `${sourceFor(next)}#t=${time.toFixed(2)}`;
    video.addEventListener(
      "loadedmetadata",
      () => {
        if (Math.abs(video.currentTime - time) > 0.25) video.currentTime = time;
      },
      { once: true }
    );
    if (wasPlaying) video.play().catch(() => undefined);
  };

  const chooseSubtitles = (next: Subtitles) => {
    subtitlesChosen.current = true;
    setSubtitles(next);
  };

  // Track modes: the chosen track is "hidden" (drives our overlay) or
  // "showing" in native fullscreen / picture-in-picture; others "disabled".
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let active: TextTrack | null = null;
    for (const track of Array.from(video.textTracks)) {
      if (started && subtitles !== "off" && track.language === subtitles) {
        track.mode = nativeCaptions ? "showing" : "hidden";
        active = track;
      } else {
        track.mode = "disabled";
      }
    }
    const update = () => {
      const cues = active?.activeCues;
      setCaption(
        cues
          ? Array.from(cues)
              .map(cue => (cue as VTTCue).text)
              .join("\n")
          : ""
      );
    };
    update();
    const element = Array.from(video.querySelectorAll("track")).find(
      el => el.track === active
    );
    active?.addEventListener("cuechange", update);
    element?.addEventListener("load", update);
    return () => {
      active?.removeEventListener("cuechange", update);
      element?.removeEventListener("load", update);
    };
  }, [narration, subtitles, nativeCaptions, started]);

  // Keep our buttons in sync with the browser's own captions menu.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const tracks = video.textTracks;
    const onChange = () => {
      const list = Array.from(tracks);
      const showing = list.find(track => track.mode === "showing");
      if (showing && (!nativeRef.current || showing.language !== subtitles)) {
        if (showing.language === "en" || showing.language === "zh") {
          subtitlesChosen.current = true;
          setSubtitles(showing.language);
        }
      } else if (
        nativeRef.current &&
        list.length > 0 &&
        list.every(track => track.mode === "disabled")
      ) {
        subtitlesChosen.current = true;
        setSubtitles("off");
      }
    };
    tracks.addEventListener("change", onChange);
    return () => tracks.removeEventListener("change", onChange);
  }, [subtitles]);

  // Native fullscreen (standard, WebKit, iOS) and picture-in-picture.
  useEffect(() => {
    const video = videoRef.current as VideoWithWebkit | null;
    if (!video) return;
    const doc = document as Document & { webkitFullscreenElement?: Element };
    const sync = () =>
      setNativeCaptions(
        document.fullscreenElement === video ||
          doc.webkitFullscreenElement === video ||
          video.webkitPresentationMode === "fullscreen" ||
          video.webkitPresentationMode === "picture-in-picture" ||
          document.pictureInPictureElement === video
      );
    const on = () => setNativeCaptions(true);
    const off = () => setNativeCaptions(false);
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync);
    video.addEventListener("webkitpresentationmodechanged", sync);
    video.addEventListener("enterpictureinpicture", on);
    video.addEventListener("leavepictureinpicture", off);
    video.addEventListener("webkitbeginfullscreen", on);
    video.addEventListener("webkitendfullscreen", off);
    return () => {
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("webkitfullscreenchange", sync);
      video.removeEventListener("webkitpresentationmodechanged", sync);
      video.removeEventListener("enterpictureinpicture", on);
      video.removeEventListener("leavepictureinpicture", off);
      video.removeEventListener("webkitbeginfullscreen", on);
      video.removeEventListener("webkitendfullscreen", off);
    };
  }, []);

  // Pause when the film scrolls out of view.
  useEffect(() => {
    if (!started) return;
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && !nativeRef.current) video.pause();
      },
      { threshold: 0.2 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [started]);

  const narrationOptions: Choice<Narration>[] = [
    { value: "en", label: "English", lang: "en" },
    { value: "zh", label: "中文", lang: "zh-CN" },
  ];
  const subtitleOptions: Choice<Subtitles>[] = [
    { value: "en", label: "English", lang: "en" },
    { value: "zh", label: "中文", lang: "zh-CN" },
    { value: "off", label: t("Off"), lang: language === "zh" ? "zh-CN" : "en" },
  ];

  return (
    <section
      id="research-in-the-lab"
      aria-labelledby="research-in-the-lab-heading"
      className="py-16 lg:py-24 bg-white scroll-mt-32"
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <ScrollReveal direction="up" duration={600}>
          <div className="mb-8 lg:mb-10">
            <p className="text-xs uppercase tracking-[0.2em] text-[#8B1A1A] font-medium mb-4">
              {t("Inside our research")}
            </p>
            <h2
              id="research-in-the-lab-heading"
              className="font-heading text-3xl lg:text-5xl text-[#1B2A4A] leading-tight"
            >
              {t("Social intelligence, studied in real interaction.")}
            </h2>
          </div>
        </ScrollReveal>
        <ScrollReveal direction="up" delay={80} duration={600}>
          <figure className="m-0">
            <div
              id="lab-film"
              className="relative aspect-video overflow-hidden rounded-sm bg-[#1B2A4A]"
            >
              <video
                ref={videoRef}
                crossOrigin="anonymous"
                controls={started}
                tabIndex={started ? 0 : -1}
                playsInline
                preload={started ? "auto" : "none"}
                poster={started ? labFilm.poster : undefined}
                aria-label={t("SEIL lab film")}
                className="absolute inset-0 h-full w-full bg-[#1B2A4A] object-contain"
              >
                {SUBTITLE_LANGUAGES.map(lang => (
                  <track
                    key={`${narration}-${lang}`}
                    kind="subtitles"
                    srcLang={lang}
                    label={lang === "en" ? "English" : "中文"}
                    src={labFilm.captions[narration][lang]}
                  />
                ))}
              </video>
              {started && caption && !nativeCaptions ? (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-[14%] flex justify-center px-4"
                >
                  <p className="m-0 max-w-[88%] whitespace-pre-line text-center text-[13px] leading-[1.75] [text-wrap:balance] sm:text-base lg:text-xl">
                    <span
                      lang={subtitles === "zh" ? "zh-CN" : "en"}
                      style={{ fontFamily: CAPTION_FONT }}
                      className="box-decoration-clone rounded-sm bg-black/60 px-2 py-0.5 text-white lg:px-3 lg:py-1"
                    >
                      {caption}
                    </span>
                  </p>
                </div>
              ) : null}
              {started ? null : (
                <button
                  type="button"
                  onClick={start}
                  aria-label={`${t("Play video")}: ${t("SEIL lab film")}`}
                  className="group absolute inset-0 h-full w-full cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-[#8B1A1A]"
                >
                  <ResponsiveImage
                    src={labFilm.poster}
                    srcSet={labFilm.posterSrcSet}
                    sizes="(min-width: 1152px) 1088px, calc(100vw - 48px)"
                    alt=""
                    width={1920}
                    height={1080}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.015]"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-[#1B2A4A]/80 via-[#1B2A4A]/15 to-transparent"
                  />
                  <span className="absolute left-5 bottom-5 lg:left-8 lg:bottom-8 flex items-center gap-4 text-left text-white">
                    <span className="flex h-12 w-12 lg:h-16 lg:w-16 shrink-0 items-center justify-center rounded-full bg-[#8B1A1A] shadow-md transition-transform duration-200 group-hover:scale-105">
                      <Play
                        size={22}
                        fill="currentColor"
                        aria-hidden="true"
                        className="ml-1 lg:h-[26px] lg:w-[26px]"
                      />
                    </span>
                    <span className="flex flex-col gap-1">
                      <span className="font-heading text-xl lg:text-3xl leading-tight">
                        {t("Watch the lab film")}
                      </span>
                      <span className="text-xs lg:text-sm text-white/80 tracking-wide">
                        {labFilm.duration}
                      </span>
                    </span>
                  </span>
                </button>
              )}
            </div>
            <figcaption className="mt-4 flex flex-wrap items-center gap-x-10 gap-y-3">
              <ChoiceGroup
                icon={AudioLines}
                label={t("Narration")}
                options={narrationOptions}
                value={narration}
                onChange={chooseNarration}
              />
              <ChoiceGroup
                icon={Captions}
                label={t("Subtitles")}
                options={subtitleOptions}
                value={subtitles}
                onChange={chooseSubtitles}
              />
            </figcaption>
          </figure>
          {externalAlternatives.length > 0 && <details className="mt-5 text-sm text-[#1B2A4A]" onToggle={e=>{const open=e.currentTarget.open;setAlternativesOpen(open);if(open)videoRef.current?.pause();}}>
            <summary className="cursor-pointer text-[#8B1A1A]">{t("Alternative video sources")}</summary>
            {alternativesOpen && <div className="mt-3"><ResearchVideo sources={externalAlternatives} title={t("SEIL lab film")} poster={{src:labFilm.poster,srcSet:labFilm.posterSrcSet,width:1920,height:1080}} showTitle={false}/></div>}
          </details>}
        </ScrollReveal>
      </div>
    </section>
  );
}
