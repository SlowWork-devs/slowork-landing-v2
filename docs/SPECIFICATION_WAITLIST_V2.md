# Especificación: landing-waitlist-v2

Documento de especificación del producto **landing-waitlist-v2**: unifica la visión del **blog SloWork en Astro** (`blog-slowork`) con la **migración de la landing histórica** (CRA + Express en `sloworkLanding`) hacia una sola propuesta Astro, waitlist incluida. Sirve como referencia para equipos, despliegue y evolución del repositorio.

**Versión del documento:** 1.3 (marzo 2026)  
**Repositorio de implementación actual:** `blog-slowork`  
**Nombre de producto / release:** **landing-waitlist-v2**  
**Memoria de decisiones:** parte del contenido de la §5 proviene de **Engram** (proyectos `slowork-unified` y `blog-slowork`).

---

## 1. Resumen ejecutivo

**landing-waitlist-v2** es el nombre del proyecto que representa el sitio público SloWork en **un solo stack Astro** (home, páginas legales, programa impact, about, blog y **lista de espera con persistencia**), desplegable de forma coherente (p. ej. Vercel con adapter serverless), con **i18n** `es` / `en` alineada a la landing anterior y SEO unificado.

La implementación vive hoy principalmente en **`blog-slowork`**, que ha dejado de ser “solo blog” para incorporar las piezas que antes dependían de **sloworkLanding** (React) y de backends externos o paralelos.

En documentación interna y memoria de equipo, la misma línea arquitectónica se denomina a veces **slowork-unified** (producto/arquitectura); el código permanece bajo la carpeta del repo **`blog-slowork`**.

La **unificación** (landing React + blog en un solo sitio Astro) consiste en:

- Sustituir la SPA React como fuente de verdad de la landing por **rutas y layouts Astro**.
- **Eliminar el servidor Express** del camino crítico: waitlist y email pasan por **API Routes** de Astro + Prisma/Nodemailer.
- Mantener o mejorar **paridad de URLs** y de experiencia (idioma, formularios, legales).
- Centralizar **waitlist + email de bienvenida** en el mismo proyecto que sirve el front, con validación y capa de datos acotada.

---

## 2. Objetivos del producto

| Objetivo | Descripción |
|----------|-------------|
| **Un solo dominio y un solo generador de sitio** | Canonical, sitemap y `hreflang` coherentes con `https://www.slowork.app` (u dominio definitivo). |
| **Waitlist operativa** | Registro en base de datos (PostgreSQL vía Prisma), respuestas HTTP claras, telemetría de errores; email de bienvenida vía SMTP. |
| **Blog estático en repo** | Content Collections Markdown/MDX; slugs y traducciones vía frontmatter (`id`, `translationSlug`, `language`). |
| **i18n predecible** | Rutas bajo `/{lang}/…` con `lang ∈ { es, en }`; cookie `slowork-language` y redirección desde `/`. |
| **Rendimiento y SEO** | Astro 6, Tailwind 4, imágenes optimizadas donde aplica; sitemap dinámico que incluye landing + posts; JS de cliente mínimo (sin SPA). |

### 2.1 No objetivos (explícitos)

- Replicar pixel a pixel todo el JS de la home CRA sin revisión (animaciones, carruseles): se prioriza **equivalencia de negocio y marca**, no necesariamente la misma cantidad de cliente.
- Mantener indefinidamente **dos** fuentes de verdad para el blog (API `api.slowork.app` + Markdown): la especificación asume **Markdown en repo** como SSOT del blog en v2 salvo decisión explícita en contra.

---

## 3. Alcance funcional (landing-waitlist-v2)

### 3.1 Rutas públicas principales

Implementación de referencia: `src/pages/` en `blog-slowork`.

| Área | Patrón de ruta | Notas |
|------|----------------|--------|
| Raíz | `/` | Middleware: 302 a `/es/` o `/en/` según cookie `slowork-language` y `Accept-Language`; `index.astro` como respaldo mínimo. |
| Home | `/es/`, `/en/` | Contenido tipo landing (hero, secciones, CTA waitlist). |
| Blog índice | `/es/blog/`, `/en/blog/` | Listados filtrados por `language` en la colección. |
| Post | `/es/blog/[slug]/`, `/en/blog/[slug]/` | Slug derivado del fichero en la colección. |
| About | `/es/about-us/`, `/en/about-us/` | Paridad con naming moderno (histórico React: `/about`). |
| Impact | `/es/impact-program/`, `/en/impact-program/` | |
| Legales | `/es/privacy-policy/`, … | Cookies, aviso legal, términos; componentes bajo `src/components/legal/`. |
| Fallback | `/[lang]/[...missing]` | Comportamiento para rutas no resueltas dentro del idioma. |

