import metadata from "@content/site/publication-citations.json";
import { publicationStatus, type Publication } from "./publications";

type CitationMetadata = {
  doi: string;
  title: string;
  sourceUrl: string;
  authors: { family: string; given: string }[];
  containerTitle?: string;
  year?: number;
  volume?: string;
  number?: string;
  pages?: string;
  articleNumber?: string;
};
const citations = metadata as Record<string, CitationMetadata>;

export function getPublicationUrl(work: Publication): string {
  return work.doi.trim() ? `https://doi.org/${work.doi.trim()}` : work.url;
}

/** Escape text fields without changing the stored scholarly record. */
export function escapeBibTeX(value: string): string {
  const escapes: Record<string, string> = {
    "\\": "\\textbackslash{}",
    "{": "\\{",
    "}": "\\}",
    "&": "\\&",
    "%": "\\%",
    $: "\\$",
    "#": "\\#",
    _: "\\_",
    "~": "\\textasciitilde{}",
    "^": "\\textasciicircum{}",
  };
  return value
    .replace(/[\\{}&%$#_~^]/g, char => escapes[char])
    .replace(/\s+/g, " ")
    .trim();
}

function safeMetadata(work: Publication): CitationMetadata | undefined {
  const extra = citations[work.id];
  return publicationStatus(work) === "published" &&
    extra?.doi.toLowerCase() === work.doi.toLowerCase() &&
    extra.title === work.title
    ? extra
    : undefined;
}

function normaliseName(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();
}
function citationAuthors(work: Publication, extra?: CitationMetadata): string {
  const original = work.authorNames.length ? work.authorNames : [work.authors];
  // Only use registered family/given boundaries when they preserve source author identity/order.
  const registered = extra?.authors;
  const matches =
    registered?.length === original.length &&
    registered.every((author, i) => {
      const expected = normaliseName(original[i]);
      const family = normaliseName(author.family);
      return (
        expected.length > 0 &&
        family.length > 0 &&
        expected.includes(family) &&
        (!author.given || expected[0] === normaliseName(author.given)[0])
      );
    });
  const names = matches
    ? registered!.map(
        author => `${author.family}${author.given ? `, ${author.given}` : ""}`
      )
    : original;
  const authors = names.filter(Boolean).map(escapeBibTeX);
  if (
    work.authorsComplete === false &&
    !authors.some(name => /^(?:others|et al\.?)/i.test(name))
  )
    authors.push("others");
  return authors.join(" and ");
}

export function getPublicationCitationKey(work: Publication): string {
  let hash = 2166136261;
  for (const char of work.id)
    hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  const author =
    (work.authorNames[0] || "SEIL").split(",")[0].trim().split(/\s+/).pop() ||
    "SEIL";
  return `${author.normalize("NFKD").replace(/[^a-zA-Z0-9]/g, "")}${work.year ?? "Undated"}_${(hash >>> 0).toString(36)}`;
}

export function getPublicationCitationWarnings(work: Publication): string[] {
  return [
    ...(work.year === null ? ["Publication year unavailable."] : []),
    ...(work.authorsComplete === false ? ["Author list incomplete."] : []),
  ];
}

export function getPublicationBibTeX(work: Publication): string {
  const status = publicationStatus(work);
  const extra = safeMetadata(work);
  const entryType =
    status === "under-review"
      ? "unpublished"
      : status === "preprint" || status === "presented"
        ? "misc"
        : work.type === "journal"
          ? "article"
          : "inproceedings";
  const fields: [string, string][] = [
    ["title", `{${escapeBibTeX(work.title)}}`],
    ["author", citationAuthors(work, extra)],
  ];
  const year = extra?.year ?? work.year;
  if (year !== null && year !== undefined) fields.push(["year", String(year)]);
  if (status === "published" && (extra?.containerTitle || work.journal)) {
    fields.push([
      entryType === "article" ? "journal" : "booktitle",
      escapeBibTeX(extra?.containerTitle || work.journal!),
    ]);
  }
  if (status === "published" && extra) {
    if (extra.volume) fields.push(["volume", extra.volume]);
    if (extra.number) fields.push(["number", extra.number]);
    if (extra.pages)
      fields.push(["pages", extra.pages.replace(/[-\u2010-\u2015]+/g, "--")]);
    else if (extra.articleNumber) fields.push(["eid", extra.articleNumber]);
  }
  if (status === "under-review")
    fields.push(["note", "Manuscript under review; not formally published"]);
  else if (status === "preprint") fields.push(["note", "Preprint"]);
  else if (status === "presented") {
    fields.push([
      "howpublished",
      escapeBibTeX(work.journal || "Conference presentation"),
    ]);
    fields.push(["note", "Conference poster"]);
  }
  const url = getPublicationUrl(work);
  if (work.doi.trim()) fields.push(["doi", work.doi.trim()]);
  if (url) fields.push(["url", url]);
  if (status !== "published") {
    const arxiv = work.url.match(/arxiv\.org\/abs\/([^?#]+)/i);
    if (arxiv) {
      fields.push(["eprint", arxiv[1]], ["archivePrefix", "arXiv"]);
    }
  }
  return `@${entryType}{${getPublicationCitationKey(work)},\n${fields
    .filter(([, value]) => value)
    .map(([key, value]) => `  ${key} = {${value}}`)
    .join(",\n")}\n}\n`;
}
