// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import rehypeExternalLinks from 'rehype-external-links';
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

import tailwindcss from '@tailwindcss/vite';
import rehypeWrapTables from './src/plugins/rehype-wrap-tables.mjs';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: vercel(),
  site: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://www.slowork.app',
  image: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'dkhbyo7gs39kb.cloudfront.net' },
    ],
  },
  integrations: [
    mdx({
      rehypePlugins: [
        rehypeWrapTables,
        [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }],
      ],
    }),
    sitemap({
      i18n: {
        defaultLocale: 'es',
        locales: {
          es: 'es',
          en: 'en',
        },
      },
    }),
  ],
  markdown: {
    rehypePlugins: [
      rehypeWrapTables,
      [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }],
    ],
  },

  vite: {
    plugins: [tailwindcss()],
  },
});