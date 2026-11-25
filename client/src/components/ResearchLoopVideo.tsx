import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LoopVideoSource {
  src: string;
  /** Optional media query; the last source without one is the default. */
  media?: string;
}

// Silent, looping original experiment footage. It plays only while visible,
// never autoplays for reduced-motion users and can always be paused.
export function ResearchLoopVideo({
  id,
  title,
  caption,
  sources,
  poster,
  paperUrl,
  demoUrl,
  className,
}: {
  id: string;
  title: string;
  caption: string;
  sources: LoopVideoSource[];
  poster: string;
  paperUrl: string;
  demoUrl: string;
  className?: string;
}) {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const userPaused = useRef(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) userPaused.current = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !userPaused.current)
          video.play().catch(() => setPlaying(false));
        else if (!entry.isIntersecting) video.pause();
      },
      { threshold: 0.25 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      userPaused.current = false;
      video.play().catch(() => setPlaying(false));
    } else {
      userPaused.current = true;
      video.pause();
    }
  };

  return (
    <figure data-research-video={id} className={cn("min-w-0", className)}>
      <div className="relative aspect-video w-full overflow-hidden rounded-sm border border-[#E2E8F0] bg-[#1B2A4A]">
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="metadata"
          poster={poster}
          aria-label={t(title)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          className="block h-full w-full object-cover"
        >
          {sources.map(source => (
            <source
              key={source.src}
              src={source.src}
              type="video/mp4"
              media={source.media}
            />
          ))}
        </video>
        <button
          type="button"
          onClick={toggle}
          aria-label={t(playing ? "Pause video" : "Play video")}
          className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#1B2A4A]/75 text-white shadow-md backdrop-blur-sm transition-colors duration-200 hover:bg-[#8B1A1A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {playing ? (
            <Pause size={16} fill="currentColor" aria-hidden="true" />
          ) : (
            <Play
              size={16}
              fill="currentColor"
              aria-hidden="true"
              className="ml-0.5"
            />
          )}
        </button>
      </div>
      <figcaption className="pt-3 text-xs text-[#64748B] leading-relaxed">
        <p className="text-sm text-[#4A5568]">{t(caption)}</p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-2">
          <a
            href={demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[#8B1A1A] hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8B1A1A]"
          >
            <Play size={12} aria-hidden="true" />
            {t("Watch full demo")}
          </a>
          <a
            href={paperUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex shrink-0 items-center gap-1 text-[#8B1A1A] hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8B1A1A]"
          >
            {t("Related paper")}
            <ArrowUpRight size={12} aria-hidden="true" />
          </a>
        </div>
      </figcaption>
    </figure>
  );
}
