import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../../translations/locales/en.json";
import zh from "../../translations/locales/zh-CN.json";

export const LANGUAGE_STORAGE_KEY = "seil-language";
export type Language = "en" | "zh";
function initialLanguage(): Language {
  try { return localStorage.getItem(LANGUAGE_STORAGE_KEY) === "zh" ? "zh" : "en"; }
  catch { return "en"; }
}

// Flat English keys, just like TeXlyre; punctuation is part of the key.
void i18next.use(initReactI18next).init({
  resources: { en: { translation: en }, zh: { translation: zh } },
  lng: initialLanguage(),
  fallbackLng: "en",
  supportedLngs: ["en", "zh"],
  keySeparator: false,
  nsSeparator: false,
  initAsync: false,
  interpolation: { escapeValue: false },
});
export const t = (key: string, options?: Record<string, unknown>): string =>
  i18next.t(key, options ?? {});
export default i18next;