### 3.2 APIs de runtime (SSR)

| Endpoint | Método | Rol |
|----------|--------|-----|
| `/api/waitlist/` | `POST` | Alta en waitlist; cuerpo validado con Zod; persistencia Prisma; manejo de duplicados (409). **Cliente:** usar barra final por coherencia con `trailingSlash: 'always'`. |
| `/api/welcome/` | `POST` | Disparo de email de bienvenida (payload validado). |

Ambas rutas están definidas como **no prerender** (`prerender = false`).  
**Retirados del alcance actual** (decisión registrada en Engram): `GET /api/referral-status`, `POST /api/verify-recaptcha` y toda la integración reCAPTCHA v2 asociada.

### 3.3 SEO y descubrimiento

- **`/sitemap.xml`**: generación en servidor (`src/pages/sitemap.xml.ts`); incluye rutas de landing fijas + URLs de posts desde la colección `blog`. Se abandonó `@astrojs/sitemap` en favor de este endpoint **SSR** con `<urlset>` explícito, alineado a URLs reales.
- **`/robots.txt`**: implementación dedicada (`src/pages/robots.txt.ts`), no el fichero estático legacy de `public/`.
- **`rss.xml`**: feed RSS (revisar periódicamente alineación de URLs públicas con el patrón `/{lang}/blog/...`).
- **Layouts**: `MainLayout.astro` con canonical, OG, **View Transitions** (`ClientRouter`) y **Partytown** para GA4 opcional (`PUBLIC_GA_ID`, snippet `gtag`; no GTM por defecto).
- **`trailingSlash: 'always'`** en `astro.config.mjs`: canonicals, sitemap y `fetch` del cliente deben usar **barra final** en rutas de aplicación.

---

## 4. Arquitectura técnica (blog-slowork como base)

### 4.1 Stack

| Capa | Tecnología |
|------|------------|
| Framework | **Astro ^6** |
| Salida | **`output: 'server'`** + adapter **`@astrojs/vercel`** (import canónico en la versión actual del proyecto). |
| Estilos | **Tailwind CSS v4** (`@tailwindcss/vite`) |
| Contenido | **Content Collections** + `@astrojs/mdx` |
| Datos waitlist | **Prisma** + PostgreSQL (`Waitlist` → tabla `waitlists`) |
| Validación entrada | **Zod** en `src/models/` |
| Email | **Nodemailer** (servicios en `src/services/`) |
| Navegación cliente | **View Transitions** (`ClientRouter` en layout) |
| Node | **`>=22.12.0`** (`package.json` engines) |

### 4.2 Organización del código (SloWork manifesto)

- **`src/models/`**: esquemas Zod y tipos (p. ej. `waitlist`, `welcome-email`, `i18n`, `legal`, `about`, `headerNav`).
- **`src/services/`**: lógica de negocio y side-effects (waitlist, email).
- **`src/pages/api/`**: endpoints HTTP finos que delegan en servicios; respuestas JSON vía **`src/lib/http.ts`** (`jsonResponse`).
- **`src/components/`**, **`src/layouts/`**: UI.
- **`src/lib/`**: utilidades (Prisma singleton, SEO, hreflang, bundles legales, copy home/about/nav, telemetría waitlist).

### 4.3 Datos: waitlist

Modelo Prisma (`prisma/schema.prisma`): campos de negocio (`firstName`, `email`, `phone`, `instagram`, `linkedin`, `preferredContact`, `communityInterest`, metadatos de request). **Sin lógica de referidos** en payload, servicio ni esquema: eliminados endpoint de referral, cookies y campo Prisma asociado (la columna en RDS puede persistir hasta migración DBA).

El servicio `registerWaitlistEntry` intenta `create` completo y, si Prisma falla (p. ej. desalineación de columnas), un **segundo intento mínimo** con `email` + metadatos; si ambos fallan → `persist_failed` y la API responde **503**.

