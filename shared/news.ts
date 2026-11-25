import { newsItems } from "../client/src/lib/news";
export const linkedinProfileUrl = "https://www.linkedin.com/in/di-fu-1307a86a/";
export type NewsSource = {
  category: string;
  sourceAuthor: string;
  sourceUrl: string;
  sourceName: string;
  sourceKind: "linkedin" | "university" | "workshop";
  dateBasis: "post" | "publication" | "event";
  dateValue: string;
};

export function getNewsSource(url:string): NewsSource | undefined { return newsItems.find(item=>item.linkedinUrl===url)?.source; }
// Keep author-side UK calendar dates stable across visitors' timezones.
export function formatNewsDate(value: Date | string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Europe/London",
  }).format(new Date(value));
}

export function getNewsDatePresentation(value: Date | string, url: string) {
  const source = getNewsSource(url);
  if (source && source.sourceKind !== "linkedin") {
    // These official sources establish a calendar day, not a posting hour.
    // The midday instant is only for formatting; expose the real day in HTML.
    return {
      text: formatNewsDate(`${source.dateValue}T12:00:00Z`),
      dateTime: source.dateValue,
      label: source.dateBasis === "event" ? "Event date" : "Published",
    };
  }
  return {
    text: formatNewsDate(value),
    dateTime: new Date(value).toISOString(),
    label: "Posted",
  };
}

export function getNewsYear(value: Date | string) {
  return Number(
    new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      timeZone: "Europe/London",
    }).format(new Date(value))
  );
}
