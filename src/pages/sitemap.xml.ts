import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = false;

/**
 * Rutas con barra final: alineado con `trailingSlash: 'always'` en `astro.config.mjs`
 * y con los `<link rel="canonical">` del sitio (evita avisos de redirección en Search Console).
 */
const LANDING_PATHS = [
  '/',
  '/es/',
  '/en/',
  '/es/blog/',
  '/en/blog/',
  '/es/about-us/',
  '/en/about-us/',
  '/es/privacy-policy/',
  '/en/privacy-policy/',
  '/es/cookies-policy/',
  '/en/cookies-policy/',
  '/es/legal-notice/',
  '/en/legal-notice/',
  '/es/terms-and-conditions/',
  '/en/terms-and-conditions/',
  '/es/impact-program/',
  '/en/impact-program/',
] as const;

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function blogPostPath(lang: string, slug: string): string {
  const base = `/${lang}/blog/${slug}`;
  return base.endsWith('/') ? base : `${base}/`;
}

export const GET: APIRoute = async ({ site, url }) => {
  const origin = (site ?? new URL(url.origin)).origin.replace(/\/$/, '');
  const posts = await getCollection('blog');

  const blogPaths = posts.flatMap((post) => {
    const lang = post.data.language ?? post.id.split('/')[0];
    if (lang !== 'es' && lang !== 'en') return [];
    const slug = post.id.split('/').pop()?.replace(/\.(md|mdx)$/, '');
    if (!slug) return [];
    return [blogPostPath(lang, slug)];
  });

  const allPaths = [...new Set([...LANDING_PATHS, ...blogPaths])];
  const urlEntries = allPaths
    .map((path) => {
      const loc = path === '/' ? `${origin}/` : `${origin}${path}`;
      const segments = path.split('/').filter(Boolean);
      const priority =
        segments.length >= 3 && path.includes('/blog/') ? '0.75' : '0.9';
      return `<url><loc>${escapeXml(loc)}</loc><changefreq>weekly</changefreq><priority>${priority}</priority></url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
