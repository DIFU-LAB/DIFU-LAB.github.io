import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowUpRight } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";
import {
  surreyCollaborators,
  collaboratingGroups,
  type AcademicCollaborator,
} from "@/lib/collaborations";

const linkStyle =
  "inline-flex items-baseline gap-1.5 text-[#1B2A4A] hover:text-[#8B1A1A] underline decoration-[#CBD5E1] underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8B1A1A]";

function CollaboratorList({ people }: { people: AcademicCollaborator[] }) {
  const { t } = useTranslation();
  const { language, c } = useLanguage();

  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 lg:gap-x-16">
      {people.map((person, index) => (
        <li key={person.id} data-academic-collaborator={person.id}>
          <ScrollReveal direction="up" delay={(index % 2) * 60} duration={600}>
            <div className="h-full py-6 border-t border-[#E2E8F0]">
              <h3 className="text-2xl text-[#1B2A4A] leading-tight mb-2">
                <a
                  href={person.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkStyle}
                  aria-label={`${t("Official profile of")} ${person.name}`}
                >
                  <span>{person.name}</span>
                  <ArrowUpRight
                    size={15}
                    className="shrink-0"
                    aria-hidden="true"
                  />
                </a>
              </h3>
              <p className="text-sm text-[#8B1A1A] font-medium leading-relaxed mb-3">
                {c(person, "title")}
              </p>
              <dl className="text-sm text-[#4A5568] leading-relaxed space-y-2">
                <div>
                  <dt className="sr-only">{t("Research expertise")}</dt>
                  <dd className="inline">{c(person, "specialism")}</dd>
                </div>
                <div>
                  <dt className="sr-only">{t("Affiliation")}</dt>
                  <dd>
                    {person.researchCentre && (
                      <span>
                        {c(person, "researchCentre")}
                        <br />
                      </span>
                    )}
                    {person.department && (
                      <span>
                        {c(person, "department")}
                        <br />
                      </span>
                    )}
                    <span>{c(person, "institution")}</span>
                  </dd>
                </div>
              </dl>
            </div>
          </ScrollReveal>
        </li>
      ))}
    </ul>
  );
}

export default function Collaborations() {
  const { t } = useTranslation();
  const { language, c } = useLanguage();

  return (
    <div className="mt-16 lg:mt-20 space-y-16 lg:space-y-20">
      <section
        id="surrey-collaborators"
        aria-labelledby="surrey-collaborators-heading"
        className="scroll-mt-32"
      >
        <ScrollReveal direction="up" duration={600}>
          <div className="flex items-center gap-4 mb-4">
            <h2
              id="surrey-collaborators-heading"
              className="text-3xl lg:text-4xl text-[#1B2A4A]"
            >
              {t("Surrey Collaborators")}
            </h2>
            <div className="h-px bg-[#E2E8F0] flex-1" />
          </div>
        </ScrollReveal>
        <CollaboratorList people={surreyCollaborators} />
      </section>

      <section
        id="international-collaborators"
        aria-labelledby="international-collaborators-heading"
        className="scroll-mt-32"
      >
        <ScrollReveal direction="up" duration={600}>
          <div className="flex items-center gap-4 mb-7">
            <h2
              id="international-collaborators-heading"
              className="text-3xl lg:text-4xl text-[#1B2A4A]"
            >
              {t("International Collaborators")}
            </h2>
            <div className="h-px bg-[#E2E8F0] flex-1" />
          </div>
          <ul className="list-disc pl-5 space-y-5 marker:text-[#8B1A1A] max-w-4xl text-base text-[#4A5568] leading-relaxed">
            {collaboratingGroups.map(group => (
              <li
                key={group.id}
                data-collaborating-group={group.id}
                className="pl-1"
              >
                {group.url ? (
                  <a
                    href={group.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkStyle}
                  >
                    <span>{group.name}</span>
                    <ArrowUpRight
                      size={14}
                      className="shrink-0"
                      aria-hidden="true"
                    />
                  </a>
                ) : (
                  <span className="text-[#1B2A4A]">{group.name}</span>
                )}
                {group.lead && <span> ({group.lead})</span>}
                {group.institution && <span>, {c(group, "institution")}</span>}
              </li>
            ))}
          </ul>
        </ScrollReveal>
      </section>
    </div>
  );
}
