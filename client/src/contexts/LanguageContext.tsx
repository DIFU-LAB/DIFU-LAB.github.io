import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocation } from "wouter";
import home from "@content/translations/home.json";
import research from "@content/translations/research.json";
import team from "@content/translations/team.json";
import publications from "@content/translations/publications.json";
import news from "@content/translations/news.json";
import gallery from "@content/translations/gallery.json";
import aboutdi from "@content/translations/aboutdi.json";
import data from "@content/translations/data.json";
import common from "@content/translations/common.json";
import navigation from "@content/site/navigation.json";

export type Language = "en" | "zh";
export interface LocalizedCopy {
  en: string;
  zh: string;
}
const dictionary = {
  ...home,
  ...research,
  ...team,
  ...publications,
  ...news,
  ...gallery,
  ...aboutdi,
  ...data,
  ...common,
} as Record<string, LocalizedCopy>;
export const LANGUAGE_STORAGE_KEY = "seil-language";
export const normalizeText = (value: string) =>
  value
    .replace(/[\u2010-\u2015\u2212\ufe58\ufe63\uff0d]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
export function translateText(value: string, language: Language): string {
  const key = normalizeText(value);
  const entry = dictionary[key];
  return normalizeText(entry ? entry[language] : key);
}
interface LanguageValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (value: string) => string;
}
const LanguageContext = createContext<LanguageValue>({
  language: "en",
  setLanguage: () => {},
  t: value => translateText(value, "en"),
});
function initialLanguage(): Language {
  if (typeof window === "undefined") return "en";
  try {
    return window.localStorage.getItem(LANGUAGE_STORAGE_KEY) === "zh"
      ? "zh"
      : "en";
  } catch {
    return "en";
  }
}
const pageLabels: Record<string,string> = {...Object.fromEntries(navigation.map(item=>[item.href,item.label])), "/404":"Page not found"};
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [location] = useLocation();
  const t = useCallback(
    (value: string) => translateText(value, language),
    [language]
  );
  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
    document.documentElement.dataset.language = language;
    document.title = `${t(pageLabels[location] || "SEIL Lab")} | SEIL Lab | ${t("University of Surrey")}`;
    const description = document.querySelector('meta[name="description"]');
    description?.setAttribute(
      "content",
      t(
        "SEIL Lab studies social cognition, human-inspired AI and human-robot interaction at the University of Surrey."
      )
    );
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      /* Browsing still works when storage is disabled. */
    }
  }, [language, location, t]);
  const value = useMemo(() => ({ language, setLanguage, t }), [language, t]);
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
export const useLanguage = () => useContext(LanguageContext);
