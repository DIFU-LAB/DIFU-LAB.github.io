import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";
import { ScrollReveal } from "@/components/ScrollReveal";
import { sailMarkPaths, sailMarkViewBox } from "@/lib/sailMark";

// What the lab name means, as supplied by Di Fu: Seil (German, rope:
// connection and resilience) and its English echo Sail (to set sail:
// exploration and discovery).
const meanings = [
  {
    word: "Seil",
    lang: "de",
    origin: "German",
    meaning: "Rope",
    values: "Connection · Resilience",
  },
  {
    word: "Sail",
    lang: "en",
    origin: "English echo",
    meaning: "To set sail",
    values: "Exploration · Discovery",
  },
] as const;

// Calligraphic emblem from the approved logo: a navy sailboat (mainsail and
// jib: Sail, setting out) above an interwoven red and navy wave that reads
// as a twisted rope (Seil). Filled vector strokes; decorative only, the
// meaning is given in the text. A thin white halo separates the red strand
// where it crosses the navy one.
function SailRopeMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox={sailMarkViewBox}
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {sailMarkPaths.map(path =>
        path.halo ? (
          <g key={path.name}>
            <path
              d={path.d}
              fill="#fff"
              stroke="#fff"
              strokeWidth={2.2}
              strokeLinejoin="round"
            />
            <path d={path.d} fill={path.fill} />
          </g>
        ) : (
          <path key={path.name} d={path.d} fill={path.fill} />
        )
      )}
    </svg>
  );
}

export function HomeLabName() {
  const { t } = useTranslation();
  const { language } = useLanguage();

  return (
    <section
      id="lab-name"
      aria-labelledby="lab-name-heading"
      className="pb-12 lg:pb-16 bg-white"
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <ScrollReveal direction="up" duration={600}>
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] gap-8 lg:gap-16 items-center border-y border-[#1B2A4A]/15 py-10 lg:py-12">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#8B1A1A] font-medium mb-4">
                {t("Lab Name")}
              </p>
              {/* Same size as every other section heading (Research scale:
                  text-3xl lg:text-5xl); weight from the shared h2 rule. */}
              <div className="flex items-end gap-2.5 lg:gap-3">
                <h2
                  id="lab-name-heading"
                  className="font-heading text-3xl lg:text-5xl leading-none text-[#1B2A4A]"
                  // Same wordmark metrics in both languages (the Chinese
                  // heading rules would otherwise change line height and
                  // letter-spacing and shift the sail off the baseline).
                  style={{ lineHeight: 1, letterSpacing: "0.03em" }}
                >
                  SEIL
                </h2>
                <SailRopeMark className="h-[33px] lg:h-[52px] w-auto shrink-0" />
              </div>
            </div>
            <div>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10">
                {meanings.map(item => (
                  <div
                    key={item.word}
                    className="border-l-2 border-[#8B1A1A] pl-4"
                  >
                    <dt className="flex items-baseline gap-3">
                      <span
                        lang={item.lang}
                        className="font-heading italic text-2xl lg:text-3xl leading-tight text-[#1B2A4A]"
                      >
                        {item.word}
                      </span>
                      <span className="text-sm text-[#64748B]">
                        {t(item.origin)}
                      </span>
                    </dt>
                    <dd className="mt-1 text-base text-[#1B2A4A]/75">
                      {t(item.meaning)}
                    </dd>
                    <dd className="mt-1 text-base text-[#4A5568]">
                      {t(item.values)}
                    </dd>
                  </div>
                ))}
              </dl>
              <p
                className={`mt-8 lg:mt-10 font-heading text-2xl lg:text-3xl leading-snug text-balance text-[#1B2A4A] ${
                  language === "zh" ? "tracking-[0.06em]" : "italic"
                }`}
              >
                {t("The strength to connect. The freedom to explore.")}
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