**Prisma 7:** la URL del datasource no vive en `schema.prisma`; se configura en **`prisma.config.ts`**. `prisma generate` exige `DATABASE_URL` (placeholder local aceptable si no hay secretos).

### 4.4 Variables de entorno

Referencia: `.env.example` en la raíz del repo.

- **`DATABASE_URL`**: conexión PostgreSQL (preferida para Prisma).
- **Fallback legacy**: `DB_*_LANDING` admitidos en `src/lib/prisma.ts` para construir URL si hiciera falta.
- **`GODADDY_EMAIL`**, **`GODADDY_PASS`**: SMTP (nombres históricos; host efectivo en servicio de email).
- **`PUBLIC_GA_ID`**: opcional, GA4 (`G-…`) vía Partytown en `MainLayout`.
- **`VERCEL_URL`**: usado en config Astro para URLs en previews; producción apunta a `https://www.slowork.app` cuando no hay preview.

### 4.5 Árbol del repositorio (`blog-slowork`)

Vista orientativa de carpetas y ficheros relevantes. **No** incluye `node_modules/`, `dist/`, `.vercel/`, `.astro/` ni el volumen completo de `src/assets/` ni de `src/content/blog/**/*.md`.

```
blog-slowork/
├── astro.config.mjs
├── prisma.config.ts
├── package.json
├── tsconfig.json
├── .env.example
├── README.md
├── prisma/
│   └── schema.prisma
├── public/
│   └── …
├── docs/
│   ├── SPECIFICATION_WAITLIST_V2.md
│   └── RESUMEN-PARA-INTEGRACION-LANDING.md
├── scripts/
├── archive/
│   └── blog/
├── src/
│   ├── middleware.ts
│   ├── content.config.ts
│   ├── consts.ts
│   ├── assets/
│   │   ├── images/              # hero, impact, carrusel, marca
│   │   ├── blog_covers/         # portadas WebP (colección blog)
│   │   ├── blog_assets_*/       # ilustraciones embebidas en posts
│   │   └── …
│   ├── content/
│   │   └── blog/
│   │       ├── es/              # *.md | *.mdx
│   │       └── en/
│   ├── data/
│   │   └── legal/
│   │       ├── es.json
│   │       └── en.json
│   ├── layouts/
│   │   ├── MainLayout.astro
│   │   └── BlogPost.astro
│   ├── models/
│   ├── services/
│   ├── lib/
│   ├── plugins/
│   │   └── rehype-wrap-tables.mjs
│   ├── styles/
│   │   └── global.css
│   ├── pages/
│   │   ├── index.astro
│   │   ├── robots.txt.ts
│   │   ├── sitemap.xml.ts
│   │   ├── rss.xml.js
│   │   ├── api/
│   │   │   ├── waitlist.ts
│   │   │   └── welcome.ts
│   │   └── [lang]/
│   │       ├── index.astro
│   │       ├── about-us.astro
│   │       ├── impact-program.astro
│   │       ├── privacy-policy.astro
│   │       ├── cookies-policy.astro
│   │       ├── legal-notice.astro
│   │       ├── terms-and-conditions.astro
│   │       ├── [...missing].astro
│   │       └── blog/
│   │           ├── index.astro
│   │           └── [slug].astro
│   └── components/
│       ├── home/
│       ├── sections/
│       ├── legal/
│       ├── features/
│       └── ui/
└── .vscode/
```

---

## 5. Decisiones técnicas y arquitectura (memoria Engram)

Esta sección consolida decisiones explícitas guardadas en **Engram** para los proyectos **slowork-unified** y **blog-slowork**. Si el código diverge, prima el repositorio; Engram sirve como registro de intención y contexto.

### 5.1 Unificación Astro 6 frente a React + Express

- Un solo proyecto Astro sustituye **landing React** (`sloworkLanding`) y **blog**: rutas bajo `src/pages/[lang]/` (home, blog, legales, impact, about).
- Home migrada a **componentes Astro** y `<script>` donde hace falta, con datos i18n centralizados (p. ej. `src/lib/homeContent.ts`).
- **Sin servidor Express** en el flujo público: API Routes en `src/pages/api/`.
- **Rama de trabajo** frecuente en sesiones documentadas: `feature/astro-v6-migration`.

