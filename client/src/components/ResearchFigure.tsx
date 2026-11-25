import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { ArrowUpRight, Expand } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ResearchImage } from "@/lib/researchImagery";
import { cn } from "@/lib/utils";

export function ResearchFigure({
  image,
  className,
  sizes = "(min-width: 1024px) 900px, calc(100vw - 48px)",
}: {
  image: ResearchImage;
  className?: string;
  sizes?: string;
}) {
  const { t, language } = useLanguage();

  const [failed, setFailed] = useState(false);
  return (
    <figure data-research-image={image.id} className={cn("min-w-0", className)}>
      <Dialog>
        <DialogTrigger asChild>
          <button
            type="button"
            aria-label={`${t("View full-size")}: ${t(image.title)}`}
            className="group block w-full text-left border border-[#E2E8F0] bg-white rounded-sm overflow-hidden cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8B1A1A]"
          >
            {failed ? (
              <div
                role="status"
                style={{ aspectRatio: `${image.width} / ${image.height}` }}
                className="flex items-center justify-center p-8 bg-[#F7F8FA] text-sm text-[#64748B]"
              >
                {t(
                  "Research image unavailable. The study description and paper remain available below."
                )}
              </div>
            ) : (
              <img
                src={image.src}
                srcSet={image.srcSet}
                sizes={sizes}
                alt={t(image.alt)}
                width={image.width}
                height={image.height}
                loading="lazy"
                decoding="async"
                onError={() => setFailed(true)}
                className="block w-full h-auto object-contain"
              />
            )}
            <span className="flex items-center justify-end gap-2 border-t border-[#E2E8F0] px-3 py-2 text-[11px] text-[#64748B] group-hover:text-[#8B1A1A] transition-colors duration-150">
              {t("View full image")}
              <Expand size={13} aria-hidden="true" />
            </span>
          </button>
        </DialogTrigger>
        <DialogContent
          className="w-[calc(100%-2rem)] sm:max-w-6xl max-h-[92svh] overflow-y-auto rounded-sm bg-white text-[#1B2A4A] p-5 sm:p-7 motion-reduce:animate-none"
          aria-describedby={`research-image-description-${image.id}`}
        >
          <DialogTitle className="font-heading text-2xl leading-tight pr-8">
            {t(image.title)}
          </DialogTitle>
          <img
            src={image.fullSrc}
            alt={t(image.alt)}
            width={image.width}
            height={image.height}
            className="block w-full h-auto max-h-[62svh] object-contain"
          />
          <DialogDescription
            id={`research-image-description-${image.id}`}
            className="text-sm text-[#4A5568] leading-relaxed"
          >
            {t(image.caption)}
          </DialogDescription>
          {image.credit && (
            <p className="text-xs text-[#64748B] leading-relaxed">
              {t(image.credit)}
            </p>
          )}
          <a
            href={image.fullSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-[#8B1A1A] hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8B1A1A]"
          >
            {t("Open high-resolution image")}{" "}
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </DialogContent>
      </Dialog>
      <figcaption className="pt-3 text-xs text-[#64748B] leading-relaxed">
        <p className="text-sm text-[#4A5568]">{t(image.caption)}</p>
        <div className="flex flex-wrap items-start gap-x-4 gap-y-2 mt-2">
          {image.credit && (
            <span className="flex-1 min-w-[180px]">{t(image.credit)}</span>
          )}
          <a
            href={image.paperUrl}
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
