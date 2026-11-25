import { useCallback, useEffect, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { LANGUAGE_STORAGE_KEY, type Language } from "@/i18n";
import { contentText } from "@/lib/localizedContent";
import navigation from "@content/site/navigation.json";

export type { Language } from "@/i18n";
export function useLanguage() {
  const { i18n } = useTranslation();
  const language: Language = i18n.resolvedLanguage === "zh" ? "zh" : "en";
  const setLanguage = useCallback((next: Language) => { void i18n.changeLanguage(next); }, [i18n]);
  const c = useCallback((record: unknown, field: string) => contentText(record, field, language), [language]);
  return { language, setLanguage, c };
}
const pageLabels: Record<string,string> = { ...Object.fromEntries(navigation.map(item => [item.href, item.label])), "/404": "Page not found" };
export function LanguageProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [location] = useLocation();
  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
    document.documentElement.dataset.language = language;
    document.title = `${t(pageLabels[location] || "SEIL Lab")} | SEIL Lab | ${t("University of Surrey")}`;
    document.querySelector('meta[name="description"]')?.setAttribute("content", t("SEIL Lab studies social cognition, human-inspired AI and human-robot interaction at the University of Surrey."));
    try { localStorage.setItem(LANGUAGE_STORAGE_KEY, language); } catch { /* optional preference */ }
  }, [language, location, t]);
  return <>{children}</>;
}