### 5.2 Middleware, cookie de idioma y respaldo

- **`src/middleware.ts`**: solo intercepta **`/`** → **302** a `/es/` o `/en/`.
- Prioridad: cookie **`slowork-language`** válida; si no, **`Accept-Language`** (calidad `q` y orden; entre `es` y `en` se documenta prioridad a **inglés** cuando aplica; fallback **español**).
- **`Set-Cookie`**: `Path=/`, `SameSite=Lax`, **`Secure` en producción**.
- Lógica tipada en **`src/models/i18n.ts`**.

### 5.3 SEO: sitemap SSR, hreflang y trailing slash

- **`buildI18nAlternates()`** (`src/lib/hreflang.ts`): alternates `es`, `en` y **`x-default`** apuntando a la URL en español.
- **BlogPost** calcula parejas de posts / `hreflang` según traducciones.
- Eliminada integración **`@astrojs/sitemap`** y `public/robots.txt` estático en favor de endpoints SSR que reflejan el sitio real.
- Fichero **`sitemap.xml.ts`** (no índice de sitemaps): raíz XML `<urlset>` acorde al estándar.

### 5.4 Assets de home y legales tipados

- Imágenes de marca (hero vídeo/poster, carrusel, tarjetas, textura globo, etc.) en **`src/assets/images/`**, importadas desde `homeContent` como `ImageMetadata` o `?url` para MP4; orientación a **menos dependencia de CDN** en la home.
- Textos legales e Impact migrados desde la landing legacy a **`src/data/legal/{es,en}.json`** con tipos en **`src/models/legal.ts`**, resolución vía **`getLegalBundle`**, utilidades como **`termsLinkify`** para marcadores legacy (`<1>`), componentes en **`src/components/legal/*.astro`** con `.prose`.

### 5.5 Waitlist, seguridad y manifiesto

- Refactor alineado al **manifiesto SloWork**: Zod en models, servicios con Prisma/Nodemailer, rutas API como orquestación fina.
- **reCAPTCHA v2 retirado por completo** (widget, script, variables, endpoint verify). **Pendiente acordado:** **reCAPTCHA v3 basado en score** (servidor valida `score` y `action` tras `grecaptcha.execute` en cliente).
- **Referidos retirados** del flujo público waitlist (ver §4.3).

### 5.6 Telemetría waitlist

- Logs detallados en **`import.meta.env.DEV`**.
- En **Vercel** (`VERCEL=1`): timings de registro y fases Prisma útiles para latencia RDS.
- Errores de base de datos: **`console.error`** sin PII (`src/lib/waitlist-telemetry.ts` y servicio).

### 5.7 Landing UX: header, hero, redes y marketing

- **Header** fijo: en home, estado inicial tipo vidrio sobre hero; tras scroll (>50 px) clase **`.header-scrolled`**. Atributo/cookie **`data-is-home`** para no aplicar comportamiento de home en páginas internas. Logo con filtro CSS para contraste sobre vídeo cuando el header es claro sobre fondo oscuro.
- **Hero**: copy y combinaciones alineadas a la landing histórica; primera línea con acento **`text-soft-blue`** (token **`--color-soft-blue`**, p. ej. `#779ed3`); rotador CSS con clases **`.rotator-text`**, **`.word-exit`**, **`.word-enter`** (sin máquina de escribir); intervalos desincronizados entre primera palabra y frase.
- **Redes**: fuente única **`src/lib/socialLinks.ts`** (`SLOWORK_SOCIAL_LINKS`), enlaces a **perfiles** SloWork (no “share intent”), barra en **`SocialShareBar.astro`** dentro de `MainLayout`.
- **Impact** como sección de marketing: **`src/components/sections/ImpactProgram.astro`**; página dedicada con layout estándar. Decisión de asset: **`src/assets/images/slowork-impact.avif`** como imagen de hero y CTA final (formato AVIF, `<Image />`, eager en hero, lazy en CTA).
- **About**: **`sections/AboutUs.astro`**, modelo y copy dedicados; reveal con **`.home-reveal`** e **IntersectionObserver** (desconectar al re-enlazar en navegación).
- **Navegación**: **`src/models/headerNav.ts`** + **`src/lib/headerNavCopy.ts`**; rutas con **trailing slash** (`/${lang}/about-us/`, `/${lang}/impact-program/`).
- **Waitlist global**: **`HomeWaitlistModal`** montado en **`MainLayout`** para todas las rutas; delegación de clicks en **`[data-open-waitlist]`** con **`AbortController`**; CTA header desktop como **`<button data-open-waitlist>`**; **`body[data-menu-open="true"]`** en drawer móvil para ocultar anclas como **`.waitlist-landing-hook`** y evitar solapamiento con el gancho flotante.

