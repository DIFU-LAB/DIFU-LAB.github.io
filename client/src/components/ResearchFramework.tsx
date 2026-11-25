import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Brain,
  BotMessageSquare,
  CircuitBoard,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { researchAreas } from "@/lib/research";
import { researchFramework } from "@/lib/researchFramework";

type PillarId = (typeof researchFramework.pillars)[number]["id"];

// Same academic icons as the homepage pillar section.
export const pillarIcons: Record<PillarId, LucideIcon> = {
  "human-social-cognition": Brain,
  "human-inspired-modelling": CircuitBoard,
  "robotic-simulation-interaction": BotMessageSquare,
};

const themeLinkClass =
  "text-[#1B2A4A] underline underline-offset-4 decoration-[#1B2A4A]/25 hover:text-[#8B1A1A] hover:decoration-[#8B1A1A] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8B1A1A]";

// The loop: 01 -> 02 -> 03 -> back to 01. Stage cards are a map of the page;
// each theme links to its full description below.
export function ResearchFramework() {
  const { t } = useLanguage();
  const { pillars, connections } = researchFramework;
  const forward = connections.filter(
    connection => connection.to !== pillars[0].id
  );
  const feedback = connections.find(
    connection => connection.to === pillars[0].id
  )!;

  useEffect(() => {
    if (window.location.hash !== "#research-framework") return;
    const frame = window.requestAnimationFrame(() => {
      const section = document.getElementById("research-framework");
      section?.scrollIntoView({ block: "start", behavior: "instant" });
      section?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <ScrollReveal direction="up" duration={600}>
      <section
        id="research-framework"
        aria-label={t("Research framework")}
        aria-describedby="research-framework-description"
        tabIndex={-1}
        className="scroll-mt-32 focus:outline-none"
      >
        <figure>
          <ol className="relative grid grid-cols-1 lg:grid-cols-[1fr_10.5rem_1fr_10.5rem_1fr] items-stretch">
            {pillars.map((pillar, index) => {
              const Icon = pillarIcons[pillar.id];
              const next = forward[index];
              return (
                <li key={pillar.id} className="contents">
                  <div className="relative z-10 flex flex-col border-2 border-[#1B2A4A]/70 bg-white px-6 py-6 lg:px-7 lg:py-7">
                    <div className="flex items-center gap-3 mb-4">
                      <Icon
                        size={30}
                        strokeWidth={1.5}
                        aria-hidden="true"
                        focusable="false"
                        className="shrink-0 text-[#8B1A1A]"
                      />
                      <span
                        aria-hidden="true"
                        className="text-sm tracking-[0.15em] font-semibold text-[#8B1A1A]"
                      >
                        {pillar.number}
                      </span>
                    </div>
                    <a
                      href={`#${pillar.id}`}
                      className="font-heading text-2xl lg:text-[1.75rem] leading-tight text-[#1B2A4A] hover:text-[#8B1A1A] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8B1A1A]"
                    >
                      {t(pillar.shortTitle)}
                    </a>
                    <ul className="mt-4 space-y-2.5 text-base leading-snug">
                      {pillar.themeIds.map(themeId => {
                        const theme = researchAreas.find(
                          area => area.id === themeId
                        );
                        return theme ? (
                          <li key={themeId}>
                            <a href={`#${theme.id}`} className={themeLinkClass}>
                              {t(theme.title)}
                            </a>
                          </li>
                        ) : null;
                      })}
                    </ul>
                  </div>
                  {next && (
                    <div
                      aria-hidden="true"
                      className="flex lg:flex-col items-center justify-center gap-3 lg:gap-2 py-4 lg:py-0 lg:px-3 text-center"
                    >
                      <ArrowDown
                        size={20}
                        strokeWidth={2.25}
                        className="lg:hidden shrink-0 text-[#8B1A1A]"
                      />
                      <span className="text-sm lg:text-[0.9375rem] font-semibold leading-snug text-[#1B2A4A]">
                        {t(next.label)}
                      </span>
                      <ArrowRight
                        size={22}
                        strokeWidth={2.25}
                        className="hidden lg:block shrink-0 text-[#8B1A1A]"
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ol>

          {/* Feedback from stage 03 to stage 01 */}
          <div aria-hidden="true" className="relative hidden lg:block h-20">
            <div
              className="absolute top-5 h-9 border-x-2 border-b-2 border-[#8B1A1A]/80 rounded-b-md"
              style={{
                left: "calc((100% - 21rem) / 6)",
                right: "calc((100% - 21rem) / 6)",
              }}
            >
              <ArrowUp
                size={18}
                strokeWidth={2.25}
                className="absolute -top-[17px] -left-[10px] text-[#8B1A1A]"
              />
              <span className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-sm lg:text-[0.9375rem] font-semibold text-[#1B2A4A] whitespace-nowrap">
                {t(feedback.label)}
              </span>
            </div>
          </div>
          <div
            aria-hidden="true"
            className="lg:hidden flex items-center justify-center gap-3 pt-4 text-sm font-semibold text-[#1B2A4A]"
          >
            <Undo2 size={18} className="shrink-0 text-[#8B1A1A]" />
            <span>
              {t(feedback.label)} - {t("back to 01")}
            </span>
          </div>

          <div id="research-framework-description" className="sr-only">
            <p>{t("Three research stages form a reciprocal loop.")}</p>
            <ul>
              {connections.map(connection => {
                const from = pillars.find(
                  pillar => pillar.id === connection.from
                );
                const to = pillars.find(pillar => pillar.id === connection.to);
                return (
                  <li key={`${connection.from}-${connection.to}`}>
                    {t(from?.shortTitle ?? "")} {t("to")}{" "}
                    {t(to?.shortTitle ?? "")}: {t(connection.label)}.{" "}
                    {t(connection.description)}
                  </li>
                );
              })}
            </ul>
          </div>
          <figcaption className="mt-6 lg:mt-5 mx-auto max-w-3xl text-center text-base leading-relaxed text-[#4A5568]">
            {t(researchFramework.caption)}
          </figcaption>
        </figure>
      </section>
    </ScrollReveal>
  );
}
