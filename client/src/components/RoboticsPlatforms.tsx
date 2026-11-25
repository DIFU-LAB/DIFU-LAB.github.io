import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { roboticsPlatforms } from "@/lib/roboticsPlatforms";

export default function RoboticsPlatforms() {
  const { t, language } = useLanguage();

  const [failedImages, setFailedImages] = useState<Set<string>>(
    () => new Set()
  );

  return (
    <section
      id="robotics-platforms"
      aria-labelledby="robotics-platforms-heading"
      className="mt-16 lg:mt-20 scroll-mt-32"
    >
      <ScrollReveal direction="up" duration={600}>
        <div className="flex items-center gap-4 mb-5">
          <h2
            id="robotics-platforms-heading"
            className="text-3xl lg:text-4xl text-[#1B2A4A]"
          >
            {t("Robotics Platforms")}
          </h2>
          <span className="text-xs text-[#8B1A1A] border border-[#8B1A1A]/20 px-2 py-0.5 rounded-sm">
            {roboticsPlatforms.length}
          </span>
          <div className="h-px bg-[#E2E8F0] flex-1" />
        </div>
        <p className="text-base text-[#4A5568] leading-relaxed max-w-2xl mb-8">
          {t(
            "Meet our robotics platforms for exploring human-robot interaction and embodied intelligence."
          )}
        </p>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {roboticsPlatforms.map((platform, index) => (
          <ScrollReveal
            key={platform.id}
            direction="up"
            delay={index * 60}
            duration={600}
          >
            <article
              data-robotics-platform={platform.id}
              className="h-full flex flex-col p-6 lg:p-7 border border-[#E2E8F0] border-t-2 border-t-[#8B1A1A]/70 bg-white"
            >
              <h3 className="text-3xl text-[#1B2A4A] leading-tight mb-2 xl:min-h-20">
                {platform.name}
              </h3>
              <p className="text-xs text-[#8B1A1A] uppercase tracking-[0.08em] leading-relaxed min-h-10">
                {t(platform.type)}
              </p>
              <figure className="my-5">
                <div
                  data-robotics-image-frame
                  className="h-72 w-full flex items-center justify-center bg-white p-4"
                >
                  {failedImages.has(platform.id) ? (
                    <p className="text-sm text-[#64748B] text-center">
                      {platform.name} {t("product image unavailable.")}
                    </p>
                  ) : (
                    <img
                      src={platform.image.src}
                      alt={t(platform.image.alt)}
                      width={platform.image.width}
                      height={platform.image.height}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-contain"
                      onError={() =>
                        setFailedImages(images =>
                          new Set(images).add(platform.id)
                        )
                      }
                    />
                  )}
                </div>
                <figcaption className="mt-4 text-[11px] text-[#64748B] leading-relaxed">
                  {t("Image:")}
                  {t(platform.image.credit)}
                </figcaption>
              </figure>
              <p className="text-sm text-[#4A5568] leading-relaxed mb-6">
                {t(platform.description)}
              </p>
              <div className="mt-auto pt-4 border-t border-[#E2E8F0] flex flex-wrap gap-x-5 gap-y-2 text-sm">
                <a
                  href={platform.detailsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#8B1A1A] hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B1A1A]"
                  aria-label={`${t("Platform details for")} ${platform.name}`}
                >
                  {t("Platform details")}
                  <ArrowUpRight size={14} aria-hidden="true" />
                </a>
              </div>
            </article>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