### 5.8 View Transitions y hero

- El rotador del hero se inicializa en **`astro:page-load`**.
- Antes de cada init: **`heroRotatorCleanup`** limpia `setInterval`, `setTimeout` de arranque y timeouts pendientes de animación (evita duplicados al volver Blog → Home con View Transitions).
- **Logo** enlaza a `/${language}/` (props tipadas), no solo a `/`.

### 5.9 Tooling Vite / TypeScript / Tailwind

- **Alias `@/*` → `./src/*`** en `tsconfig.json`; imports unificados en `src/`.
- **Cliente waitlist:** `fetch` a **`/api/waitlist/`** y **`/api/welcome/`** con barra final.
- **UX formulario:** estados `data-status`, `data-busy`; copy `sendFailed`; si `!response.ok` o fallo de red, restaurar botón y mostrar mensaje (priorizar `message` JSON del servidor).
- **Tailwind 4:** **`@source`** en `global.css` escaneando `src/**/*.{astro,html,js,ts,tsx,md,mdx}`.
- **Vite:** `server.watch.usePolling` (Linux/WSL), **`optimizeDeps.exclude: ['zod']`**, **`ssr.noExternal: ['@tailwindcss/vite']`**.
- **Carruseles** (`HomeFeatures`, `HomeValueProposition`): handles de intervalo tipados como **`number | undefined`** en cliente para no chocar con `NodeJS.Timeout` en tipos mixtos.

### 5.10 Patrones de calidad y contenido (blog)

Registrados en Engram como convenciones de equipo:

- **Commits** agrupados por responsabilidad (p. ej. `seo(sitemap)` / `seo(robots)` / `seo(meta)`; `perf(fonts)` vs `perf(lcp)`; `style(prose)` vs `content(blog)`).
- **Rendimiento:** Fontsource Poppins en lugar de Google Fonts en CDN; hero LCP con `loading="eager"`, `fetchpriority="high"`, WebP; PostCard con prioridad de carga donde aplica.
- **Blog:** portadas **`localImage`** en `src/assets/blog_covers/*.webp`; no duplicar hero como `![...]()` al inicio del `.md`; **un solo H1** por página (título en layout, secciones con `##` en markdown).
- **Prose:** enlaces con contraste y estados `:focus-visible`; listas editoriales (marcadores custom, variante list-card).
- **Responsive / a11y:** grid 1 columna hasta `lg`; Footer/PostCard con contraste AA y anillos `focus-visible`; header móvil drawer minimalista al estilo landing original.

### 5.11 Backlog explícito (Engram)

Pendientes acordados para seguimiento entre sesiones:

1. Animación de la “bola del mundo” / globo en home.  
2. Sección **Contact Us**.  
3. Mejora de hover de menú y botones.  
4. Verificar flujo de email de bienvenida (welcome + SMTP + logs en Vercel).  
5. Nuevos artículos de blog según calendario editorial.

---

## 6. Relación con sloworkLanding (legacy)

La landing en **Create React App** + **Express** (`sloworkLanding`) es la línea base funcional y de rutas. Los documentos `sloworkLanding/docs/RESUMEN-PARA-MIGRACION-ASTRO.md` y `blog-slowork/docs/RESUMEN-PARA-INTEGRACION-LANDING.md` siguen siendo útiles para **diff** de comportamiento, con matices:

- **blog-slowork** ya incorpora muchas páginas que el resumen de integración listaba como “pendientes en el repo del blog” (legales, home, impact, waitlist).
- Las **URLs del blog** pueden seguir sin coincidir 1:1 con slugs históricos generados con `slugify(título)` en React; **landing-waitlist-v2** debe incluir política explícita de **redirecciones 301** o aceptación de nueva estructura de slugs.
- El formulario legacy usaba **reCAPTCHA v2** y API propia; en Astro actual **no hay CAPTCHA** (ver §5.5 y §9): mitigar spam por otros medios hasta **v3**.

