import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useLanguage } from "@/contexts/LanguageContext";
import PublicationCitation from "@/components/PublicationCitation";
import { getPublicationUrl } from "@/lib/publicationCitation";
import {
  publications,
  publicationYears,
  publishedWorks,
  preprints,
  posterWorks,
  type Publication,
} from "@/lib/publications";

type YearFilter = number | "all" | "undated";
type StatusFilter = "all" | "published" | "manuscripts" | "posters";

function getStatus(work: Publication) {
  return work.status ?? (work.type === "preprint" ? "preprint" : "published");
}

function PublicationEntry({ work }: { work: Publication }) {
  const { t, language } = useLanguage();
  const status = getStatus(work);
  const isPublished = status === "published";
  const paperUrl = getPublicationUrl(work);
  const typeLabel =
    work.kindLabel ??
    (work.type === "poster"
      ? "Conference poster"
      : work.type === "workshop"
        ? "Workshop paper"
        : work.type === "conference"
          ? "Conference paper"
          : work.type === "journal" && isPublished
            ? "Journal article"
            : status === "preprint"
              ? "Preprint"
              : "Manuscript");
  const statusLabel =
    status === "presented"
      ? "Presented"
      : status === "under-review"
        ? "Under review"
        : isPublished
          ? "Published"
          : "Preprint";
  const authors = work.authorNames.length ? work.authorNames : [work.authors];
  const needsEtAl =
    work.authorsComplete === false && !/\bet\s+al\.?/i.test(authors.join(", "));

  return (
    <article
      className="py-7 border-b border-[#E2E8F0]"
      lang={language === "zh" ? "zh-CN" : "en"}
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#8B1A1A] mb-3">
        {t(typeLabel)}
        {typeLabel !== statusLabel && <> · {t(statusLabel)}</>}
      </p>
      <h3 className="text-xl lg:text-2xl leading-snug text-[#1B2A4A]" lang="en">
        {paperUrl ? (
          <a
            href={paperUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#8B1A1A] transition-colors focus-visible:outline-2 focus-visible:outline-[#8B1A1A]"
          >
            {work.title}
          </a>
        ) : (
          work.title
        )}
      </h3>
      <p className="text-sm text-[#4A5568] leading-relaxed mt-3" lang="en">
        {authors.map((name, index) => (
          <span key={`${name}-${index}`}>
            {index > 0 && ", "}
            {name.split(/(\bDi\s*Fu\b)/gi).map((part, partIndex) =>
              /^Di\s*Fu$/i.test(part) ? (
                <strong
                  key={partIndex}
                  className="font-semibold text-[#1B2A4A]"
                >
                  {part}
                </strong>
              ) : (
                <span key={partIndex}>{part}</span>
              )
            )}
          </span>
        ))}
        {needsEtAl && `${authors.some(name => name.trim()) ? ", " : ""}et al.`}
      </p>
      {(isPublished || status === "presented") && work.journal && (
        <p
          className="text-sm text-[#64748B] leading-relaxed mt-2 italic"
          lang="en"
        >
          {work.journal}
          {work.year !== null ? ` · ${work.year}` : ""}
        </p>
      )}
      {!isPublished && status !== "presented" && (
        <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
          {status === "under-review"
            ? t("Under review; not counted as published.")
            : t("Preprint; not counted as published.")}
        </p>
      )}
      {work.notes && (
        <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
          {t(work.notes)}
        </p>
      )}
      <div
        className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-sm"
        data-publication-actions
      >
        {paperUrl && (
          <a
            href={paperUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[#8B1A1A] hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-[#8B1A1A]"
          >
            {isPublished || status === "presented"
              ? t("Read paper")
              : t("Read manuscript")}
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        )}
        <PublicationCitation work={work} />
      </div>
    </article>
  );
}

export default function Publications() {
  const { t, language } = useLanguage();
  const [selectedYear, setSelectedYear] = useState<YearFilter>("all");
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("all");
  const years = [...publicationYears].sort((a, b) => b - a);
  const hasUndatedWorks = publications.some(work => work.year === null);
  const filteredWorks = publications.filter(work => {
    const matchesYear =
      selectedYear === "all" ||
      (selectedYear === "undated"
        ? work.year === null
        : work.year === selectedYear);
    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "published"
        ? getStatus(work) === "published"
        : selectedStatus === "posters"
          ? getStatus(work) === "presented"
          : ["preprint", "under-review"].includes(getStatus(work)));
    return matchesYear && matchesStatus;
  });
  const groups = [
    ...years.map(year => ({
      key: String(year),
      label: String(year),
      works: filteredWorks.filter(work => work.year === year),
    })),
    {
      key: "undated",
      label: "Undated",
      works: filteredWorks.filter(work => work.year === null),
    },
  ].filter(group => group.works.length > 0);
  const statusFilters: {
    value: StatusFilter;
    label: string;
    count: number;
  }[] = [
    { value: "all", label: "All works", count: publications.length },
    { value: "published", label: "Published", count: publishedWorks.length },
    {
      value: "manuscripts",
      label: "Preprints",
      count: preprints.length,
    },
    {
      value: "posters",
      label: "Conference posters",
      count: posterWorks.length,
    },
  ];

  return (
    <div
      className="min-h-screen bg-white pt-32 pb-24"
      lang={language === "zh" ? "zh-CN" : "en"}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-16">
        <ScrollReveal direction="up" duration={600}>
          <header className="mb-12 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-[#8B1A1A]" />
              <p className="text-xs tracking-[0.2em] uppercase text-[#8B1A1A] font-medium">
                {t("Publications")}
              </p>
            </div>
            <h1 className="text-5xl lg:text-7xl text-[#1B2A4A]">
              {t("Publications")}
            </h1>
          </header>
        </ScrollReveal>

        <div className="mb-10 border-y border-[#E2E8F0] py-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div
              role="group"
              aria-label={t("Filter works by publication status")}
              className="flex flex-wrap gap-2"
            >
              {statusFilters.map(filter => (
                <button
                  key={filter.value}
                  type="button"
                  aria-pressed={selectedStatus === filter.value}
                  onClick={() => setSelectedStatus(filter.value)}
                  className={`px-4 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B1A1A] ${selectedStatus === filter.value ? "bg-[#8B1A1A] text-white" : "bg-[#F1F3F5] text-[#1B2A4A] hover:bg-[#E2E8F0]"}`}
                >
                  {t(filter.label)}
                  <span className="ml-2 tabular-nums opacity-80">
                    {filter.count}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <label
                htmlFor="publication-year"
                className="text-sm text-[#64748B]"
              >
                {t("Year")}
              </label>
              <select
                id="publication-year"
                value={selectedYear}
                onChange={event => {
                  const value = event.target.value;
                  setSelectedYear(
                    value === "all" || value === "undated"
                      ? value
                      : Number(value)
                  );
                }}
                className="bg-white border border-[#CBD5E1] text-[#1B2A4A] text-sm py-2 pl-3 pr-8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B1A1A]"
              >
                <option value="all">{t("All years")}</option>
                {years.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
                {hasUndatedWorks && (
                  <option value="undated">{t("Undated")}</option>
                )}
              </select>
            </div>
          </div>
          <p className="text-xs text-[#64748B]" role="status">
            {t("Showing")} {filteredWorks.length} {t("of")}{" "}
            {publications.length} {t("works")}
            {selectedYear !== "all" &&
              (selectedYear === "undated" ? (
                <> · {t("Year not established")}</>
              ) : (
                ` · ${selectedYear}`
              ))}
          </p>
        </div>

        <div className="space-y-12">
          {groups.map(group => (
            <section
              key={group.key}
              aria-labelledby={`publications-${group.key}`}
              className="grid lg:grid-cols-[130px_minmax(0,1fr)] gap-3 lg:gap-10"
            >
              <div className="pt-6">
                <h2
                  id={`publications-${group.key}`}
                  className="text-4xl text-[#1B2A4A]"
                >
                  {group.key === "undated" ? t("Undated") : group.label}
                </h2>
                <p className="text-xs text-[#64748B] mt-2">
                  {group.works.length}{" "}
                  {group.works.length === 1 ? t("work") : t("works")}
                </p>
                {group.key === "undated" && (
                  <p className="text-xs text-[#64748B] mt-3 leading-relaxed">
                    {t("Year not established in the checked sources.")}
                  </p>
                )}
              </div>
              <div>
                {group.works.map((work, index) => (
                  <ScrollReveal
                    key={work.id}
                    direction="up"
                    delay={Math.min(index * 35, 140)}
                    duration={450}
                  >
                    <PublicationEntry work={work} />
                  </ScrollReveal>
                ))}
              </div>
            </section>
          ))}
          {filteredWorks.length === 0 && (
            <div className="py-12 border-b border-[#E2E8F0]">
              <h2 className="text-2xl text-[#1B2A4A] mb-3">
                {t("No works match these filters")}
              </h2>
              <p className="text-sm text-[#64748B] leading-relaxed">
                {t("Try another year or publication status.")}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedYear("all");
                  setSelectedStatus("all");
                }}
                className="mt-5 text-sm text-[#8B1A1A] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-[#8B1A1A]"
              >
                {t("Reset filters")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
