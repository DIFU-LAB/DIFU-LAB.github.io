import type { Language } from "@/contexts/LanguageContext";
import sources from "@content/pages/about-di/story.json";

export interface DiStorySection {
  readonly id: string;
  readonly title: string;
  readonly paragraphs: readonly string[];
}

export interface DiStoryArticle {
  readonly title: string;
  readonly introduction: readonly string[];
  readonly sections: readonly DiStorySection[];
}

/** Separate author-supplied versions, retained verbatim for source reconciliation. */
export const diStorySources: Readonly<Record<Language, DiStoryArticle>> =
  sources;

/** Change display dashes only; preserve all other prose, spacing and markup. */
export function normalizeStoryDashes(text: string): string {
  return text
    .replace(/\u2014{2,}/g, "-")
    .replace(/[\u2010-\u2015\u2212\ufe58\ufe63\uff0d]/g, "-");
}

function normalizeArticle(article: DiStoryArticle): DiStoryArticle {
  return {
    title: normalizeStoryDashes(article.title),
    introduction: article.introduction.map(normalizeStoryDashes),
    sections: article.sections.map(section => ({
      id: section.id,
      title: normalizeStoryDashes(section.title),
      paragraphs: section.paragraphs.map(normalizeStoryDashes),
    })),
  };
}

export const diStories: Readonly<Record<Language, DiStoryArticle>> = {
  en: normalizeArticle(diStorySources.en),
  zh: normalizeArticle(diStorySources.zh),
};

/** Select the author's English or Chinese version, not dictionary translation. */
export function getDiStory(language: Language): DiStoryArticle {
  return diStories[language];
}
