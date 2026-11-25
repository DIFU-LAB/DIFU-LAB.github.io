import { ResponsiveImage } from "@/components/ResponsiveImage";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { navItems, labInfo } from "@/lib/site";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function Navbar() {
  const { t } = useTranslation();
  const { c } = useLanguage();
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isHome = location === "/";
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  useEffect(() => setMobileOpen(false), [location]);
  const showWhiteBg = !isHome || scrolled;
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${showWhiteBg ? "bg-white/97 backdrop-blur-sm shadow-[0_1px_0_0_#E2E8F0]" : "bg-transparent"}`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-20 lg:h-24">
          <Link href="/" className="shrink-0">
            <div className="flex items-center gap-3">
              <ResponsiveImage
                src={labInfo.logo} loading="eager" sizes="(min-width: 1024px) 80px, 72px"
                alt={t("SEIL Lab Logo")}
                className="h-14 lg:h-16 w-auto"
              />
              <span className="hidden sm:block text-lg font-medium text-[#1B2A4A]">
                {c(labInfo, "directorLabel")}
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-3 lg:gap-5">
            <nav
              aria-label={t("Main navigation")}
              className="hidden lg:flex items-center gap-6"
            >
              {navItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={location === item.href ? "page" : undefined}
                  className={`text-lg font-medium nav-link pb-0.5 whitespace-nowrap ${location === item.href ? "text-[#8B1A1A] active" : "text-[#4A5568] hover:text-[#1B2A4A]"}`}
                >
                  {t(item.label)}
                </Link>
              ))}
            </nav>
            <LanguageSwitcher />
            <button
              type="button"
              className="lg:hidden p-2 text-[#1B2A4A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B1A1A]"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation"
              aria-label={t("Toggle menu")}
            >
              {mobileOpen ? (
                <X size={22} aria-hidden="true" />
              ) : (
                <Menu size={22} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
      {mobileOpen && (
        <div
          id="mobile-navigation"
          className="lg:hidden bg-white border-t border-[#E2E8F0]"
        >
          <nav
            aria-label={t("Mobile navigation")}
            className="max-w-7xl mx-auto px-6 py-4 flex flex-col"
          >
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                aria-current={location === item.href ? "page" : undefined}
                className={`block text-base py-3 border-b border-[#F1F5F9] ${location === item.href ? "text-[#8B1A1A] font-medium" : "text-[#4A5568]"}`}
              >
                {t(item.label)}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
