import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";

export default function NotFound() {
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center pt-20">
      <div className="max-w-2xl mx-auto px-6 text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-light text-[#8B1A1A]">404</h1>
          <h2 className="text-3xl font-light text-[#1B2A4A]">
            {t("Page Not Found")}
          </h2>
        </div>
        <p className="text-lg text-[#4A5568]">
          {t(
            "The page you are looking for does not exist. Please return to the home page or explore other sections of the site."
          )}
        </p>
        <Link href="/">
          <button className="px-8 py-3 bg-[#8B1A1A] text-white text-sm font-medium hover:bg-[#6B1414] transition-all cursor-pointer">
            {t("Back to Home")}
          </button>
        </Link>
      </div>
    </div>
  );
}
