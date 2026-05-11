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
  /** Imágenes del blog (API) servidas vía CloudFront. */
  image: {
    domains: ['dkhbyo7gs39kb.cloudfront.net'],
  },
  /** Canonicals y sitemap usan barra final; coherente con Vercel + Search Console. */
  trailingSlash: 'always',
  adapter: vercel(),
  /** Dominio canónico de la landing principal Slowork (`slowork-landing-v2`). En preview, Vercel expone VERCEL_URL. */
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
        // GA4 en MainLayout (type="text/partytown"). Añade p. ej. 'fbq' si integras Meta Pixel.
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
    // ESTO ES LO QUE SOLUCIONA EL 504 Y EL 404 VIRTUAL:
    optimizeDeps: {
      exclude: ['zod'], // Sacamos a Zod del bucle de pre-optimización
    },
    server: {
      watch: {
        usePolling: true, // Crucial en Linux para que el watcher no se "pille"
      },
      fs: {
        // Permite que Vite acceda a archivos fuera de la raíz si es necesario
        allow: ['..'], 
      },
    },
    // Ayuda a la resolución de módulos en SSR
    ssr: {
      noExternal: ['@tailwindcss/vite'],
    }
  },
});