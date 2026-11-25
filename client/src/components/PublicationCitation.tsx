import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import { Copy, Download, Quote } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Publication } from "@/lib/publications";
import {
  getPublicationBibTeX,
  getPublicationCitationWarnings,
} from "@/lib/publicationCitation";

export default function PublicationCitation({ work }: { work: Publication }) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"copied" | "fallback" | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const copyRequest = useRef(0);
  const downloads = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const bibtex = getPublicationBibTeX(work);
  const warnings: string[] = getPublicationCitationWarnings(work);

  useEffect(() => {
    const pendingDownloads = downloads.current;
    return () => {
      copyRequest.current += 1;
      pendingDownloads.forEach((timer, url) => {
        clearTimeout(timer);
        URL.revokeObjectURL(url);
      });
      pendingDownloads.clear();
    };
  }, []);

  function handleOpenChange(nextOpen: boolean) {
    copyRequest.current += 1;
    setStatus(null);
    setOpen(nextOpen);
  }

  async function copyBibTeX() {
    const request = ++copyRequest.current;
    setStatus(null);
    try {
      if (!window.isSecureContext || !navigator.clipboard?.writeText) {
        throw new Error("Clipboard unavailable");
      }
      await navigator.clipboard.writeText(bibtex);
      if (request === copyRequest.current) setStatus("copied");
    } catch {
      if (request !== copyRequest.current) return;
      const textarea = textareaRef.current;
      if (!textarea) return;
      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);
      setStatus("fallback");
    }
  }

  function downloadBibTeX() {
    const blob = new Blob([bibtex], {
      type: "application/x-bibtex;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `publication-${work.id.replace(/[^a-zA-Z0-9_-]/g, "_") || "record"}.bib`;
    document.body.appendChild(anchor);
    try {
      anchor.click();
    } finally {
      anchor.remove();
      const timer = setTimeout(() => {
        URL.revokeObjectURL(url);
        downloads.current.delete(url);
      }, 1000);
      downloads.current.set(url, timer);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label={`${t("Cite")}: ${work.title}`}
          className="inline-flex items-center gap-1.5 text-sm text-[#8B1A1A] hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-[#8B1A1A]"
        >
          <Quote size={14} aria-hidden="true" />
          {t("Cite")}
        </button>
      </DialogTrigger>
      <DialogContent
        lang={language === "zh" ? "zh-CN" : "en"}
        className="min-w-0 max-h-[calc(100dvh-2rem)] overflow-x-hidden overflow-y-auto bg-white p-5 text-[#1B2A4A] sm:max-w-2xl sm:p-6"
      >
        <DialogHeader className="min-w-0 pr-6 text-left">
          <DialogTitle className="text-2xl">{t("Cite")}</DialogTitle>
          <DialogDescription
            lang="en"
            className="break-words leading-relaxed text-[#64748B]"
          >
            {work.title}
          </DialogDescription>
        </DialogHeader>
        <textarea
          ref={textareaRef}
          aria-label="BibTeX"
          lang="en"
          readOnly
          spellCheck={false}
          wrap="off"
          value={bibtex}
          className="h-[min(45dvh,22rem)] min-h-24 w-full min-w-0 resize-none overflow-auto rounded-sm border border-[#CBD5E1] bg-[#F8FAFC] p-3 font-mono text-[14px] leading-relaxed text-[#1B2A4A] focus-visible:outline-2 focus-visible:outline-[#8B1A1A]"
        />
        {warnings.length > 0 && (
          <div className="min-w-0 space-y-1 text-xs leading-relaxed text-[#64748B]">
            {warnings.map(warning => (
              <p key={warning}>{t(warning)}</p>
            ))}
          </div>
        )}
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            onClick={copyBibTeX}
            className="bg-[#8B1A1A] text-white hover:bg-[#701515] focus-visible:ring-[#8B1A1A]/30"
          >
            <Copy size={14} aria-hidden="true" /> {t("Copy BibTeX")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={downloadBibTeX}
            className="border-[#CBD5E1] text-[#1B2A4A] hover:bg-[#F1F3F5] focus-visible:ring-[#8B1A1A]/30"
          >
            <Download size={14} aria-hidden="true" /> {t("Download .bib")}
          </Button>
        </div>
        <p
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="min-h-5 text-xs leading-relaxed text-[#64748B]"
        >
          {status === "copied"
            ? t("Copied")
            : status === "fallback"
              ? t("Select and copy the text.")
              : ""}
        </p>
      </DialogContent>
    </Dialog>
  );
}
