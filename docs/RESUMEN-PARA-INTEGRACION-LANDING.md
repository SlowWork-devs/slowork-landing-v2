# Slowork Blog (`slowork-landing-v2`) — Resumen técnico para integración con la landing

Documento de referencia del proyecto **Astro** del blog, pensado para **fusionarlo con la futura landing unificada** (por ejemplo sustituyendo o coexistiendo con el blog React de `sloworkLanding`). Incluye rutas, contenido, estilos, gaps respecto a producción actual y checklist de integración.

---

## 1. Visión general

| Aspecto | Valor |
| -------- | ------ |
| Paquete npm | `slowork-landing-v2` |
| Tipo de módulo | ESM (`"type": "module"`) |
| Node requerido | `>=22.12.0` (ver `package.json`) |
| Framework | **Astro ^6.0.4** (el README habla de “v5”; el lockfile/`package.json` apunta a 6.x) |
| Estilos | **Tailwind CSS v4** vía plugin **Vite** `@tailwindcss/vite` |
| Contenido | **Content Collections** con loader `glob` sobre Markdown/MDX |
| `site` (canonical base) | `https://slowork-blog.vercel.app` en `astro.config.mjs` |

No hay variables de entorno obligatorias en el código revisado; el proyecto es mayormente estático.

---

## 2. Scripts

```json
"dev": "astro dev",
"build": "astro build",
"preview": "astro preview",
"astro": "astro"
```

Salida de build: carpeta **`dist/`** (no `build/` como CRA).

---

## 3. Integraciones Astro (`astro.config.mjs`)

| Integración | Uso |
|-------------|-----|
| `@astrojs/mdx` | Contenido MDX con pipeline rehype compartido |
| `@astrojs/sitemap` | Sitemap con **`i18n`**: `defaultLocale: 'es'`, locales `es` y `en` |
| `tailwindcss` (Vite) | Procesa `src/styles/global.css` |

### Markdown / MDX — rehype

Aplicado tanto a `markdown` global como a la integración MDX:

1. **`rehype-wrap-tables`** (`src/plugins/rehype-wrap-tables.mjs`): envuelve `<table>` en `<div class="table-wrapper overflow-x-auto …">` para scroll horizontal en móvil.
2. **`rehype-external-links`**: enlaces externos con `target="_blank"` y `rel="noopener noreferrer"`.

---

## 4. Estructura de rutas y páginas

### Raíz

| Ruta | Archivo | Comportamiento |
|------|---------|----------------|
| `/` | `src/pages/index.astro` | Meta refresh a `/es/blog/` + script que envía a `/en/blog/` si `navigator.language` empieza por `en`; fallback enlace manual a `/es/blog/` |

### Blog

| Ruta | Archivo |
|------|---------|
| `/es/blog/` | `src/pages/es/blog/index.astro` |
| `/en/blog/` | `src/pages/en/blog/index.astro` |
| `/es/blog/[slug]/` | `src/pages/es/blog/[slug].astro` |
| `/en/blog/[slug]/` | `src/pages/en/blog/[slug].astro` |

- **`getStaticPaths`** en cada `[slug].astro` filtra posts por `data.language === 'es'` o `'en'` según la carpeta.
- El **slug en URL** se deriva del **nombre del fichero** (`post.id` de la colección, p. ej. `en/how-to-get-a-digital-nomad-visa-in-indonesia-a-complete-guid.md` → slug `how-to-get-a-digital-nomad-visa-in-indonesia-a-complete-guid`), **no** del título completo ni del slug histórico de la landing React.

### Otras

| Ruta | Archivo | Notas |
|------|---------|--------|
| `/about` | `src/pages/about.astro` | Página plantilla “About Me” con layout `BlogPost.astro` y texto Lorem; **no** está bajo `/en/about` ni `/es/about`. |
| `/rss.xml` | `src/pages/rss.xml.js` | Feed RSS (ver sección “Problemas conocidos”). |

---

## 5. Content Collections (`src/content.config.ts`)

### Colección `blog`

