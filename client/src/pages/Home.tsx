// ============================================================
// Home Page - Classic British Academic Style with Full-Screen Hero
// Full-bleed hero image with text overlay for maximum visual impact
// ============================================================
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, ChevronDown } from "lucide-react";
import { newsItems as localNews } from "@/lib/news";
import { ScrollReveal } from "@/components/ScrollReveal";
import { formatNewsDate } from "@shared/news";
import { HomeResearchPillars } from "@/components/HomeResearchPillars";
import { HomeResearchVisual } from "@/components/HomeResearchVisual";
import { HomeLabName } from "@/components/HomeLabName";
import { HomePhilosophy } from "@/components/HomePhilosophy";
import { heroVideo } from "@/lib/heroVideo";
import { VisitorMap } from "@/components/VisitorMap";
import { useLanguage } from "@/contexts/LanguageContext";

function NewsSection() {
  const { t, language } = useLanguage();
  const newsItems = localNews;

  if (newsItems.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[#64748B]">{t("No news yet.")}</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-[#E2E8F0]">
      {newsItems.slice(0, 4).map(item => (
        <Link key={item.id} href="/news">
          <div className="group cursor-pointer py-5 flex gap-6 items-start hover:bg-[#F7F8FA] -mx-4 px-4 transition-colors">
            <span className="text-sm text-[#64748B] w-24 flex-shrink-0 pt-0.5">
              {language === "zh"
                ? new Intl.DateTimeFormat("zh-CN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    timeZone: "Europe/London",
                  }).format(new Date(item.publishedAt))
                : formatNewsDate(item.publishedAt)}
            </span>
            <div className="flex-1">
              <h3 className="text-xl leading-snug text-[#1B2A4A] group-hover:text-[#8B1A1A] transition-colors font-heading">
                {(language === "zh" && item.titleZh ? item.titleZh : t(item.title))}
              </h3>
              <p className="text-sm text-[#64748B] mt-1 leading-relaxed line-clamp-2">
                {(language === "zh" && item.excerptZh ? item.excerptZh : t(item.excerpt ?? ""))}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function Home() {
  const { t, language } = useLanguage();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* ===== FULL-SCREEN HERO WITH ORIGINAL BREATHING BACKGROUND ===== */}
      <section className="relative min-h-screen flex items-end justify-center overflow-hidden">
        {/* Restore the original, visibly breathing image rather than video. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <img
            src={heroVideo.fallbackSrc}
            alt=""
            className="w-full h-full object-cover hero-breathe"
          />
        </div>
        {/* Left-side overlay for text readability */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/50 via-white/20 to-transparent"
        />
        {/* Bottom-to-top white gradient for smooth transition to content */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-white via-white/70 to-transparent"
        />

        {/* Hero content */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8 w-full pt-32 pb-32">
          <div className="max-w-2xl">
            {/* University tag */}
            <div className="flex items-center gap-3 mb-8">
              <p className="text-xs tracking-[0.2em] text-[#8B1A1A] font-medium uppercase">
                {t("University of Surrey, United Kingdom")}
              </p>
            </div>

            {/* Main title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl text-[#1B2A4A] mb-8 leading-[1.1]">
              {t("Social Interaction")}
              {language === "en" ? " " : ""}
              <em className="text-[#8B1A1A]">{t("Lab name conjunction")}</em>
              {language === "en" ? " " : ""}
              {t("Embodied Intelligence")}{" "}
              <span className="text-[#8B1A1A]">{t("(SEIL) Lab")}</span>{" "}
            </h1>

            {/* Description */}
            <p className="text-lg text-[#4A5568] leading-relaxed mb-10 max-w-xl">
              {t(
                "We investigate how humans perceive and integrate multimodal social cues to understand the cognitive mechanisms underlying social interaction. Inspired by these mechanisms, we develop computational models and embodied robotic systems to advance artificial social intelligence. Through human-robot interaction studies, we explore how people interact with intelligent agents, establishing a bidirectional link between human social cognition and embodied artificial intelligence."
              )}
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-4">
              <Link href="/research">
                <button className="group px-7 py-3.5 bg-[#8B1A1A] text-white text-sm font-medium transition-all hover:bg-[#6B1414] flex items-center gap-2 cursor-pointer rounded">
                  {t("Explore Research")}
                  <ArrowRight
                    size={15}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </button>
              </Link>
              <Link href="/team">
                <button className="px-7 py-3.5 border border-[#1B2A4A]/40 text-[#1B2A4A] text-sm font-medium hover:bg-[#1B2A4A]/10 transition-all cursor-pointer rounded backdrop-blur-sm">
                  {t("Meet the Team")}
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll-down arrow indicator */}
        <div
          className={`absolute bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2 z-10 transition-opacity duration-500 cursor-pointer ${
            scrolled ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
          onClick={() =>
            window.scrollTo({ top: window.innerHeight, behavior: "smooth" })
          }
        >
          <div className="flex flex-col items-center gap-1 motion-safe:animate-bounce">
            <span className="text-xs tracking-[0.15em] uppercase text-[#8B1A1A]/60 font-medium">
              {t("Scroll")}
            </span>
            <ChevronDown size={28} className="text-[#8B1A1A]/60" />
          </div>
        </div>
      </section>

      {/* ===== OUR PHILOSOPHY ===== */}
      <HomePhilosophy />
      {/* ===== WHAT SEIL MEANS ===== */}
      <HomeLabName />

      {/* ===== INSIDE OUR RESEARCH: LAB FILM SLOT ===== */}
      <HomeResearchVisual />

      {/* ===== THREE CORE RESEARCH PILLARS ===== */}
      <HomeResearchPillars />

      {/* ===== LATEST NEWS SECTION ===== */}
      <section className="py-20 lg:py-28 bg-[#F7F8FA]">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <ScrollReveal direction="up" duration={600}>
            <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <h2 className="text-3xl lg:text-5xl text-[#1B2A4A] font-heading leading-tight">
                  {t("Latest News")}
                </h2>
              </div>
              <Link href="/news">
                <span className="text-sm text-[#8B1A1A] hover:text-[#6B1414] transition-colors cursor-pointer font-medium">
                  {t("View all news →")}
                </span>
              </Link>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={150} duration={600}>
            <div className="bg-white rounded-sm border border-[#E2E8F0] p-4">
              <NewsSection />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== VISITOR MAP ===== */}
      <VisitorMap />

      {/* ===== CTA SECTION ===== */}
      <section className="py-20 lg:py-28 bg-[#1B2A4A]">
        <ScrollReveal direction="up" duration={700}>
          <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-3xl lg:text-5xl text-white mb-5 font-heading leading-tight">
              {t("Join the lab")}
            </h2>
            <p className="text-lg text-[#94A3B8] max-w-2xl mx-auto mb-8 leading-relaxed text-pretty">
              {/* Non-breaking space keeps "SEIL Lab" / "SEIL 实验室" on one line. */}
              {t(
                "We welcome researchers and students interested in social cognition, human-AI interaction and embodied AI. Contact us to discuss opportunities to work with SEIL Lab."
              ).replace("SEIL ", "SEIL\u00a0")}
            </p>
            <Link href="/team">
              <button className="px-8 py-3 bg-[#8B1A1A] text-white text-sm font-medium hover:bg-[#6B1414] transition-all cursor-pointer rounded">
                {t("Contact Us")}
              </button>
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
