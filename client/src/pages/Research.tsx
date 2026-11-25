import { researchAreas, researchHighlights } from "@/lib/data";
import { useLanguage } from "@/contexts/LanguageContext";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ResearchFramework, pillarIcons } from "@/components/ResearchFramework";
import { getVideoSources, sourceUrl, providerLabel } from "@/lib/videoSources";
import { ResearchVideo } from "@/components/ResearchVideo";
import { FindingMedia } from "@/components/FindingMedia";
import { ResearchFigure } from "@/components/ResearchFigure";
import { ResearchLoopVideo } from "@/components/ResearchLoopVideo";
import { researchFramework } from "@/lib/researchFramework";
import { researchImagery, type ResearchImage } from "@/lib/researchImagery";
import { cn } from "@/lib/utils";
import { ArrowUpRight, FileText, Play } from "lucide-react";
import { useRef, useState } from "react";
import { ExtraVideos } from "@/components/ExtraVideos";

type PillarId = (typeof researchFramework.pillars)[number]["id"];

// Real study imagery placed with the stage it documents.
const stageFigures: Record<PillarId, ResearchImage[]> = {
  "human-social-cognition": [
    researchImagery.humanAttention,
    researchImagery.neuroUnfairness,
  ],
  "human-inspired-modelling": [
    researchImagery.crossmodalModel,
    researchImagery.hriPipeline,
  ],
  "robotic-simulation-interaction": [
    researchImagery.collaboration,
    researchImagery.hriFree,
  ],
};

const paperLinkClass =
  "group inline-flex items-start gap-2 text-sm leading-snug text-[#1B2A4A] hover:text-[#8B1A1A] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8B1A1A]";

// IROS 2025 keynote cover: the original Di Fu + iCub photograph (3300x2475),
// only cropped and downsampled (no upscaling, no compositing); text is live HTML.
const keynoteCdn =
  "/media/research/keynote";
const keynotePhoto = {
  // Wider 3000x2375 crop shown at 88% of the cover height, edges feathered into navy.
  framed: [800, 1200, 1600, 2000, 2400]
    .map(w => `${keynoteCdn}/keynote-framed-${w}-c7e19a42.webp ${w}w`)
    .join(", "),
  wide: [720, 1080, 1600]
    .map(w => `${keynoteCdn}/keynote-wide-${w}-8d52f3b1.webp ${w}w`)
    .join(", "),
  fallback: `${keynoteCdn}/keynote-wide-1080-8d52f3b1.webp`,
};
// Soft navy surround: the photo fades out on every side (wide fade on the title side).
const keynoteFeather =
  "linear-gradient(to right, transparent 0%, #000 40%, #000 90%, transparent 100%), linear-gradient(to bottom, transparent 0%, #000 13%, #000 89%, transparent 100%)";
const keynoteFeatherStyle = {
  WebkitMaskImage: keynoteFeather,
  maskImage: keynoteFeather,
  WebkitMaskComposite: "source-in",
  maskComposite: "intersect",
} as const;
function KeynoteCover() {
  const { t } = useLanguage();
  return (
    <span className="@container absolute inset-0 block overflow-hidden bg-[#1B2A4A] md:bg-[linear-gradient(100deg,#132039_0%,#1B2A4A_46%,#24395F_100%)] text-left">
      {/* Tablet and desktop: smaller photograph feathered into the navy gradient. */}
      <span
        className="hidden md:block absolute top-[5%] right-[2%] h-[88%] aspect-[3000/2375]"
        style={keynoteFeatherStyle}
        aria-hidden="true"
      >
        <img
          src={`${keynoteCdn}/keynote-framed-1600-c7e19a42.webp`}
          srcSet={keynotePhoto.framed}
          sizes="(min-width: 1280px) 720px, 63vw"
          width={3000}
          height={2375}
          alt=""
          loading="lazy"
          decoding="async"
          className="block h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
      </span>
      {/* Phone: full-bleed 16:9 crop of the same photograph. */}
      <img
        src={keynotePhoto.fallback}
        srcSet={keynotePhoto.wide}
        sizes="calc(100vw - 48px)"
        width={3300}
        height={1856}
        alt=""
        loading="lazy"
        decoding="async"
        className="md:hidden absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
      />
      {/* Phone: the real photograph with a small label; the heading above names the talk. */}
      <span
        className="md:hidden absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-[#1B2A4A]/75 to-transparent"
        aria-hidden="true"
      />
      <span className="md:hidden absolute left-[4.3%] top-[6%] text-[10px] sm:text-xs tracking-[0.2em] uppercase font-semibold text-white">
        {t("IEEE IROS 2025 · Hangzhou")}
      </span>
      {/* Tablet and desktop: navy title panel beside the photograph. */}
      <span className="hidden md:flex absolute inset-y-0 left-0 w-[42%] flex-col justify-center pl-[4.3cqw] pr-[3cqw] pb-[7cqw]">
        <span
          className="block h-[3px] w-[4.5cqw] bg-[#C0473F]"
          aria-hidden="true"
        />
        <span className="mt-[2.4cqw] text-[clamp(11px,1.2cqw,14px)] tracking-[0.2em] uppercase font-semibold text-white/75">
          {t("IEEE IROS 2025 · Hangzhou")}
        </span>
        <span
          lang="en"
          className="mt-[1.8cqw] font-heading !font-normal !tracking-normal !leading-[1.14] text-[3.25cqw] text-white"
        >
          <span className="block whitespace-nowrap">Embodied AI in</span>
          <span className="block whitespace-nowrap">
            Multimodal Human-Robot
          </span>
          <span className="block whitespace-nowrap">Social Interaction</span>
        </span>
        <span className="mt-[2cqw] text-[clamp(14px,1.7cqw,20px)] text-[#CBD5E1]">
          {t("Workshop Keynote")}
        </span>
        <span className="mt-[3.2cqw] text-[clamp(12px,1.45cqw,17px)] text-white/85">
          {t("Di Fu, Ph.D. · University of Surrey")}
        </span>
      </span>
    </span>
  );
}

