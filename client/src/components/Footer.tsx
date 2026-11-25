import { useConsent } from "@/services/consent";
import { useLanguage } from "@/contexts/LanguageContext";
// ============================================================
// Footer Component - Classic British Academic Style
// Clean, structured, navy background
// ============================================================
import { Link } from "wouter";
import { labInfo, navItems, researchAreas } from "@/lib/data";
import { Mail, MapPin } from "lucide-react";

export default function Footer() {
  const { t, language } = useLanguage();
  const consent = useConsent();

  const footerResearchItems = researchAreas
    .filter(area => area.id !== "social-attention")
    .map(area => ({
      id: area.id,
      title:
        area.id === "social-robotics" ? "Human-Robot Interaction" : area.title,
    }));
  footerResearchItems.splice(0, 0, {
    id: "human-social-cognition",
    title: "Human Social Cognition",
  });

  return (
    <footer className="bg-[#1B2A4A] text-white font-body text-sm font-normal">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Lab Identity */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <img
                src={labInfo.logo}
                alt={t("SEIL Lab Logo")}
                className="h-14 w-auto brightness-200"
              />
              <span className="text-sm font-body font-medium">
                {t("SEIL Lab")}
              </span>
            </div>
            <p className="text-sm text-[#94A3B8] leading-relaxed mb-2">
              {t(labInfo.fullName)}
            </p>
            <div className="space-y-2 mb-6">
              <div className="flex items-start gap-2">
                <MapPin
                  size={14}
                  className="text-[#94A3B8] mt-0.5 flex-shrink-0"
                />
                <span className="text-sm text-[#94A3B8] leading-relaxed">
                  {t(labInfo.address)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-[#94A3B8] flex-shrink-0" />
                <a
                  href={`mailto:${labInfo.email}`}
                  className="text-sm text-[#94A3B8] hover:text-white transition-colors"
                >
                  {labInfo.email}
                </a>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-6 font-body">
              {t("Navigation")}
            </h4>
            <nav className="space-y-2.5">
              {navItems.map(item => (
                <Link key={item.href} href={item.href}>
                  <span className="block text-sm text-[#94A3B8] hover:text-white transition-colors cursor-pointer">
                    {t(item.label)}
                  </span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Research Focus */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-6 font-body">
              {t("Research Focus")}
            </h4>
            <div className="space-y-2.5">
              {footerResearchItems.map(area => (
                <div key={area.id} className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-[#8B1A1A] rounded-full flex-shrink-0" />
                  <span className="text-sm text-[#94A3B8]">
                    {t(area.title)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-6 border-t border-[#2D3F5E] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <p className="text-sm text-[#64748B] text-center">
              © {new Date().getFullYear()} {t("SEIL Lab ·")}
              {t(labInfo.university)} {t("· United Kingdom")}
            </p>
            <img
              src={labInfo.universityLogo}
              alt={t("University of Surrey")}
              width={500}
              height={118}
              loading="lazy"
              decoding="async"
              className="block w-[120px] h-auto shrink-0"
            />
          </div>
          <button type="button" onClick={consent.open} className="text-sm text-[#94A3B8] hover:underline">{language === "zh" ? "Cookie 设置" : "Cookie settings"}</button>
          <p className="text-sm text-[#64748B]">
            {t("Est.")}
            {labInfo.founded}
          </p>
        </div>
      </div>
    </footer>
  );
}
