import type { StoryPhoto } from "@/components/StoryPhotoFigure";

export function getStoryPhotoId(
  language: "en" | "zh",
  sectionId: string,
  paragraphIndex: number,
  paragraph: string
): StoryPhoto["id"] | undefined {
  if (sectionId === "introduction" && paragraphIndex === 0) return "tianjin";
  if (
    sectionId === "turning-point" &&
    (language === "en"
      ? paragraph.startsWith("In 2015,") && paragraph.includes("Yanqi Lake")
      : paragraph.startsWith("2015年，在中国科学院雁栖湖校区"))
  )
    return "yanqi";
  if (
    sectionId === "coincidence" &&
    paragraph.includes("BBC") &&
    paragraph.includes("McGurk")
  )
    return "mcgurk";
  if (sectionId !== "machine-intelligence") return undefined;
  const hamburg =
    language === "en"
      ? "Through this project, I joined Professor Stefan Wermter"
      : "正是这个项目，让我来到汉堡大学";
  const surrey =
    language === "en"
      ? "In late 2023, I was fortunate to receive a joint appointment offer"
      : "2023年底，我收到了英国萨里大学";
  if (paragraph.startsWith(hamburg)) return "hamburg";
  if (paragraph.startsWith(surrey)) return "surrey";
  return undefined;
}
