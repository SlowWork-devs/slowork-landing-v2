// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import rehypeExternalLinks from 'rehype-external-links';
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import rehypeWrapTables from './src/plugins/rehype-wrap-tables.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://example.com',
  integrations: [
    mdx({
      rehypePlugins: [
        rehypeWrapTables,
        [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }],
      ],
    }),
    sitemap(),
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