import { useLanguage } from "@/contexts/LanguageContext";
import { ScrollReveal } from "@/components/ScrollReveal";
import { WordWrapText } from "@/components/WordWrapText";

// Lab philosophy in Di Fu's words, set directly below the Hero and above the
// Lab Name: a red eyebrow, the lead sentence as a large serif statement and
// the supporting sentence in body grey.
export function HomePhilosophy() {
  const { t, language } = useLanguage();

  return (
    <section
      id="philosophy"
      aria-labelledby="philosophy-heading"
      className="pt-4 pb-12 lg:pt-6 lg:pb-14 bg-white"
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <ScrollReveal direction="up" duration={600}>
          <div className="max-w-4xl">
            <p className="text-xs uppercase tracking-[0.2em] text-[#8B1A1A] font-medium mb-4">
              {t("Our Philosophy")}
            </p>
            <h2
              id="philosophy-heading"
              className="font-heading text-3xl lg:text-5xl leading-tight text-balance text-[#1B2A4A]"
            >
              <WordWrapText
                language={language}
                text={t(
                  "Interaction is not merely where intelligence is expressed, but where it emerges and evolves."
                )}
              />
            </h2>
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-pretty text-[#4A5568]">
              <WordWrapText
                language={language}
                text={t(
                  "We bridge human cognition and embodied AI to understand how social intelligence takes shape through interaction."
                )}
              />
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