// Original iCub crossmodal attention footage (IJSR 2023), silent 1080p/720p loops.
import keynote from "@content/research/keynote.json";
const icubDemoSources = keynote.demoSources;
const keynoteChapters = keynote.chapters;

// IROS 2025 keynote: a full-width feature directly below the research framework.
function KeynoteTalk() {
  const { t } = useLanguage();
  const playerRef = useRef<HTMLDivElement>(null);
  const [chapter, setChapter] = useState<{ start: number; key: number }>({
    start: 0,
    key: 0,
  });
  const playChapter = (start: number) => {
    setChapter(current => ({ start, key: current.key + 1 }));
    const player = playerRef.current;
    if (!player) return;
    const rect = player.getBoundingClientRect();
    if (rect.top < 80 || rect.bottom > window.innerHeight) {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      player.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "center",
      });
    }
  };
  return (
    <section
      id="talks"
      aria-labelledby="talks-heading"
      className="scroll-mt-20 mt-20 lg:mt-28 bg-[#1B2A4A] text-white py-16 lg:py-24"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-16">
        <ScrollReveal direction="up" duration={600}>
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] gap-6 lg:gap-16 items-end mb-10 lg:mb-12">
            <div>
              <p className="flex items-center gap-3 text-xs tracking-[0.2em] uppercase font-semibold text-white/80">
                <span className="h-[3px] w-8 bg-[#C0473F]" aria-hidden="true" />
                {t("Keynote")}
              </p>
              <h2
                id="talks-heading"
                className="mt-5 text-4xl sm:text-5xl lg:text-6xl text-white leading-[1.08] break-keep"
              >
                {t("IROS 2025 Workshop Keynote")}
              </h2>
            </div>
            <div className="lg:pb-2">
              <p className="text-base lg:text-lg leading-relaxed text-[#CBD5E1]">
                {t(
                  "Dr Di Fu's keynote at the IEEE IROS 2025 workshop on Embodied AI and Robotics for Future Scientific Discovery in Hangzhou."
                )}
              </p>
              <a
                href="https://www.youtube.com/@difulab"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-white/85 hover:text-white underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                {t("Visit our YouTube channel")}{" "}
                <ArrowUpRight size={15} aria-hidden="true" />
              </a>
            </div>
          </div>
        </ScrollReveal>
        <ScrollReveal direction="up" delay={80} duration={600}>
          <div
            ref={playerRef}
            className="rounded-sm shadow-[0_24px_60px_-20px_rgba(0,0,0,0.55)] ring-1 ring-white/10"
          >
            <ResearchVideo
              playbackRequest={chapter.key}
              sources={keynote.sources}
              cover={<KeynoteCover />}
              showTitle={false}
              playPosition="corner"
              prominent
              start={chapter.start}
              autoLoad={chapter.key > 0}
              title={t("IEEE IROS 2025 Hangzhou workshop keynote by Dr Di Fu")}
            />
          </div>
        </ScrollReveal>
        <ScrollReveal direction="up" delay={120} duration={600}>
          <div className="mt-10 lg:mt-12">
            <p className="text-xs tracking-[0.2em] uppercase font-semibold text-white/60 mb-4">
              {t("Chapters")}
            </p>
            <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-2">
              {keynoteChapters.map(item => {
                const active = chapter.key > 0 && chapter.start === item.start;
                return (
                  <li key={item.start}>
                    <button
                      type="button"
                      onClick={() => playChapter(item.start)}
                      aria-label={`${t("Play from")} ${item.time}: ${t(item.title)}`}
                      aria-current={active ? "true" : undefined}
                      className={cn(
                        "group flex w-full h-full flex-col items-start justify-start text-left border-t-2 pt-4 pb-3 transition-colors duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white",
                        active
                          ? "border-[#C0473F]"
                          : "border-white/20 hover:border-white/70"
                      )}
                    >
                      <span className="flex items-center gap-2 text-sm font-semibold tabular-nums text-white/70">
                        <Play
                          size={12}
                          fill="currentColor"
                          aria-hidden="true"
                          className="text-[#E07A72]"
                        />
                        {item.time}
                      </span>
                      <span className="mt-2 block text-base leading-snug text-white group-hover:underline underline-offset-4 decoration-white/40">
                        {t(item.title)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

export default function Research() {
  const { t, language } = useLanguage();
  const zh = language === "zh";

  return (
    <div
      lang={zh ? "zh-CN" : "en"}
      className="min-h-screen bg-white pt-32 pb-20 lg:pb-24"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-16">
        {/* ===== Header: one-sentence thesis + real research image ===== */}
        <header className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-14 items-center mb-14 lg:mb-20">
          <ScrollReveal direction="up" duration={600}>
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-[#8B1A1A]" />
                <p className="text-xs tracking-[0.2em] uppercase text-[#8B1A1A] font-medium">
                  {t("Research")}
                </p>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl text-[#1B2A4A] leading-[1.1]">
                {t(researchFramework.title)}
              </h1>
              <p className="text-lg text-[#4A5568] leading-relaxed max-w-xl">
                {t(researchFramework.introduction)}
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal direction="right" delay={80} duration={600}>
            <ResearchLoopVideo
              id={researchImagery.icubAttention.id}
              title={researchImagery.icubAttention.title}
              caption={researchImagery.icubAttention.caption}
              poster={researchImagery.icubAttention.src}
              paperUrl={researchImagery.icubAttention.paperUrl}
              demoUrl={sourceUrl(getVideoSources(researchHighlights.find(work=>work.id==="crossmodal-attention") ?? {})[0] ?? {provider:"local",src:icubDemoSources[0].src})}
              sources={icubDemoSources}
              className="w-full"
            />
          </ScrollReveal>
        </header>

        {/* ===== The reciprocal loop (also a map of this page) ===== */}
        <ResearchFramework />
      </div>

      {/* ===== IROS 2025 keynote: full-width feature below the framework ===== */}
      <KeynoteTalk />

      <div className="max-w-7xl mx-auto px-6 lg:px-16">
        {/* ===== Three stages, each with its research themes ===== */}
        <div id="research-directions" className="scroll-mt-32">
          {researchFramework.pillars.map((pillar, stageIndex) => {
            const Icon = pillarIcons[pillar.id];
            const reversed = stageIndex % 2 === 1;
            const themes = researchAreas.filter(area =>
              (pillar.themeIds as readonly string[]).includes(area.id)
            );
            return (
              <section
                key={pillar.id}
                id={pillar.id}
                aria-labelledby={`${pillar.id}-heading`}
                className={cn(
                  "scroll-mt-28",
                  stageIndex === 0
                    ? "pt-16 lg:pt-24"
                    : "mt-16 lg:mt-24 pt-14 lg:pt-20 border-t border-[#E2E8F0]"
                )}
              >
                <ScrollReveal direction="up" duration={600}>
                  <div className="max-w-3xl mb-10 lg:mb-14">
                    <p className="flex items-center gap-3 text-sm font-semibold tracking-[0.15em] text-[#8B1A1A]">
                      <Icon
                        size={26}
                        strokeWidth={1.5}
                        aria-hidden="true"
                        focusable="false"
                      />
                      {pillar.number}
                    </p>
                    <h2
                      id={`${pillar.id}-heading`}
                      className="mt-4 text-3xl lg:text-5xl text-[#1B2A4A] leading-tight"
                    >
                      {t(pillar.title)}
                    </h2>
                    <p className="mt-5 text-lg text-[#4A5568] leading-relaxed">
                      {t(pillar.description)}
                    </p>
                  </div>
                </ScrollReveal>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
                  <div className={cn("space-y-12", reversed && "lg:order-2")}>
                    {themes.map(area => (
                      <ScrollReveal key={area.id} direction="up" duration={600}>
                        <article
                          id={area.id}
                          aria-labelledby={`${area.id}-heading`}
                          className="scroll-mt-28"
                        >
                          <h3
                            id={`${area.id}-heading`}
                            className="text-2xl lg:text-3xl text-[#1B2A4A] leading-tight"
                          >
                            {t(area.title)}
                          </h3>
                          <p
                            className={cn(
                              "mt-3 text-base lg:text-lg text-[#64748B] leading-relaxed",
                              !zh && "italic"
                            )}
                          >
                            {t(area.question)}
                          </p>
                          <p className="mt-4 text-base text-[#4A5568] leading-relaxed">
                            {t(area.description)}
                          </p>
                          <div className="mt-6 border-l-2 border-[#8B1A1A]/30 pl-4">
                            <p className="text-[11px] uppercase tracking-[0.15em] font-semibold text-[#64748B] mb-3">
                              {t("Key papers")}
                            </p>
                            <ul className="space-y-3">
                              {area.evidence.map(work => (
                                <li key={work.url}>
                                  <a
                                    href={work.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={paperLinkClass}
                                  >
                                    <span>
                                      {work.title}
                                      <span className="block text-xs text-[#64748B] mt-1">
                                        {t(work.label)}
                                      </span>
                                    </span>
                                    <ArrowUpRight
                                      size={14}
                                      aria-hidden="true"
                                      className="mt-0.5 shrink-0"
                                    />
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </article>
                      </ScrollReveal>
                    ))}
                  </div>
                  <div className={cn("space-y-10", reversed && "lg:order-1")}>
                    {stageFigures[pillar.id].map(image => (
                      <ScrollReveal
                        key={image.id}
                        direction={reversed ? "left" : "right"}
                        delay={80}
                        duration={600}
                      >
                        <ResearchFigure image={image} className="w-full" />
                      </ScrollReveal>
                    ))}
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        {/* ===== Key findings ===== */}
        <section
          id="selected-research"
          aria-labelledby="selected-research-heading"
          className="mt-20 lg:mt-28 pt-14 lg:pt-20 border-t border-[#E2E8F0] scroll-mt-28"
        >
          <ScrollReveal direction="up" duration={600}>
            <h2
              id="selected-research-heading"
              className="text-3xl lg:text-5xl text-[#1B2A4A] mb-10"
            >
              {t("Key findings")}
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {researchHighlights.map((work, index) => (
              <ScrollReveal
                key={work.id}
                direction="up"
                delay={(index % 2) * 60}
                duration={600}
              >
                <article className="h-full flex flex-col border border-[#E2E8F0] bg-white rounded-sm overflow-hidden">
                  <FindingMedia
                    title={work.title}
                    videoId={work.videoId}
                    sources={work.sources}
                    poster={work.poster}
                    newsUrl={work.newsUrl}
                    newsImage={work.newsImage}
                  />
                  <div className="flex flex-1 flex-col p-7 lg:p-8">
                    <p className="text-xs text-[#8B1A1A] font-medium mb-4">
                      {work.venue}
                    </p>
                    <h3 className="text-2xl lg:text-3xl text-[#1B2A4A] leading-tight mb-4">
                      {t(work.title)}
                    </h3>
                    <p className="text-sm text-[#4A5568] leading-relaxed mb-6">
                      {t(work.description)}
                    </p>
                    <div className="mt-auto pt-4 border-t border-[#E2E8F0] flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#8B1A1A]">
                      <a
                        href={work.paperUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={work.paperTitle}
                        className="inline-flex items-center gap-1.5 hover:underline underline-offset-4"
                      >
                        <FileText size={14} aria-hidden="true" />{" "}
                        {t("Read paper")}
                      </a>
                      {getVideoSources(work).map(source => (
                        <a
                          key={sourceUrl(source)}
                          href={sourceUrl(source)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 hover:underline underline-offset-4"
                        >
                          <Play size={14} aria-hidden="true" />{" "}
                          {t(work.videoLabel || "Watch video")}{getVideoSources(work).length > 1 ? ` · ${providerLabel(source.provider,language === "zh")}` : ""}
                        </a>
                      ))}
                      {work.newsUrl && (
                        <a
                          href={work.newsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 hover:underline underline-offset-4"
                        >
                          {t("Surrey news")}{" "}
                          <ArrowUpRight size={14} aria-hidden="true" />
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </section>
        <ExtraVideos />
      </div>
    </div>
  );
}
