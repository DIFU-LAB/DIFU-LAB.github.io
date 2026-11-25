import { useLanguage } from "@/contexts/LanguageContext";
export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  return (
    <div
      role="group"
      aria-label={language === "zh" ? "选择语言" : "Choose language"}
      className="flex shrink-0 items-center gap-1 text-sm font-medium"
    >
      <button
        type="button"
        lang="en"
        aria-pressed={language === "en"}
        onClick={() => setLanguage("en")}
        className={`px-2 py-1.5 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B1A1A] ${language === "en" ? "text-[#8B1A1A] underline underline-offset-4" : "text-[#64748B] hover:text-[#1B2A4A]"}`}
      >
        EN
      </button>
      <span aria-hidden="true" className="text-[#CBD5E1]">
        /
      </span>
      <button
        type="button"
        lang="zh-CN"
        aria-pressed={language === "zh"}
        onClick={() => setLanguage("zh")}
        className={`px-2 py-1.5 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B1A1A] ${language === "zh" ? "text-[#8B1A1A] underline underline-offset-4" : "text-[#64748B] hover:text-[#1B2A4A]"}`}
      >
        中文
      </button>
    </div>
  );
}