---

## 7. Iniciativa de unificación (slowork-unified)

Se entiende por unificación el trabajo de:

1. **Un solo repositorio y un solo despliegue** orientado a producción (posible renombrado del repo a `landing-waitlist-v2` o monorepo con paquete homónimo; decisión de equipo).
2. **Eliminar duplicación** entre `sloworkLanding` y `blog-slowork` en documentación, assets y copy.
3. **Alinear métricas y analítica** con lo que existía en `public/index.html` del CRA; hoy GA4 vía Partytown + `PUBLIC_GA_ID` (contenedor **GTM** requeriría bloque adicional explícito).
4. **Definir el rol de `api.slowork.app`** si sigue vivo: solo administración, solo lectura legacy, o retirada.

---

## 8. Criterios de aceptación (v2)

- Un usuario puede recorrer **home → blog → post** en `es` y `en` con conmutador de idioma coherente (`buildI18nAlternates` / `headerAlternateLink` donde aplique).
- El formulario de waitlist puede enviarse a **`POST /api/waitlist/`** y persistir en PostgreSQL; duplicados reciben respuesta controlada.
- Tras alta, el flujo puede llamar a **`POST /api/welcome/`** según el diseño de producto (llamada explícita desde el cliente o orquestación en servidor).
- Sitemap incluye al menos todas las rutas de landing previstas + posts publicados, con **barra final** en URLs de página.
- Legales accesibles en `/{lang}/…-policy/` (y análogos) sin depender del servidor React.

---

## 9. Riesgos y deuda conocida

| Riesgo | Mitigación sugerida |
|--------|---------------------|
| Slugs blog ≠ histórico SEO | Mapa de redirecciones; monitorización 404. |
| Spam / abuso waitlist sin CAPTCHA | Rate limiting, honeypot, o **reCAPTCHA v3** (pendiente §5.5). |
| RSS con enlaces desalineados | Auditar `rss.xml.js` frente a rutas reales. |
| Dos despliegues en paralelo (CRA + Astro) | Cortar tráfico por rutas o dominio con plan de rollback. |
| Secretos SMTP en entorno | Solo variables de entorno en CI/hosting; rotación si hubo exposición. |
| Columnas legacy en RDS (referidos) | Migración DBA o convivencia hasta limpieza. |

---

## 10. Referencias en este monorepo / workspace

| Documento | Ubicación |
|-----------|-----------|
| Resumen blog → landing (contexto anterior) | `blog-slowork/docs/RESUMEN-PARA-INTEGRACION-LANDING.md` |
| Resumen migración CRA → Astro | `sloworkLanding/docs/RESUMEN-PARA-MIGRACION-ASTRO.md` |
| README producto blog | `blog-slowork/README.md` |
| Esquema waitlist | `blog-slowork/prisma/schema.prisma` |
| Middleware idioma | `blog-slowork/src/middleware.ts` |
| Memoria persistente (decisiones de sesión) | **Engram** — proyectos `slowork-unified`, `blog-slowork` (tópicos p. ej. `slowork-unified/assets-legal-seo-sitemap`, `blog-slowork/waitlist-api-architecture`, `slowork-unified/home-hero-vt-rotator`, `architecture/aliases-api-waitlist`) |

---

## 11. Glosario

| Término | Significado |
|---------|-------------|
| **landing-waitlist-v2** | Nombre del producto / release: landing unificada en Astro con waitlist v2. |
| **slowork-unified** | Nombre de arquitectura / producto y línea de trabajo de unificación (landing + blog), usado en memoria de equipo (Engram); código en repo `blog-slowork`. |
| **blog-slowork** | Repositorio Astro que implementa hoy la mayor parte del alcance. |
| **sloworkLanding** | Legacy React + Express; fuente de paridad y migración. |

---

*Este documento debe actualizarse cuando cambien rutas canónicas, política de blog (MD vs API), o el proveedor de despliegue. Las decisiones reflejadas en Engram deben revalidarse tras refactors grandes.*
