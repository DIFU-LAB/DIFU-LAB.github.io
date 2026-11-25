import { ResponsiveImage } from "@/components/ResponsiveImage";
import { useTranslation } from "react-i18next";
import { diProfile, labInfo, teamGroups } from "@/lib/data";
import { ArrowUpRight, Mail } from "lucide-react";
import { Link } from "wouter";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useState } from "react";
import RoboticsPlatforms from "@/components/RoboticsPlatforms";
import Collaborations from "@/components/Collaborations";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Team() {
  const { t } = useTranslation();
  const { language, c } = useLanguage();
  const [failedPhotos, setFailedPhotos] = useState<Set<string>>(
    () => new Set()
  );

  return (
    <div
      className="min-h-screen bg-white pt-32 pb-20 lg:pb-24"
      lang={language === "zh" ? "zh-CN" : "en"}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-16">
        <ScrollReveal direction="up" duration={600}>
          <div className="mb-14 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-[#8B1A1A]" />
              <p className="text-xs tracking-[0.2em] uppercase text-[#8B1A1A] font-medium">
                {t("Team")}
              </p>
            </div>
            <h1 className="text-5xl lg:text-7xl text-[#1B2A4A]">
              {t("Lab Members")}
            </h1>
            <p className="text-lg text-[#4A5568] max-w-2xl leading-relaxed">
              {t(
                "We bring together curious minds who are passionate about scientific discovery and interdisciplinary research at the intersection of cognitive science, artificial intelligence, and engineering."
              )}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up" duration={600}>
          <section
            aria-labelledby="principal-investigator"
            className="mb-16 border-y border-[#E2E8F0] py-10"
          >
            <h2
              className="text-3xl lg:text-4xl text-[#1B2A4A] mb-6"
              id="principal-investigator"
            >
              {t("Lab Director")}
            </h2>
            <div className="grid sm:grid-cols-[192px_1fr] gap-8 lg:gap-12 items-start">
              <div
                data-team-portrait
                className="h-48 w-48 overflow-hidden rounded-sm bg-stone-50 group/portrait"
              >
                <ResponsiveImage
                  src={diProfile.photo} loading="eager" sizes="192px"
                  alt="Dr Di Fu"
                  className="h-48 w-48 object-cover motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.23,1,0.32,1)] motion-safe:group-hover/portrait:scale-[1.04]"
                  style={{ objectPosition: "50% 35%" }}
                />
              </div>
              <div className="space-y-4 max-w-3xl">
                <div>
                  <h3 className="text-3xl lg:text-4xl text-[#1B2A4A]">
                    Di Fu, Ph.D.
                  </h3>
                  <p className="text-[#8B1A1A] font-medium mt-2">
                    {t("Assistant Professor (early tenured)")}
                  </p>
                  <p className="text-[#8B1A1A] font-medium mt-1">
                    {t("Interdisciplinary Principal Fellow (PAI)")}
                  </p>
                </div>
                <p className="text-sm leading-relaxed text-[#4A5568]">
                  {t("School of Psychology")}
                  <br />
                  {t("Surrey Institute for People-Centred AI (PAI)")}
                  <br />
                  {t("University of Surrey")}
                </p>
                <div className="flex flex-wrap gap-x-6 gap-y-3 pt-1">
                  <Link
                    href="/about-di"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[#8B1A1A] hover:text-[#6B1414]"
                  >
                    {t("About Di")} <ArrowUpRight size={15} />
                  </Link>
                  <a
                    href={`mailto:${labInfo.email}`}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[#8B1A1A] hover:text-[#6B1414]"
                  >
                    <Mail size={15} /> {labInfo.email}
                  </a>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        <nav
          aria-label={t("Team groups")}
          className="flex flex-wrap gap-x-7 gap-y-3 mb-14 text-sm"
        >
          {teamGroups.map(group => (
            <a
              key={group.id}
              href={`#${group.id}`}
              className="text-[#4A5568] hover:text-[#8B1A1A] underline underline-offset-4 decoration-[#CBD5E1]"
            >
              {c(group, "title")}
            </a>
          ))}
          <a
            href="#robotics-platforms"
            className="text-[#4A5568] hover:text-[#8B1A1A] underline underline-offset-4 decoration-[#CBD5E1]"
          >
            {t("Robotics Platforms")}
          </a>
          <a
            href="#surrey-collaborators"
            className="text-[#4A5568] hover:text-[#8B1A1A] underline underline-offset-4 decoration-[#CBD5E1]"
          >
            {t("Surrey Collaborators")}
          </a>
          <a
            href="#international-collaborators"
            className="text-[#4A5568] hover:text-[#8B1A1A] underline underline-offset-4 decoration-[#CBD5E1]"
          >
            {t("International Collaborators")}
          </a>
        </nav>

        <div className="space-y-16 lg:space-y-20">
          {teamGroups.map(group => (
            <section
              key={group.id}
              id={group.id}
              aria-labelledby={`${group.id}-heading`}
              className="scroll-mt-32"
            >
              <ScrollReveal direction="up" duration={600}>
                <div className="flex items-center gap-4 mb-7">
                  <h2
                    id={`${group.id}-heading`}
                    className="text-3xl lg:text-4xl text-[#1B2A4A]"
                  >
                    {c(group, "title")}
                  </h2>
                  <span className="text-xs text-[#8B1A1A] border border-[#8B1A1A]/20 px-2 py-0.5 rounded-sm">
                    {group.members.length}
                  </span>
                  <div className="h-px bg-[#E2E8F0] flex-1" />
                </div>
              </ScrollReveal>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {group.members.map((member, index) => (
                  <ScrollReveal
                    key={member.name}
                    direction="up"
                    delay={(index % 3) * 60}
                    duration={600}
                  >
                    <article className="h-full p-6 lg:p-7 border border-[#E2E8F0] border-t-2 border-t-[#8B1A1A]/70 bg-white hover:shadow-sm transition-shadow duration-200">
                      <p className="text-xs text-[#8B1A1A] uppercase tracking-[0.08em] mb-3">
                        {member.role ? c(member, "role") : c(group, "role")}
                      </p>
                      <h3 className="text-2xl text-[#1B2A4A] leading-tight mb-4">
                        {member.name}
                      </h3>
                      {member.photo && !failedPhotos.has(member.name) && (
                        <div
                          data-team-portrait
                          className="mx-auto mb-4 h-48 w-48 overflow-hidden rounded-sm bg-stone-50 group/portrait"
                        >
                          <ResponsiveImage
                            src={member.photo.src} sizes="192px"
                            width={member.photo.width}
                            height={member.photo.height}
                            alt={member.name}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.23,1,0.32,1)] motion-safe:group-hover/portrait:scale-[1.04]"
                            style={{
                              objectPosition:
                                member.photo.position ?? "50% 35%",
                            }}
                            onError={() =>
                              setFailedPhotos(names =>
                                new Set(names).add(member.name)
                              )
                            }
                          />
                        </div>
                      )}
                      {member.background && (
                        <p className="text-sm font-medium text-[#4A5568] mb-2">
                          {c(member, "background")}
                        </p>
                      )}
                      <p className="text-sm text-[#4A5568] leading-relaxed">
                        {c(member, "affiliation")}
                      </p>
                      <p className="text-sm text-[#64748B] leading-relaxed mt-1">
                        {c(member, "institution")}
                      </p>
                    </article>
                  </ScrollReveal>
                ))}
              </div>
            </section>
          ))}
        </div>

        <RoboticsPlatforms />
        <Collaborations />
      </div>
    </div>
  );
}