- **Loader**: `glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' })`.
- **Esquema Zod** (`schema`):

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | `number` | Identificador compartido entre traducciones (p. ej. mismo `id` en par ES/EN). |
| `title` | `string` | |
| `date` | `coerce.date()` | |
| `time` | `string` | En esquema; uso principalmente metadato. |
| `image` | `string` | URL externa (p. ej. ImageKit) o `""`; fallback a `<img>`. |
| `localImage` | `image().optional()` | Referencia a `astro:assets` (Webp en `blog_covers/`, rutas relativas en frontmatter). |
| `excerpt` | `string` | SEO y listados. |
| `keywords` | `string` | |
| `language` | `'es' \| 'en'` | Filtra índices y rutas dinámicas. |
| `translationSlug` | `string` optional | **Slug del otro idioma** para el conmutador `hreflang` en `BlogPost.astro` (enlace a `/en/blog/xxx/` o `/es/blog/xxx/`). |

No hay segunda colección activa en `content.config.ts` aunque en `.astro/` puedan existir esquemas antiguos (p. ej. `hosts`): **solo `blog`** está exportado.

### Inventario de posts

Hay **20 artículos por idioma** (40 ficheros `.md`) en `src/content/blog/en/` y `src/content/blog/es/`, emparejados por `id` y `translationSlug`.

### Archivo histórico / migración

- `archive/blog/posts-en.js`, `posts-es.js`: copia o fuente previa al formato Markdown.
- `scripts/migrate-posts-to-md.js`: genera `.md` desde `posts.js`, **trunca el slug a 60 caracteres** (`slugify`), renombra imágenes embebidas, etc. Cualquier nuevo post debe respetar convenciones de nombre de archivo si se quiere estabilidad de URL.

---

## 6. Layouts y componentes

### `src/layouts/BlogPost.astro`

- Props: metadatos del post (`title`, `excerpt`, `date`, `image`, `localImage`, `language`, `translationSlug`, etc.).
- **Hero**: `localImage` → `<Image>` Astro (WebP optimizado) + preload; si no, `image` como string en `<img>`.
- **Alternates**: `link rel="alternate" hreflang` entre idioma actual y el construido con `translationSlug` o fallback al índice del otro idioma.
- Incluye `Header`, `Footer`, `FormattedDate`, slot para el cuerpo Markdown.
- **Prose**: clases `prose prose-lg …` definidas en `global.css` (no usa el plugin `@tailwindcss/typography`; es CSS custom).

### `src/components/BaseHead.astro`

- Charset, viewport, robots, favicon, enlace a sitemap `sitemap-index.xml`, **RSS** (`rss.xml` relativo a `Astro.site`).
- Preload **Poppins 700** desde `@fontsource` (woff2).
- **Canonical**: `new URL(Astro.url.pathname, Astro.site)`.
- Open Graph / Twitter usando `title`, `description`; imagen por defecto `placeholder.png` si no se pasa otra.

### `src/components/Header.astro`

- Logo (`Logo.astro` → imagen optimizada, enlace a **`/`**).
- Nav desktop: `/{lang}/blog/`, **`/about`** (sin prefijo de idioma).
- Conmutador ES | EN: ambos enlaces usan la misma prop `alternateLink` desde la página padre (en listados: `/es/blog/` ↔ `/en/blog/`; en post: slug traducido vía layout).
- CTA “Join waiting list” → **`https://www.slowork.app/`**.
- **Drawer móvil**: imagen de fondo `menu-background.webp`, script inline para abrir/cerrar, accesibilidad básica (`aria-expanded`, Escape, overlay).

### `src/components/Footer.astro`

- Textos ES/EN inline (`translations`).
- Enlaces legales con patrón **`/${language}/privacy-policy`**, `cookies-policy`, `legal-notice`, `terms-and-conditions`.
- **Importante**: esas rutas **no existen en este repo**; están pensadas para la **landing principal** unificada.
- Botón “Contacto”: por ahora solo `console.log` en el listener (comentario sugiere mailto/modal futuro).

