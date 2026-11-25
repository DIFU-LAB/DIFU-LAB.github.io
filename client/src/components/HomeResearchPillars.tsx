import { useLanguage } from "@/contexts/LanguageContext";
import {
  ArrowRight,
  Brain,
  CircuitBoard,
  BotMessageSquare,
  type LucideIcon,
} from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { HomeResearchFramework } from "@/components/HomeResearchFramework";
import { WordWrapText } from "@/components/WordWrapText";
import { researchFramework } from "@/lib/researchFramework";

const pillarIcons: Record<
  (typeof researchFramework.pillars)[number]["id"],
  LucideIcon
> = {
  "human-social-cognition": Brain,
  "human-inspired-modelling": CircuitBoard,
  "robotic-simulation-interaction": BotMessageSquare,
};

export function HomeResearchPillars() {
  const { t, language } = useLanguage();

  return (
    <section
      id="core-research-pillars"
      aria-labelledby="core-research-pillars-heading"
      className="py-20 lg:py-24 bg-[#F7F8FA] scroll-mt-32"
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <ScrollReveal direction="up" duration={600}>
          <div className="max-w-3xl mb-10 lg:mb-12">
            <h2
              id="core-research-pillars-heading"
              className="text-3xl lg:text-5xl text-[#1B2A4A] font-heading leading-tight"
            >
              {t("Three core research pillars")}
            </h2>
            <p className="mt-5 text-lg text-[#4A5568] leading-relaxed">
              {t(
                "Human evidence, computational models and interactive evaluation form a reciprocal research cycle, advancing our understanding of social cognition and cognition-inspired AI."
              )}
            </p>
          </div>

          <ol className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {researchFramework.pillars.map(pillar => {
              const PillarIcon = pillarIcons[pillar.id];
              return (
                <li
                  key={pillar.id}
                  className="border-t border-[#1B2A4A]/15 pt-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <PillarIcon
                      size={32}
                      strokeWidth={1.5}
                      aria-hidden="true"
                      focusable="false"
                      className="shrink-0 text-[#8B1A1A]"
                    />
                    <span
                      aria-hidden="true"
                      className="block text-sm tracking-[0.15em] text-[#8B1A1A] font-semibold"
                    >
                      {pillar.number}
                    </span>
                  </div>
                  <h3 className="text-2xl lg:text-3xl leading-tight text-[#1B2A4A] font-heading mb-4">
                    <WordWrapText language={language} text={t(pillar.title)} />
                  </h3>
                  <p className="text-base leading-relaxed text-[#4A5568]">
                    {t(pillar.homeSummary)}
                  </p>
                </li>
              );
            })}
          </ol>
        </ScrollReveal>
        <HomeResearchFramework />
        <ScrollReveal direction="up" duration={600}>
          <a
            href="/research#research-framework"
            className="group inline-flex items-center gap-3 mt-10 lg:mt-12 rounded bg-[#8B1A1A] px-6 py-3.5 text-sm font-medium text-white hover:bg-[#6B1414] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8B1A1A] motion-safe:active:scale-[0.98]"
          >
            {t("Explore our research framework")}
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        </ScrollReveal>
      </div>
    </section>
  );
}
