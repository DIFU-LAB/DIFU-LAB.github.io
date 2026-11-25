import { ResponsiveImage } from "@/components/ResponsiveImage";
import React, { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

export interface HeroBackgroundProps {
  videoSrc: string;
  posterSrc: string;
  fallbackSrc: string;
}

export interface HeroMediaPreferences {
  reducedMotion?: boolean;
  saveData?: boolean;
  effectiveType?: string;
}

/** null/undefined means preferences have not been detected: do not fetch video. */
export function deriveHeroMotionPermission(
  preferences?: HeroMediaPreferences | null
): boolean {
  if (!preferences) return false;
  return (
    !preferences.reducedMotion &&
    !preferences.saveData &&
    preferences.effectiveType !== "slow-2g" &&
    preferences.effectiveType !== "2g"
  );
}

type NetworkConnection = Pick<
  HeroMediaPreferences,
  "saveData" | "effectiveType"
> &
  Partial<Pick<EventTarget, "addEventListener" | "removeEventListener">>;

/** Keyed by source and permission so a newly mounted video must earn readiness. */
function HeroMedia({
  videoSrc,
  posterSrc,
  fallbackSrc,
  motionAllowed,
  shouldPlay,
}: HeroBackgroundProps & { motionAllowed: boolean; shouldPlay: boolean }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !motionAllowed || failed) return;

    // Set the DOM default as well as the React muted prop, before calling play().
    video.defaultMuted = true;
    video.muted = true;
    video.volume = 0;

    if (!shouldPlay) {
      video.pause();
      return;
    }

    let active = true;
    let pending = false;
    const fail = () => {
      if (!active) return;
      video.pause();
      setReady(false);
      setFailed(true);
    };
    const playWhenReady = () => {
      // HAVE_FUTURE_DATA: never reveal the poster or an unplayable video.
      if (!active || pending || video.readyState < 3) return;
      pending = true;
      try {
        Promise.resolve(video.play()).then(
          () => {
            pending = false;
            if (active && !video.paused) setReady(true);
          },
          () => {
            pending = false;
            fail();
          }
        );
      } catch {
        pending = false;
        fail();
      }
    };

    video.addEventListener("canplay", playWhenReady);
    playWhenReady();
    return () => {
      // Ignore play() rejections caused by our own pause/unmount, keeping any
      // already-ready frame when hidden, offscreen, or explicitly paused.
      active = false;
      video.removeEventListener("canplay", playWhenReady);
      video.pause();
    };
  }, [motionAllowed, shouldPlay, failed]);

  const breathe = motionAllowed && shouldPlay && !ready;
  const transition = motionAllowed ? "opacity 250ms ease-out" : "none";

  return (
    <>
      {/* The original image stays mounted throughout loading and failures. */}
      <div
        className="absolute inset-0"
        style={{ opacity: ready ? 0 : 1, transition }}
      >
        <ResponsiveImage
          src={fallbackSrc} sizes="100vw" loading="eager" fetchPriority="high"
          alt=""
          draggable={false}
          className={`h-full w-full object-cover${breathe ? " hero-breathe" : ""}`}
          style={{
            opacity: 0.7,
            animation: breathe ? undefined : "none",
            transform: breathe ? undefined : "none",
          }}
        />
      </div>
      {motionAllowed && !failed && (
        <video
          ref={videoRef}
          src={videoSrc}
          poster={posterSrc}
          muted
          playsInline
          loop
          controls={false}
          disablePictureInPicture
          disableRemotePlayback
          preload="auto"
          tabIndex={-1}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: ready ? 0.7 : 0, transition }}
          onError={() => {
            videoRef.current?.pause();
            setReady(false);
            setFailed(true);
          }}
        />
      )}
    </>
  );
}

/** Place inside a positioned hero; the parent owns text-readability gradients. */
export function HeroBackground(props: HeroBackgroundProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [preferences, setPreferences] = useState<HeroMediaPreferences | null>(
    null
  );
  const [userPaused, setUserPaused] = useState(false);
  const [pageVisible, setPageVisible] = useState(false);
  const [inViewport, setInViewport] = useState(false);
  const motionAllowed = deriveHeroMotionPermission(preferences);
  const shouldPlay = motionAllowed && !userPaused && pageVisible && inViewport;

  useEffect(() => {
    const mediaQuery =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : undefined;
    const connection = (
      navigator as Navigator & { connection?: NetworkConnection }
    ).connection;
    const detectPreferences = () => {
      setPreferences({
        reducedMotion: mediaQuery?.matches ?? false,
        saveData: connection?.saveData ?? false,
        effectiveType: connection?.effectiveType,
      });
    };

    detectPreferences();
    if (mediaQuery?.addEventListener) {
      mediaQuery.addEventListener("change", detectPreferences);
    } else {
      mediaQuery?.addListener(detectPreferences);
    }
    connection?.addEventListener?.("change", detectPreferences);
    return () => {
      if (mediaQuery?.removeEventListener) {
        mediaQuery.removeEventListener("change", detectPreferences);
      } else {
        mediaQuery?.removeListener(detectPreferences);
      }
      connection?.removeEventListener?.("change", detectPreferences);
    };
  }, []);

  useEffect(() => {
    const updateVisibility = () => setPageVisible(!document.hidden);
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);

    const root = rootRef.current;
    let observer: IntersectionObserver | undefined;
    if (root) {
      const bounds = root.getBoundingClientRect();
      setInViewport(
        bounds.bottom > 0 &&
          bounds.top < window.innerHeight &&
          bounds.right > 0 &&
          bounds.left < window.innerWidth
      );
      if (typeof IntersectionObserver !== "undefined") {
        observer = new IntersectionObserver(
          ([entry]) => setInViewport(entry.isIntersecting),
          { threshold: 0 }
        );
        observer.observe(root);
      } else {
        // Legacy browsers cannot observe scrolling; still honor tab visibility.
        setInViewport(true);
      }
    }
    return () => {
      document.removeEventListener("visibilitychange", updateVisibility);
      observer?.disconnect();
    };
  }, []);

  const label = userPaused ? "Play animation" : "Pause animation";
  const Icon = userPaused ? Play : Pause;

  return (
    <>
      <div
        ref={rootRef}
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <HeroMedia
          key={`${props.videoSrc}:${motionAllowed}`}
          {...props}
          motionAllowed={motionAllowed}
          shouldPlay={shouldPlay}
        />
      </div>
      {/* A sibling, not aria-hidden or trapped beneath the parent's gradients. */}
      {motionAllowed && (
        <button
          type="button"
          onClick={() => setUserPaused(paused => !paused)}
          aria-label={label}
          className="absolute bottom-6 right-6 z-20 flex min-h-11 items-center gap-2 rounded-sm border border-[#1B2A4A]/15 bg-white/85 px-3 py-2 text-xs font-medium text-[#1B2A4A] shadow-sm backdrop-blur-sm hover:bg-white hover:text-[#8B1A1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B1A1A] focus-visible:ring-offset-2"
        >
          <Icon size={15} aria-hidden="true" />
          <span>{label}</span>
        </button>
      )}
    </>
  );
}

export default HeroBackground;
