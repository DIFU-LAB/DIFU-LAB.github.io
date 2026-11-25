import { ResponsiveImage } from "@/components/ResponsiveImage";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowUpRight, Newspaper } from "lucide-react";
import { getVideoSources, type VideoSource } from "@/lib/videoSources";
import { ResearchVideo } from "@/components/ResearchVideo";

export interface FindingNewsImage {
  src: string;
  srcSet: string;
  width: number;
  height: number;
  alt: string;
}

/**
 * Media box at the top of each Key findings card: plays the study video in
 * place, or opens the original news story from its real news image.
 */
export function FindingMedia({
  title,
  videoId,
  sources,
  poster,
  newsUrl,
  newsImage,
}: {
  title: string;
  videoId?: string;
  sources?: VideoSource[];
  poster?: string;
  newsUrl?: string;
  newsImage?: FindingNewsImage;
}) {
  const { t } = useTranslation();
  const { c } = useLanguage();

  if (getVideoSources({sources,videoId}).length) {
    return (
      <div data-finding-media="video">
        <ResearchVideo videoId={videoId} sources={sources} poster={poster ? {src:poster,width:1280,height:720} : undefined} title={title} showTitle={false} />
      </div>
    );
  }

  if (newsUrl && newsImage) {
    return (
      <a
        href={newsUrl}
        target="_blank"
        rel="noopener noreferrer"
        data-finding-media="news"
        aria-label={`${t("Surrey news")}: ${title}`}
        className="group relative block aspect-video w-full overflow-hidden rounded-sm bg-[#1B2A4A] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-[#8B1A1A]"
      >
        <ResponsiveImage
          src={newsImage.src}
          srcSet={newsImage.srcSet}
          sizes="(min-width: 768px) 560px, calc(100vw - 48px)"
          width={newsImage.width}
          height={newsImage.height}
          alt={c(newsImage, "alt")}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.015]"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-[#1B2A4A]/75 via-[#1B2A4A]/10 to-transparent" />
        <span className="absolute left-4 bottom-4 inline-flex items-center gap-2 rounded-sm bg-white/95 px-3 py-1.5 text-xs font-medium text-[#8B1A1A] shadow-sm">
          <Newspaper size={14} aria-hidden="true" />
          {t("Read news story")}
          <ArrowUpRight
            size={13}
            aria-hidden="true"
            className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </span>
      </a>
    );
  }

  return null;
}
