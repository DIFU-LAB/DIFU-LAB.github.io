import React from "react";
import { ScrollReveal } from "@/components/ScrollReveal";

export interface StoryPhoto {
  id: "tianjin" | "yanqi" | "hamburg" | "surrey" | "mcgurk";
  src: string;
  width: number;
  height: number;
  caption: Record<"en" | "zh", string>;
  alt: Record<"en" | "zh", string>;
}

export default function StoryPhotoFigure({
  photo,
  language,
}: {
  photo: StoryPhoto;
  language: "en" | "zh";
}) {
  // Staggered rhythm: portrait (left) -> Tianjin (right) -> Yanqi (left)
  // -> Hamburg (right) -> Surrey (left) -> McGurk (right).
  const alignment = ["yanqi", "surrey"].includes(photo.id)
    ? "float-left mr-4 sm:mr-6 lg:mr-8"
    : "float-right ml-4 sm:ml-6 lg:ml-8";
  // Tianjin sits diagonally below the left portrait. Its wrap area starts one
  // line lower than the cleared float edge (with matching empty padding), so
  // the line crossing the portrait's bottom is never squeezed between both.
  const offset =
    photo.id === "tianjin"
      ? "mt-0 pt-9 [shape-outside:inset(2.25rem_0_0_0)]"
      : "mt-1";
  return (
    <figure
      className={`clear-both ${alignment} w-[46%] sm:w-[48%] lg:w-[50%] max-w-[460px] ${offset} mb-5`}
      data-story-photo={photo.id}
    >
      <ScrollReveal
        direction="up"
        duration={450}
        className="group overflow-hidden rounded-sm bg-[#F1F3F5]"
      >
        <img
          src={photo.src}
          alt={photo.alt[language]}
          width={photo.width}
          height={photo.height}
          loading={photo.id === "tianjin" ? "eager" : "lazy"}
          decoding="async"
          className="block w-full h-auto rounded-sm transition-transform duration-300 group-hover:scale-[1.015]"
        />
        <figcaption className="mt-2 text-xs leading-relaxed text-left text-[#64748B]">
          {photo.caption[language]}
        </figcaption>
      </ScrollReveal>
    </figure>
  );
}
