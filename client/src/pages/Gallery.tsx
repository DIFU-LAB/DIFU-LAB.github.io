import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Expand, X } from "lucide-react";
import { galleryCategories, galleryItems } from "@/lib/gallery";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Gallery() {
  const { t, language } = useLanguage();
  const [category, setCategory] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const filtered = category
    ? galleryItems.filter(item => item.category === category)
    : galleryItems;
  const selectedIndex = filtered.findIndex(item => item.id === selectedId);
  const selected = selectedIndex >= 0 ? filtered[selectedIndex] : null;
  const navigate = (step: number) => {
    if (selectedIndex < 0) return;
    setSelectedId(
      filtered[(selectedIndex + step + filtered.length) % filtered.length].id
    );
  };

  return (
    <div className="min-h-screen bg-white pt-32 pb-24" lang={language}>
      <div className="max-w-7xl mx-auto px-6 lg:px-16">
        <ScrollReveal direction="up" duration={600}>
          <header className="mb-12 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-[#8B1A1A]" />
              <p className="text-xs tracking-[0.2em] uppercase text-[#8B1A1A] font-medium">
                {t("Gallery")}
              </p>
            </div>
            <h1 className="text-5xl lg:text-7xl text-[#1B2A4A]">
              {t("Life & Events")}
            </h1>
            <p className="text-lg text-[#4A5568] max-w-2xl leading-relaxed">
              {t(
                "Talks, collaborations, conferences, and celebrations from our research community."
              )}
            </p>
          </header>
        </ScrollReveal>

        <div
          className="flex flex-wrap gap-2 border-b border-[#E2E8F0] pb-7 mb-10"
          aria-label={t("Filter gallery by category")}
        >
          {[null, ...galleryCategories].map(value => (
            <button
              type="button"
              key={value ?? "all"}
              aria-pressed={category === value}
              onClick={() => setCategory(value)}
              className={`px-4 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B1A1A] ${category === value ? "bg-[#8B1A1A] text-white" : "bg-[#F1F3F5] text-[#1B2A4A] hover:bg-[#E2E8F0]"}`}
            >
              {(language === "zh" && value ? galleryItems.find(item=>item.category===value)?.categoryZh || t(value) : t(value ?? "All photographs"))}
            </button>
          ))}
        </div>

        <div
          className="columns-1 md:columns-2 lg:columns-3 gap-7"
          aria-live="polite"
        >
          {filtered.map((image, index) => (
            <ScrollReveal
              key={image.id}
              direction="up"
              delay={Math.min(index * 35, 140)}
              duration={450}
              className="mb-8 break-inside-avoid"
            >
              <figure className="border-b border-[#E2E8F0] pb-6">
                <button
                  type="button"
                  aria-label={`${t("Enlarge")}: ${(language === "zh" && image.titleZh ? image.titleZh : t(image.title))}`}
                  onClick={event => {
                    triggerRef.current = event.currentTarget;
                    setSelectedId(image.id);
                  }}
                  className="block relative w-full bg-[#F1F3F5] overflow-hidden group focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8B1A1A]"
                >
                  <img
                    src={image.image}
                    alt={(language === "zh" && image.titleZh ? image.titleZh : t(image.title))}
                    width={image.width}
                    height={image.height}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-auto transition-transform duration-300 group-hover:scale-[1.015]"
                  />
                  <span
                    className="absolute bottom-3 right-3 bg-white/95 text-[#1B2A4A] p-2 opacity-90 group-hover:opacity-100"
                    aria-hidden="true"
                  >
                    <Expand size={16} />
                  </span>
                </button>
                <figcaption className="pt-4 space-y-2">
                  <div className="flex flex-wrap justify-between gap-2 text-[10px] tracking-[0.12em] uppercase">
                    <span className="text-[#8B1A1A] font-medium">
                      {(language === "zh" && image.categoryZh ? image.categoryZh : t(image.category))}
                    </span>
                    {image.dateLabel && (
                      <span className="text-[#64748B]">
                        {t(image.dateLabel)}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl leading-snug text-[#1B2A4A]">
                    {(language === "zh" && image.titleZh ? image.titleZh : t(image.title))}
                  </h2>
                  {image.sourceUrl && <a
                    href={image.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#64748B] hover:text-[#8B1A1A]"
                  >
                    {image.sourceLabel}
                    <ArrowUpRight size={12} />
                  </a>}
                </figcaption>
              </figure>
            </ScrollReveal>
          ))}
        </div>
      </div>

      <Dialog
        open={selected !== null}
        onOpenChange={open => {
          if (!open) setSelectedId(null);
        }}
      >
        {selected && (
          <DialogContent
            showCloseButton={false}
            className="sm:max-w-5xl max-h-[94dvh] p-0 gap-0 rounded-none overflow-y-auto border-none bg-white text-[#1B2A4A]"
            onCloseAutoFocus={event => {
              event.preventDefault();
              triggerRef.current?.focus();
            }}
            onKeyDown={event => {
              if (event.key === "ArrowRight") {
                event.preventDefault();
                navigate(1);
              } else if (event.key === "ArrowLeft") {
                event.preventDefault();
                navigate(-1);
              }
            }}
          >
            <DialogClose
              aria-label={t("Close photograph")}
              className="absolute top-3 right-3 z-10 bg-white/95 text-[#1B2A4A] p-2 hover:bg-white focus-visible:outline-2 focus-visible:outline-[#8B1A1A]"
            >
              <X size={20} />
            </DialogClose>
            <div className="bg-[#101827]">
              <img
                src={selected.image}
                alt={(language === "zh" && selected.titleZh ? selected.titleZh : t(selected.title))}
                width={selected.width}
                height={selected.height}
                className="w-full h-auto max-h-[62dvh] object-contain"
              />
            </div>
            <div className="p-5 sm:p-7">
              <div className="flex flex-wrap justify-between items-center gap-3 mb-4 text-xs text-[#64748B]">
                <span>
                  {(language === "zh" && selected.categoryZh ? selected.categoryZh : t(selected.category))}
                  {selected.dateLabel ? ` - ${t(selected.dateLabel)}` : ""}
                </span>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    aria-label={t("Previous photograph")}
                    className="p-1.5 hover:text-[#8B1A1A]"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <span aria-live="polite">
                    {selectedIndex + 1} / {filtered.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate(1)}
                    aria-label={t("Next photograph")}
                    className="p-1.5 hover:text-[#8B1A1A]"
                  >
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
              <DialogTitle className="text-2xl font-normal leading-snug text-[#1B2A4A]">
                {(language === "zh" && selected.titleZh ? selected.titleZh : t(selected.title))}
              </DialogTitle>
              <DialogDescription className="text-sm text-[#4A5568] leading-relaxed mt-3">
                {(language === "zh" && selected.descriptionZh ? selected.descriptionZh : t(selected.description))}
              </DialogDescription>
              {selected.sourceUrl && <a
                href={selected.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#8B1A1A] mt-4 hover:underline underline-offset-4"
              >
                {t("View source")}: {selected.sourceLabel}
                <ArrowUpRight size={13} />
              </a>}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
