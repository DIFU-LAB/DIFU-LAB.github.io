/** Ordered, eagerly bundled content entries. Files are sorted by filename. */
export function records<T>(modules: Record<string, unknown>): T[] {
  return Object.keys(modules).sort().map(key => modules[key] as T);
}
