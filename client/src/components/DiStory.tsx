import React, { type ReactNode } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getDiStory, normalizeStoryDashes } from "@/lib/diStory";
import { diProfile } from "@/lib/data";
import StoryPhotoFigure from "@/components/StoryPhotoFigure";
import { getStoryPhotoId } from "@/lib/storyPhotoPlacement";
import { storyPhotos } from "@/lib/storyPhotos";
import { ScrollReveal } from "@/components/ScrollReveal";

/** Only author-supplied **strong** and *em* are interpreted; HTML stays text. */
export function renderStoryInline(text: string): ReactNode[] {
  const normalized = normalizeStoryDashes(text);
  const nodes: ReactNode[] = [];
  let cursor = 0;

  for (const match of Array.from(
    normalized.matchAll(/(?<!\*)(?:\*\*([^*]+)\*\*|\*([^*]+)\*)(?!\*)/g)
  )) {
    const index = match.index;
    if (index > cursor) nodes.push(normalized.slice(cursor, index));
    nodes.push(
      match[1] !== undefined ? (
        <strong key={index} className="font-semibold text-[#1B2A4A]">
          {/[\u4e00-\u9fff]/.test(match[1])
            ? match[1]
                .split(/([A-Za-z]+(?:['-][A-Za-z]+)*)/g)
                .map((part, wordIndex) =>
                  /^[A-Za-z]/.test(part) ? (
                    <span key={wordIndex} lang="en" className="inline-block">
                      {part}
                    </span>
                  ) : (
                    part
                  )
                )
            : match[1]}
        </strong>
      ) : (
        <em key={index}>{match[2]}</em>
      )
    );
    cursor = index + match[0].length;
  }

  if (cursor < normalized.length) nodes.push(normalized.slice(cursor));
  return nodes;
}

export default function DiStory() {
  const { language } = useLanguage();
  // Page eyebrow matching other pages' headers; literal, not dictionary-based,
  // so the author's story text never passes through translation.
  const eyebrow = language === "zh" ? "关于 Di" : "About Di";
  const story = getDiStory(language);
  // Split the author's title at its first colon into a headline and subtitle.
  // The colon stays in the DOM (visually hidden) so the h1 text is verbatim.
  const titleMatch = story.title.match(/^(.*?)([:：]\s*)(.+)$/);
  const [headline, separator, subtitle] = titleMatch
    ? [titleMatch[1], titleMatch[2], titleMatch[3]]
    : [story.title, "", ""];
  const paragraphClass = (index: number) =>
    `text-justify [text-align-last:left] [overflow-wrap:break-word] ${language === "zh" ? "[text-justify:inter-character]" : "[text-justify:inter-word] hyphens-auto"} ${index % 3 === 1 ? "mb-7 lg:mb-8" : "mb-5 lg:mb-6"} last:mb-0`;

  return (
    <section
      id="di-story"
      aria-labelledby="di-story-title"
      lang={language === "zh" ? "zh-CN" : "en"}
      className="pt-6 lg:pt-8 pb-16 lg:pb-20 scroll-mt-32"
    >
      <div className="max-w-5xl mx-auto px-6 lg:px-12 font-body">
        <ScrollReveal
          direction="up"
          duration={600}
          className="mb-10 lg:mb-14 space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-[#8B1A1A]" />
            <div
              className={`text-xs tracking-[0.2em] text-[#8B1A1A] font-medium ${language === "zh" ? "normal-case" : "uppercase"}`}
            >
              {eyebrow}
            </div>
          </div>
          <h1 id="di-story-title" className="text-[#1B2A4A]">
            <span className="block text-5xl lg:text-7xl">
              {renderStoryInline(headline)}
            </span>
            {subtitle && (
              <>
                <span className="sr-only">{separator}</span>
                <span
                  className={`block mt-3 lg:mt-4 text-xl sm:text-2xl lg:text-[2rem] leading-snug text-[#4A5568] text-balance ${
                    language === "zh"
                      ? "font-normal tracking-[0.06em]"
                      : "italic font-normal"
                  }`}
                >
                  {renderStoryInline(subtitle)}
                </span>
              </>
            )}
          </h1>
        </ScrollReveal>
        <div className="text-base lg:text-lg text-[#4A5568] leading-[1.8]">
          <div className="flow-root">
            <ScrollReveal
              direction="up"
              duration={450}
              className="float-left w-32 h-32 sm:w-44 sm:h-44 lg:w-60 lg:h-60 mr-5 lg:mr-8 mb-4 overflow-hidden rounded-sm bg-stone-50 group/portrait"
            >
              <img
                src={diProfile.photo}
                alt="Dr Di Fu"
                className="w-full h-full object-cover motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.23,1,0.32,1)] motion-safe:group-hover/portrait:scale-[1.04]"
              />
            </ScrollReveal>
            {story.introduction.map((paragraph, index) => {
              const photoId = getStoryPhotoId(
                language,
                "introduction",
                index,
                paragraph
              );
              return (
                <React.Fragment key={`introduction-${index}`}>
                  <p className={paragraphClass(index)}>
                    {renderStoryInline(paragraph)}
                  </p>
                  {photoId && (
                    <StoryPhotoFigure
                      photo={storyPhotos[photoId]}
                      language={language}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          {story.sections.map((section, sectionIndex) => (
            <section
              key={section.id}
              aria-labelledby={`di-story-${section.id}`}
              className="mt-12 lg:mt-14"
            >
              <ScrollReveal direction="up" duration={600} className="mb-6">
                <h2
                  id={`di-story-${section.id}`}
                  className="text-2xl lg:text-3xl text-[#1B2A4A]"
                >
                  {renderStoryInline(section.title)}
                </h2>
              </ScrollReveal>
              <div className="flow-root">
                {section.paragraphs.map((paragraph, paragraphIndex) => {
                  const isClosing =
                    sectionIndex === story.sections.length - 1 &&
                    paragraphIndex === section.paragraphs.length - 1;
                  const photoId = getStoryPhotoId(
                    language,
                    section.id,
                    paragraphIndex,
                    paragraph
                  );
                  return (
                    <React.Fragment key={`${section.id}-${paragraphIndex}`}>
                      {photoId && (
                        <StoryPhotoFigure
                          photo={storyPhotos[photoId]}
                          language={language}
                        />
                      )}
                      <p
                        className={`${paragraphClass(paragraphIndex)} ${isClosing ? "border-l-2 border-[#8B1A1A] pl-5 text-[#1B2A4A]" : ""}`}
                      >
                        {renderStoryInline(paragraph)}
                      </p>
                    </React.Fragment>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