### `src/components/PostCard.astro`

- Tarjeta en grid; slug desde `post.id` (nombre de archivo); imagen local vs remota coherente con el layout.

### `src/components/Logo.astro`, `HeaderLink.astro`

- Logo: `src/assets/logo-slowork.png`.

### `src/components/FormattedDate.astro`

- Formatea con **`toLocaleDateString('en-us', …)`** siempre, también en posts en español (detalle de i18n mejorable).

---

## 7. Estilos (`src/styles/global.css`)

- **Tailwind v4**: `@import "tailwindcss";` y bloque **`@theme`**:
  - `--color-primary: #013333`, `--color-secondary: #e0bb44`, `--color-light-green: #ddeee5`, `--color-bg-landing: #e2e8e5`.
  - Tipografía: Poppins como `--font-sans` / `--font-heading`.
- **Fuentes**: `@fontsource/poppins` pesos 400, 600, 700, 800.
- Capa **base**: `html`/`body`, utilidades Tailwind mezcladas con `@apply`.
- Estilos editoriales extensos para **`.prose`** (enlaces accesibles, blockquotes, tablas, listas con marcadores personalizados, imágenes redondeadas).
- **`.header-scrolled`**: clase preparada para header al hacer scroll (no está cableada en `Header.astro` en la revisión actual).

**Alineación con la landing React**: la paleta y Poppins coinciden con la identidad Slowork / `sloworkLanding` (T tailwind primary/secondary similares).

---

## 8. Constantes globales (`src/consts.ts`)

```ts
export const SITE_TITLE = 'Astro Blog';
export const SITE_DESCRIPTION = 'Welcome to my website!';
```

Siguen siendo **placeholders**: afectan título del RSS, meta del índice del blog (`SITE_TITLE | Blog`), etc. Conviene sustituirlos por marca real antes de integrar en producción.

---

## 9. Públicos y assets

### `public/`

- `favicon.svg`, `robots.txt` (apunta sitemap a `slowork-blog.vercel.app`).
- No hay `favicon.ico` referenciado en `BaseHead` también como `/favicon.ico` — comprobar que exista en despliegue o unificar.

### `src/assets/`

- `logo-slowork.png`, `menu-background.webp`, placeholders.
- **`blog_covers/`**: WebPs para hero de muchos posts.
- **`blog_assets_*`**, **`blog_assets_210725`**: imágenes inline en artículos.

---

## 10. SEO y feed

- **Sitemap**: generado por `@astrojs/sitemap` con opciones i18n; URL base = `site` del config (hoy Vercel).
- **Canonical**: por pathname + `site` (al fusionar con `www.slowork.app` hay que actualizar `site` y revisar duplicados con el blog antiguo).
- **`robots.txt`**: disallow `/_astro/`, `/api/`; sitemap absoluto al dominio actual del config.
- **RSS**: implementado en `rss.xml.js`; los `link` de cada ítem usan `/blog/${post.id}/`, donde `post.id` es el **path interno** del content layer (p. ej. `en/foo.md`), **no** la URL pública `/en/blog/foo/` → el feed probablemente genera enlaces rotos (ver abajo).

---

## 11. Diferencias críticas respecto al blog en `sloworkLanding`

| Tema | Landing React (`sloworkLanding`) | Blog Astro (`slowork-landing-v2`) |
|------|----------------------------------|------------------------------|
| Origen de posts | API `api.slowork.app` + fallback `locales/*/posts.js` | Solo Markdown en repo |
| Slug URL | `slugify(título)` completo (p. ej. en sitemap) | Nombre de fichero truncado (~60 chars) en migración |
| Prefijo idioma | `/:lang/blog/...` | `/es/blog/`, `/en/blog/` (equivalente) |
| Alternancia traducción | Lógica en React + API | `translationSlug` en frontmatter |
| Estilo | Tailwind 3 + react-markdown | Tailwind 4 + Markdown nativo Astro |
| Legal/footer | Rutas existentes en la SPA | Enlaces ya escritos hacia las mismas rutas **pendientes** en este proyecto |

