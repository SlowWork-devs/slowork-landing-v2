// @ts-check

import mdx from '@astrojs/mdx';
import partytown from '@astrojs/partytown';
import rehypeExternalLinks from 'rehype-external-links';
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

import tailwindcss from '@tailwindcss/vite';
import rehypeWrapTables from './src/plugins/rehype-wrap-tables.mjs';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  /** Canonicals y sitemap usan barra final; coherente con Vercel + Search Console. */
  trailingSlash: 'always',
  adapter: vercel(),
  site: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://www.slowork.app',
  integrations: [
    mdx({
      rehypePlugins: [
        rehypeWrapTables,
        [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }],
      ],
    }),
    partytown({
      config: {
        forward: ['dataLayer.push', 'gtag'],
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