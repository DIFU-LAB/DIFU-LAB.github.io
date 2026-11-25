import { records as loadRecords } from "./collections";
const records = loadRecords<Publication>(import.meta.glob("../../../content/publications/*.json", {eager:true, import:"default"}));
import coverage from "@content/site/publication-coverage.json";

export type PublicationSource = {
  name: string;
  url: string;
  recordId: string;
};

export type Publication = {
  id: string;
  title: string;
  authors: string;
  authorNames: string[];
  authorsComplete?: boolean;
  year: number | null;
  journal: string | null;
  doi: string;
  url: string;
  type: "journal" | "conference" | "workshop" | "preprint" | "poster";
  status?: "published" | "preprint" | "under-review" | "presented";
  kindLabel?: string;
  sourceUrl: string;
  sourceRecordIds: string[];
  sources?: PublicationSource[];
  versions: {
    doi: string;
    url: string;
    type: string;
    year?: number | null;
    withdrawn?: boolean;
  }[];
  notes?: string;
};

export type PublicationCoverage = {
  sourceUrl: string;
  sourceRecords: number;
  publishedWorks: number;
  separatePreprints: number;
  uniqueWorks: number;
  mergedPreprintVersions: Record<string, string | Publication["versions"]>;
  scope: string;
  sourceCounts?: Record<string, number>;
  rawRecordsTotal?: number;
  posterContributions?: number;
  cvEntryCount?: number;
  cvEntryMatches?: {
    cvId: string;
    workId: string;
    title: string;
    status: string;
  }[];
  verificationDate?: string;
  accessLimitations?: string[];
  conflicts?: unknown[];
  excludedRecords?: unknown[];
  unknownYears?: string;
};

export function publicationStatus(work: Publication) {
  return work.status ?? (work.type === "preprint" ? "preprint" : "published");
}

export const publications = [...(records as Publication[])].sort((a, b) => {
  const yearDifference = (b.year ?? -1) - (a.year ?? -1);
  if (yearDifference) return yearDifference;
  const aPublished = publicationStatus(a) === "published" ? 0 : 1;
  const bPublished = publicationStatus(b) === "published" ? 0 : 1;
  return aPublished - bPublished || a.title.localeCompare(b.title);
});
export const publicationCoverage = coverage as PublicationCoverage;
export const publishedWorks = publications.filter(
  work => publicationStatus(work) === "published"
);
export const preprints = publications.filter(work =>
  ["preprint", "under-review"].includes(publicationStatus(work))
);
export const posterWorks = publications.filter(
  work => publicationStatus(work) === "presented"
);
export const publicationYears = Array.from(
  new Set(
    publications
      .map(work => work.year)
      .filter((year): year is number => year !== null)
  )
).sort((a, b) => b - a);

export const publicationSources = [
  {
    name: "Google Scholar",
    url: "https://scholar.google.com/citations?user=AUqLvaIAAAAJ&hl=en",
  },
  {
    name: "University profile",
    url: "https://www.surrey.ac.uk/people/di-fu",
  },
  {
    name: "ORCID",
    url: "https://orcid.org/0000-0002-5385-2982",
  },
];
