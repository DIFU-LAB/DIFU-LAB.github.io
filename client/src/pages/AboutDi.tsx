import DiStory from "@/components/DiStory";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AboutDi() {
  const { language } = useLanguage();

  return (
    <div
      className="min-h-screen bg-white pt-32"
      lang={language === "zh" ? "zh-CN" : "en"}
    >
      <DiStory />
    </div>
  );
}
