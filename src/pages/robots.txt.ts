import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = ({ site, url }) => {
  const base = site ?? new URL(url.origin);
  const sitemapUrl = new URL('/sitemap.xml', base).href;
  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /_astro/',
    'Disallow: /api/',
    '',
    `Sitemap: ${sitemapUrl}`,
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
