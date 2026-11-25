import { ResponsiveImage } from "@/components/ResponsiveImage";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { newsItems as localNews } from "@/lib/news";
import { ArrowUpRight } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  getNewsDatePresentation,
  getNewsSource,
  getNewsYear,
  linkedinProfileUrl,
} from "@shared/news";

export default function News() {
  const { t } = useTranslation();
  const { language, c } = useLanguage();
  const linkedinNews = localNews;
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const years = Array.from(
    new Set(linkedinNews.map(item => getNewsYear(item.publishedAt)))
  ).sort((a, b) => b - a);
  const filtered =
    selectedYear === null
      ? linkedinNews
      : linkedinNews.filter(
          item => getNewsYear(item.publishedAt) === selectedYear
        );

  return (
    <div className="min-h-screen bg-white pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-16">
        <ScrollReveal direction="up" duration={600}>
          <header className="mb-12 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-[#8B1A1A]" />
              <p className="text-xs tracking-[0.2em] uppercase text-[#8B1A1A] font-medium">
                {t("News")}
              </p>
            </div>
            <h1 className="text-5xl lg:text-7xl text-[#1B2A4A]">
              {t("News & Events")}
            </h1>
            <a
              href={linkedinProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#8B1A1A] hover:underline underline-offset-4"
            >
              {t("Follow Di on LinkedIn")} <ArrowUpRight size={16} />
            </a>
          </header>
        </ScrollReveal>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 border-b border-[#E2E8F0] pb-6 mb-10">
          <div
            className="flex flex-wrap gap-2"
            aria-label={t("Filter news by year")}
          >
            {[null, ...years].map(year => (
              <button
                key={year ?? "all"}
                type="button"
                aria-pressed={selectedYear === year}
                onClick={() => setSelectedYear(year)}
                className={`px-4 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B1A1A] ${selectedYear === year ? "bg-[#8B1A1A] text-white" : "bg-[#F1F3F5] text-[#1B2A4A] hover:bg-[#E2E8F0]"}`}
              >
                {year ?? t("All years")}
              </button>
            ))}
          </div>
        </div>

        {linkedinNews.length === 0 && (
          <p className="py-16 text-[#4A5568]">
            {t("No updates have been added yet.")}
          </p>
        )}

        {(
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-12"
            aria-live="polite"
          >
            {filtered.map((item, index) => {
              const source = getNewsSource(item.linkedinUrl);
              const date = getNewsDatePresentation(
                item.publishedAt,
                item.linkedinUrl
              );
              const dateText =
                language === "zh"
                  ? new Intl.DateTimeFormat("zh-CN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      timeZone: "Europe/London",
                    }).format(
                      new Date(
                        source && source.sourceKind !== "linkedin"
                          ? `${source.dateValue}T12:00:00Z`
                          : item.publishedAt
                      )
                    )
                  : date.text;
              const sourceCta =
                source?.sourceKind === "university"
                  ? "Read university news"
                  : source?.sourceKind === "workshop"
                    ? "View workshop website"
                    : "Read original post";
              return (
                <ScrollReveal
                  key={item.id}
                  direction="up"
                  delay={Math.min(index * 50, 200)}
                  duration={500}
                >
                  <article className="h-full border-b border-[#E2E8F0] pb-8">
                    <a
                      href={source?.sourceUrl ?? item.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8B1A1A]"
                    >
                      {item.imageUrl && (
                        <div className="aspect-[16/10] bg-[#F1F3F5] overflow-hidden mb-6">
                          <ResponsiveImage
                            src={item.imageUrl} sizes="(min-width: 1280px) 560px, (min-width: 768px) 46vw, calc(100vw - 48px)"
                            alt={(c(item, "title"))}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                          />
                        </div>
                      )}
                      <div className="flex flex-wrap items-center justify-between gap-3 text-xs mb-4">
                        <span className="uppercase tracking-[0.12em] text-[#8B1A1A] font-medium">
                          {source ? c(source, "category") : t("News")}
                        </span>
                        <time
                          dateTime={date.dateTime}
                          className="text-[#64748B]"
                        >
                          {t(date.label)}: {dateText}
                        </time>
                      </div>
                      <h2 className="text-2xl lg:text-3xl text-[#1B2A4A] leading-tight group-hover:text-[#8B1A1A] transition-colors">
                        {(c(item, "title"))}
                      </h2>
                      <p className="text-sm text-[#4A5568] leading-relaxed mt-4">
                        {item.excerpt
                          ? (c(item, "excerpt"))
                          : c(item, "content").substring(0, 180)}
                      </p>
                      <span className="inline-flex items-center gap-2 text-sm text-[#8B1A1A] mt-5">
                        {t(sourceCta)} <ArrowUpRight size={14} />
                      </span>
                    </a>
                    {source?.sourceKind === "linkedin" &&
                      source.sourceAuthor &&
                      source.sourceAuthor !== "Di Fu" && (
                        <p className="text-xs text-[#64748B] mt-3">
                          {t("Original post by")} {source.sourceAuthor}.
                        </p>
                      )}
                    {(source?.sourceKind === "university" ||
                      source?.sourceKind === "workshop") && (
                      <p className="text-xs text-[#64748B] mt-3">
                        {t("Source:")} {c(source, "sourceName")}
                      </p>
                    )}
                  </article>
                </ScrollReveal>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
