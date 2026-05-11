/**
 * Instantánea editorial de publicación (fecha + hora en el huso local del navegador
 * al interpretar `YYYY-MM-DDTHH:mm:ss` sin sufijo Z).
 */

export type BlogPublishFields = {
  readonly date_published?: string | null;
  readonly time_published?: string | null;
  readonly creation_date: string;
};

const normalizeTimeSegment = (time: string | null | undefined): string => {
  const t = time?.trim();
  if (!t) return '00:00:00';
  const parts = t.split(':').map((s) => s.trim()).filter((s) => s.length > 0);
  if (parts.length < 2) return '00:00:00';
  const h = parts[0].padStart(2, '0');
  const m = parts[1].padStart(2, '0');
  const rawSec = parts[2] ?? '00';
  const s = rawSec.slice(0, 2).padStart(2, '0');
  return `${h}:${m}:${s}`;
};

/**
 * Igual que el ejemplo del producto: `date_published` + `T` + hora (00:00 si falta).
 * Si no hay `date_published`, se usa `creation_date`.
 */
export const getBlogPublishInstant = (post: BlogPublishFields): Date => {
  const datePublished = post.date_published?.trim();
  if (!datePublished) {
    return new Date(post.creation_date);
  }
  const merged = `${datePublished}T${normalizeTimeSegment(post.time_published)}`;
  const parsed = new Date(merged);
  return Number.isNaN(parsed.getTime()) ? new Date(post.creation_date) : parsed;
};

export const isBlogPublished = (post: BlogPublishFields, now: Date = new Date()): boolean =>
  getBlogPublishInstant(post).getTime() <= now.getTime();

export const filterPublishedBlogPosts = <T extends BlogPublishFields>(
  posts: readonly T[],
  now: Date = new Date(),
): T[] => posts.filter((post) => isBlogPublished(post, now));

/** Valor estable para `data-*` y comparación con `Date.parse` / `Date.now`. */
export const getBlogPublishInstantIso = (post: BlogPublishFields): string => {
  const d = getBlogPublishInstant(post);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString();
};