**Riesgo de integración**: URLs de posts **no coinciden** uno a uno con el sitemap histórico de `www.slowork.app` si el slug se basaba en el título completo. Hace falta **tabla de redirecciones 301** o regenerar slugs para igualar el comportamiento anterior.

---

## 12. Problemas conocidos / deuda técnica (útiles al unificar)

1. **`src/pages/en/blog/index.astro`**: comentario erróneo (“Obtenemos posts en español”) mientras filtra `language === 'en'` (el código está bien; el comentario confunde).
2. **`src/pages/en/blog/[slug].astro`**: primera línea comenta `// src/pages/es/blog/[slug].astro` (copia pegada); el filtro es `en` — correcto.
3. **`consts.ts`**: título y descripción genéricos de plantilla Astro.
4. **`rss.xml.js`**: patrón de `link` probablemente incorrecto para URLs reales del sitio.
5. **Footer “Contacto”**: sin funcionalidad real.
6. **`about.astro`**: contenido dummy; ruta `/about` sin i18n en path; Header enlaza a `/about` desde cualquier idioma.
7. **`FormattedDate`**: locale fijo `en-us`.
8. **Dominio** `site`: apunta a Vercel; al merge con landing habrá que unificar `https://www.slowork.app` (o el dominio definitivo).

---

## 13. Seguridad y dependencias

- Superficie pequeña: sitio estático, sin API propia en este repo.
- Dependencias principales: `astro`, `@astrojs/mdx`, `@astrojs/rss`, `@astrojs/sitemap`, `tailwindcss`, `@tailwindcss/vite`, `@fontsource/poppins`, `rehype-external-links`, `sharp` (imágenes).

---

## 14. Checklist sugerida para “landing + Astro” en un solo producto

1. **Monorepo o carpeta única**: mover `src/content`, `src/pages/es|en/blog`, layouts y componentes del blog dentro del proyecto Astro “principal” que también sirva home, impact, legales, waitlist (o usar rutas proxy).
2. **Unificar `site` y `base`**: un solo dominio, un solo sitemap (o índice que incluya blog + estáticas).
3. **Rutas legales**: implementar `/:lang/privacy-policy`, etc., o ajustar `Footer.astro` a las rutas reales.
4. **Redirecciones**: mapear slugs antiguos (React/API) → slugs Astro para no perder SEO.
5. **Sitemap/RSS**: regenerar enlaces absolutos correctos; corregir RSS.
6. **`consts.ts`**: título, descripción y metadatos OG alineados con marca.
7. **Logo / home**: decidir si `/` es home de producto o redirección solo al blog; al integrar con landing, el logo suele apuntar a `/{lang}/`.
8. **Tailwind**: convivencia Tailwind 3 (landing legada) vs 4 (blog); en un solo Astro normalmente una sola versión y un solo `global.css`.
9. **Contenido MD vs CMS**: si sigue existiendo API `api.slowork.app`, decidir fuente única (solo MD, solo API, o sync).
10. **Node 22**: el motor exigido por `package.json` debe estar en CI y en el host (Vercel/Netlify/Render).

---

## 15. Referencia rápida de archivos

| Tema | Ruta |
|------|------|
| Config Astro | `astro.config.mjs` |
| Colección blog | `src/content.config.ts` |
| Estilos globales | `src/styles/global.css` |
| Layout artículo | `src/layouts/BlogPost.astro` |
| Índices blog | `src/pages/es|en/blog/index.astro` |
| Detalle post | `src/pages/es|en/blog/[slug].astro` |
| Redirect raíz | `src/pages/index.astro` |
| Migración desde JS | `scripts/migrate-posts-to-md.js` |
| Rehype tablas | `src/plugins/rehype-wrap-tables.mjs` |

---

Este documento complementa `README.md` del repo (visión de producto y stack) con el detalle necesario para planificar la **fusión con la landing** sin perder rutas, SEO ni paridad de marca con `sloworkLanding`.
