/** Content fields retain their canonical English values and stable IDs.
 * Each record may override any displayed text using translations[language][field].
 * Missing/empty translations fall back to the canonical field, never to UI keys.
 */
export type ContentTranslations = Record<string, Record<string, string>>;
export function contentText(record: unknown, field: string, language: string): string {
  if (!record || typeof record !== "object") return "";
  const value = record as Record<string, unknown> & { translations?: ContentTranslations };
  const translated = value.translations?.[language]?.[field];
  if (typeof translated === "string" && translated.trim()) return translated;
  return typeof value[field] === "string" ? value[field] as string : "";
}
