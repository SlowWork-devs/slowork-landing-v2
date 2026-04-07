# Especificación: landing-waitlist-v2

Documento de especificación del producto **landing-waitlist-v2**: unifica la visión del **blog Slowork en Astro** (`slowork-landing-v2`) con la **migración de la landing histórica** (CRA + Express en `sloworkLanding`) hacia una sola propuesta Astro, waitlist incluida. Sirve como referencia para equipos, despliegue y evolución del repositorio.

**Versión del documento:** 1.5 (abril 2026)  
**Repositorio de implementación actual:** `slowork-landing-v2`  
**Nombre de producto / release:** **landing-waitlist-v2**  
**Memoria de decisiones:** parte del contenido de la §5 proviene de **Engram** (proyectos `slowork-unified` y `slowork-landing-v2`).

---

## 1. Resumen ejecutivo

**landing-waitlist-v2** es el nombre del proyecto que representa la **landing principal** y el blog de Slowork en **un solo stack Astro** (home, páginas legales, programa impact, about, blog y **lista de espera con persistencia**), desplegable de forma coherente (p. ej. Vercel con adapter serverless), con **i18n** `es` / `en` alineada a la landing anterior y SEO unificado.

La implementación vive hoy principalmente en **`slowork-landing-v2`**, que ha dejado de ser “solo blog” para incorporar las piezas que antes dependían de **sloworkLanding** (React) y de backends externos o paralelos.

En documentación interna y memoria de equipo, la misma línea arquitectónica se denomina a veces **slowork-unified** (producto/arquitectura); el código permanece bajo la carpeta del repo **`slowork-landing-v2`**.

La **unificación** (landing React + blog en un solo sitio Astro) consiste en:

- Sustituir la SPA React como fuente de verdad de la landing por **rutas y layouts Astro**.
- **Eliminar dependencias directas del front** con el backend legacy: Astro actúa como capa BFF/proxy para el flujo waitlist.
- Mantener o mejorar **paridad de URLs** y de experiencia (idioma, formularios, legales).
- Centralizar la orquestación de **waitlist + welcome email** en backend server-side del proyecto Astro.

---

## 2. Objetivos del producto

| Objetivo | Descripción |
|----------|-------------|
| **Un solo dominio y un solo generador de sitio** | Canonical, sitemap y `hreflang` coherentes con `https://www.slowork.app` (u dominio definitivo). |
| **Waitlist operativa** | Registro en API legacy vía proxy Astro (`/api/waitlist/`), respuestas HTTP claras (incl. 409), y disparo server-side de welcome email. |
| **Blog integrado por API** | Consumo de posts vía GraphQL (`SLOWORK_API_URL`) con adaptación i18n (`title/content`) en `api-service`. |
| **i18n predecible** | Rutas bajo `/{lang}/…` con `lang ∈ { es, en }`; cookie `slowork-language` y redirección desde `/`. |
| **Rendimiento y SEO** | Astro 6, Tailwind 4, imágenes optimizadas donde aplica; sitemap dinámico que incluye landing + posts; JS de cliente mínimo (sin SPA). |

### 2.1 No objetivos (explícitos)

- Replicar pixel a pixel todo el JS de la home CRA sin revisión (animaciones, carruseles): se prioriza **equivalencia de negocio y marca**, no necesariamente la misma cantidad de cliente.
- Mantener indefinidamente dos flujos de blog paralelos (Markdown y API) sin decidir SSOT operativo para producción.

---

## 3. Alcance funcional (landing-waitlist-v2)

### 3.1 Rutas públicas principales

Implementación de referencia: `src/pages/` en `slowork-landing-v2`.

| Área | Patrón de ruta | Notas |
|------|----------------|--------|
| Raíz | `/` | Middleware: 302 a `/es/` o `/en/` según cookie `slowork-language` y `Accept-Language`; `index.astro` como respaldo mínimo. |
| Home | `/es/`, `/en/` | Contenido tipo landing (hero, secciones, CTA waitlist). |
| Blog índice | `/es/blog/`, `/en/blog/` | Listado obtenido desde API GraphQL (`getBlogs`) y renderizado en cards de UI. |
| Post | `/es/blog/[slug]/`, `/en/blog/[slug]/` | Ruta mantenida; detalle puede convivir con contenido local mientras se completa migración del flujo API. |
| About | `/es/about-us/`, `/en/about-us/` | Paridad con naming moderno (histórico React: `/about`). |
| Impact | `/es/impact-program/`, `/en/impact-program/` | |
| Legales | `/es/privacy-policy/`, … | Cookies, aviso legal, términos; componentes bajo `src/components/legal/`. |
| Fallback | `/[lang]/[...missing]` | Comportamiento para rutas no resueltas dentro del idioma. |

### 3.2 APIs de runtime (SSR)

| Endpoint | Método | Rol |
|----------|--------|-----|
| `/api/waitlist/` | `POST` | Proxy server-side: valida payload con Zod, reenvía a `${SLOWORK_API_URL}/api/waitlist`, mantiene error 409 para email duplicado y, en éxito, dispara `${SLOWORK_API_URL}/api/welcome` con `lang` de cookie `slowork-language`. **Cliente:** usar barra final por coherencia con `trailingSlash: 'always'`. |
| `/api/welcome/` | `POST` | Endpoint local disponible para envío SMTP directo; en el flujo actual de waitlist no lo invoca el frontend. |

Ambas rutas están definidas como **no prerender** (`prerender = false`).  
**Retirados del alcance actual** (decisión registrada en Engram): `GET /api/referral-status`, `POST /api/verify-recaptcha` y toda la integración reCAPTCHA v2 asociada.

### 3.3 SEO y descubrimiento

- **`/sitemap.xml`**: generación en servidor (`src/pages/sitemap.xml.ts`); incluye rutas de landing fijas + URLs de posts desde la colección `blog`. Se abandonó `@astrojs/sitemap` en favor de este endpoint **SSR** con `<urlset>` explícito, alineado a URLs reales.
- **`/robots.txt`**: implementación dedicada (`src/pages/robots.txt.ts`), no el fichero estático legacy de `public/`.
- **`rss.xml`**: feed RSS (revisar periódicamente alineación de URLs públicas con el patrón `/{lang}/blog/...`).
- **Layouts**: `MainLayout.astro` con canonical, OG, **View Transitions** (`ClientRouter`) y **Partytown** para GA4 opcional (`PUBLIC_GA_ID`, snippet `gtag`; no GTM por defecto).
- **`trailingSlash: 'always'`** en `astro.config.mjs`: canonicals, sitemap y `fetch` del cliente deben usar **barra final** en rutas de aplicación.

---

## 4. Arquitectura técnica (slowork-landing-v2 como base)

### 4.1 Stack

| Capa | Tecnología |
|------|------------|
| Framework | **Astro ^6** |
| Salida | **`output: 'server'`** + adapter **`@astrojs/vercel`** (import canónico en la versión actual del proyecto). |
| Estilos | **Tailwind CSS v4** (`@tailwindcss/vite`) |
| Contenido | **Content Collections** + `@astrojs/mdx` |
| Datos waitlist | Proxy Astro a API legacy (`SLOWORK_API_URL`) |
| Validación entrada | **Zod** en `src/models/` |
| Email | **Nodemailer** (servicios en `src/services/`) |
| Navegación cliente | **View Transitions** (`ClientRouter` en layout) |
| Integración blog | Cliente GraphQL tipado (`src/lib/api-service.ts`) |
| Node | **`>=22.12.0`** (`package.json` engines) |

Despliegue SSR, capas (presentación / datos / red) y comparativa frente a un host monolítico: **§4.6**.

### 4.2 Organización del código (manifiesto Slowork)

- **`src/models/`**: esquemas Zod y tipos (p. ej. `waitlist`, `welcome-email`, `i18n`, `legal`, `about`, `headerNav`).
- **`src/services/`**: lógica de negocio y side-effects (email, integraciones locales vigentes).
- **`src/pages/api/`**: endpoints HTTP finos que delegan en servicios; respuestas JSON vía **`src/lib/http.ts`** (`jsonResponse`).
- **`src/components/`**, **`src/layouts/`**: UI.
- **`src/lib/`**: utilidades (API service GraphQL, SEO, hreflang, bundles legales, copy home/about/nav, telemetría waitlist).

### 4.3 Datos: waitlist (estado actual)

El endpoint `POST /api/waitlist/` funciona como **proxy/BFF**:

1. valida payload con Zod (`waitlistCreateBodySchema`),
2. reenvía el alta a `${SLOWORK_API_URL}/api/waitlist`,
3. si el alta es correcta, dispara `${SLOWORK_API_URL}/api/welcome` con `{ name, email, lang }`,
4. devuelve `409` con mensaje claro cuando el email ya existe.

El frontend no llama directamente a `/api/welcome/`: su responsabilidad se limita a `POST /api/waitlist/` y mostrar la SuccessCard.

### 4.4 Variables de entorno

Referencia: `.env.example` en la raíz del repo.

- **`SLOWORK_API_URL`**: URL base del backend legacy/API GraphQL y endpoints REST legacy (`/api/waitlist`, `/api/welcome`).
- **`DATABASE_URL`** y `DB_*_LANDING`: mantener solo si se usa persistencia Prisma en rutas locales adicionales.
- **`GODADDY_EMAIL`**, **`GODADDY_PASS`**: SMTP (nombres históricos; host efectivo en servicio de email).
- **`PUBLIC_GA_ID`**: opcional, GA4 (`G-…`) vía Partytown en `MainLayout`.
- **`VERCEL_URL`**: usado en config Astro para URLs en previews; producción apunta a `https://www.slowork.app` cuando no hay preview.

### 4.5 Árbol del repositorio (`slowork-landing-v2`)

Vista orientativa de carpetas y ficheros relevantes. **No** incluye `node_modules/`, `dist/`, `.vercel/`, `.astro/` ni el volumen completo de `src/assets/` ni de `src/content/blog/**/*.md`.

```
slowork-landing-v2/
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
│   │   ├── api-service.ts
│   │   └── …
│   ├── types/
│   │   └── blog.ts
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
│   │   │   ├── waitlist/
│   │   │   │   └── index.ts
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
│       ├── BlogCard.astro
│       ├── home/
│       ├── sections/
│       ├── legal/
│       ├── features/
│       └── ui/
└── .vscode/
```

### 4.6 Modelo de despliegue (SSR desacoplado)

El sitio público sigue un patrón **híbrido**: Astro en **modo servidor** (`output: 'server'`, adapter **`@astrojs/vercel`**) para la capa de presentación, y un **backend con persistencia** alojado fuera del repositorio (habitualmente descrito como stack en **AWS**). Esto **desacopla** el HTML que ve el usuario de dónde viven los datos: el navegador no abre conexiones a la base de datos; habla con endpoints HTTP (incluido GraphQL vía `SLOWORK_API_URL`).

Algunas rutas pueden **prerenderizarse** (`prerender: true`) y otras exigen **SSR** (`prerender: false`) según necesiten datos en tiempo de petición o lógica dinámica; el conjunto sigue siendo un solo despliegue en Vercel. El **blog** mezcla en código **Content Collections** (`src/content/blog/`, `getCollection`) y **consumo remoto** (listado e hidratación de detalle vía `src/lib/api-service.ts`); el detalle operativo está en §3.1 y §5.10.

#### Presentación (Astro en Vercel)

- Cada petición a páginas SSR ejecuta el runtime de Astro en la infraestructura de Vercel, que genera HTML (y el JS mínimo que decida el proyecto).
- Cuando la vista lo necesita, el servidor consulta la **API** (p. ej. listado de posts por GraphQL, o resolución por slug/id) antes de responder: el contenido relevante puede ir **en el documento inicial**, lo que favorece **SEO** y primera pintada con datos actuales sin esperar a hidratación solo para el primer render.
- Rutas bajo **`src/pages/api/`** actúan como **BFF/proxy** (p. ej. `POST /api/waitlist/`): validación en borde (Zod), reenvío a la API legacy y orquestación server-side (welcome), sin exponer credenciales ni la URL interna de backend al cliente (§4.3).

#### Datos y backend (API en AWS)

- La **API** concentra reglas de negocio, autenticación aplicable y acceso a **BD** u otros almacenes. La landing en Astro es un cliente más, al igual que el panel de administración o futuros clientes (móvil, integraciones).
- **CORS**, límites de tasa y políticas de red se aplican en el perímetro del backend; el frontal público no sustituye a esos controles.
- **Waitlist** y **bienvenida** en el flujo actual: el alta y el disparo de welcome se canalizan vía proxy Astro hacia `${SLOWORK_API_URL}` (§3.2, §4.3), no mediante lógica de BD embebida en componentes.

#### Red, DNS y enrutamiento

- **DNS** gestionado en **Vercel** permite dirigir el **dominio del sitio** (p. ej. `www.slowork.app`) hacia el despliegue Astro y, en paralelo, enviar **subdominios de API** (p. ej. `api.slowork.app`) hacia el origen en **AWS**; el DNS actúa como capa de enrutamiento entre productos. El papel futuro de `api.slowork.app` se discute en §7.
- La red de **Vercel** reparte el tráfico del front en nodos cercanos al usuario (edge), reduciendo latencia percibida frente a un único origen geográfico fijo.

#### Resumen del stack de despliegue

| Pieza | Función |
|-------|---------|
| **Astro** | Framework SSR; componentes y rutas en `src/pages/` |
| **Vercel** | Hosting del front, ejecución serverless/edge del runtime Astro, CI/CD habitual del proyecto |
| **AWS** | Alojamiento del backend, persistencia y escalado del servicio de API |
| **DNS (Vercel)** | Resolución del dominio público y separación tráfico web vs API |

#### Nota sobre migración desde un despliegue monolítico (p. ej. Render)

En escenarios donde el servicio previo **compartía** front y API en una misma instancia o **escalaba a cero**, el primer request tras inactividad podía incurrir en **cold starts** largos y TTFB elevado. Al **separar** front (Vercel) y API (AWS):

| Aspecto | Efecto esperado |
|---------|------------------|
| **Latencia del HTML público** | TTFB del sitio principal suele ser más **predecible** al depender del modelo de ejecución de Vercel y no de una única VM inactiva |
| **Picos de concurrencia** | La carga se reparte entre la capa de presentación y la API; cada tier escala según su plataforma |
| **Superficie de seguridad** | La BD no es alcanzable desde el navegador; solo la API expone contratos acotados |

La magnitud exacta de mejoras depende del plan contratado, región y configuración de cada proveedor; esta tabla describe **tendencias habituales**, no un SLA numérico.

---

## 5. Decisiones técnicas y arquitectura (memoria Engram)

Esta sección consolida decisiones explícitas guardadas en **Engram** para los proyectos **slowork-unified** y **slowork-landing-v2**. Si el código diverge, prima el repositorio; Engram sirve como registro de intención y contexto.

### 5.0 Naming del proyecto, carpeta y dominio canónico (decisiones de Engram)

- El proyecto Astro unificado ha usado el nombre **`blog-slowork`** en etapas anteriores, pero la carpeta y el `name` de `package.json` se estandarizaron a **`slowork-landing-v2`**.
- En Engram, el nombre “de arquitectura/producto” para la unificación es **`slowork-unified`** (y se considera typo hablar de `slowork-unifie`).
- El dominio canónico de producción se mantiene como **`https://www.slowork.app`** (con previews usando `VERCEL_URL` cuando aplica), y debe guiar `astro.config.mjs` (`site`), canonicals y generación de sitemap.

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

- Refactor alineado al **manifiesto Slowork**: Zod en models y ruta `waitlist` como orquestación fina server-side.
- Decisión operativa: `POST /api/waitlist/` en Astro es **proxy** a API legacy y además dispara welcome server-side (cookie `slowork-language` para `lang`; fallback `en`).
- **reCAPTCHA v2 retirado por completo** (widget, script, variables, endpoint verify). **Pendiente acordado:** **reCAPTCHA v3 basado en score** (servidor valida `score` y `action` tras `grecaptcha.execute` en cliente).
- **Referidos retirados** del flujo público waitlist (ver §4.3).

### 5.6 Telemetría waitlist

- Logs detallados en **`import.meta.env.DEV`**.
- En **Vercel** (`VERCEL=1`): timings de registro y fases Prisma útiles para latencia RDS.
- Errores de base de datos: **`console.error`** sin PII (`src/lib/waitlist-telemetry.ts` y servicio).

### 5.7 Landing UX: header, hero, redes y marketing

- **Header** fijo: en home, estado inicial tipo vidrio sobre hero; tras scroll (>50 px) clase **`.header-scrolled`**. Atributo/cookie **`data-is-home`** para no aplicar comportamiento de home en páginas internas. Logo con filtro CSS para contraste sobre vídeo cuando el header es claro sobre fondo oscuro.
- **Hero**: copy y combinaciones alineadas a la landing histórica; primera línea con acento **`text-soft-blue`** (token **`--color-soft-blue`**, p. ej. `#779ed3`); rotador CSS con clases **`.rotator-text`**, **`.word-exit`**, **`.word-enter`** (sin máquina de escribir); intervalos desincronizados entre primera palabra y frase.
- **Redes**: fuente única **`src/lib/socialLinks.ts`** (`SLOWORK_SOCIAL_LINKS`), enlaces a **perfiles** Slowork (no “share intent”), barra en **`SocialShareBar.astro`** dentro de `MainLayout`.
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
- **Cliente waitlist:** `fetch` solo a **`/api/waitlist/`** con barra final; el welcome se resuelve server-side en el proxy.
- **UX formulario:** estados `data-status`, `data-busy`; copy `sendFailed`; si `!response.ok` o fallo de red, restaurar botón y mostrar mensaje (priorizar `message` JSON del servidor).
- **Tailwind 4:** **`@source`** en `global.css` escaneando `src/**/*.{astro,html,js,ts,tsx,md,mdx}` + plugin **`@tailwindcss/typography`** para estilos `prose`.
- **Vite:** `server.watch.usePolling` (Linux/WSL), **`optimizeDeps.exclude: ['zod']`**, **`ssr.noExternal: ['@tailwindcss/vite']`**.
- **Carruseles** (`HomeFeatures`, `HomeValueProposition`): handles de intervalo tipados como **`number | undefined`** en cliente para no chocar con `NodeJS.Timeout` en tipos mixtos.

### 5.10 Patrones de calidad y contenido (blog)

Registrados en Engram como convenciones de equipo:

- **Commits** agrupados por responsabilidad (p. ej. `seo(sitemap)` / `seo(robots)` / `seo(meta)`; `perf(fonts)` vs `perf(lcp)`; `style(prose)` vs `content(blog)`).
- **Rendimiento:** Fontsource Poppins en lugar de Google Fonts en CDN; hero LCP con `loading="eager"`, `fetchpriority="high"`, WebP; PostCard con prioridad de carga donde aplica.
- **Blog:** integración activa con API GraphQL (`getBlogs`, `getBlogById`) en `src/lib/api-service.ts`, tipos en `src/types/blog.ts`, y tarjetas remotas en `src/components/BlogCard.astro`.
- **Contenido HTML desde API:** renderizado en Astro con `set:html` y clases `prose` para conservar semántica (`<p>`, `<strong>`, etc.) con estilo consistente.
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

La landing en **Create React App** + **Express** (`sloworkLanding`) es la línea base funcional y de rutas. Los documentos `sloworkLanding/docs/RESUMEN-PARA-MIGRACION-ASTRO.md` y `slowork-landing-v2/docs/RESUMEN-PARA-INTEGRACION-LANDING.md` siguen siendo útiles para **diff** de comportamiento, con matices:

- **slowork-landing-v2** ya incorpora muchas páginas que el resumen de integración listaba como “pendientes en el repo del blog” (legales, home, impact, waitlist).
- Las **URLs del blog** pueden seguir sin coincidir 1:1 con slugs históricos generados con `slugify(título)` en React; **landing-waitlist-v2** debe incluir política explícita de **redirecciones 301** o aceptación de nueva estructura de slugs.
- El formulario legacy usaba **reCAPTCHA v2** y API propia; en Astro actual **no hay CAPTCHA** (ver §5.5 y §9): mitigar spam por otros medios hasta **v3**.

---

## 7. Iniciativa de unificación (slowork-unified)

Se entiende por unificación el trabajo de:

1. **Un solo repositorio y un solo despliegue** orientado a producción (posible renombrado del repo a `landing-waitlist-v2` o monorepo con paquete homónimo; decisión de equipo).
2. **Eliminar duplicación** entre `sloworkLanding` y `slowork-landing-v2` en documentación, assets y copy.
3. **Alinear métricas y analítica** con lo que existía en `public/index.html` del CRA; hoy GA4 vía Partytown + `PUBLIC_GA_ID` (contenedor **GTM** requeriría bloque adicional explícito).
4. **Definir el rol de `api.slowork.app`** si sigue vivo: solo administración, solo lectura legacy, o retirada.

---

## 8. Criterios de aceptación (v2)

- Un usuario puede recorrer **home → blog → post** en `es` y `en` con conmutador de idioma coherente (`buildI18nAlternates` / `headerAlternateLink` donde aplique).
- El formulario de waitlist envía exclusivamente a **`POST /api/waitlist/`**; duplicados reciben **409** con mensaje controlado.
- Tras alta, el welcome se ejecuta en backend desde el proxy (sin segunda llamada desde el frontend).
- Sitemap incluye al menos todas las rutas de landing previstas + posts publicados, con **barra final** en URLs de página.
- Legales accesibles en `/{lang}/…-policy/` (y análogos) sin depender del servidor React.

---

## 9. Riesgos y deuda conocida

| Riesgo | Mitigación sugerida |
|--------|---------------------|
| Slugs blog y detalle API en transición | Definir política final de slug/ID y redirecciones 301 antes de consolidar detalle remoto. |
| Spam / abuso waitlist sin CAPTCHA | Rate limiting, honeypot, o **reCAPTCHA v3** (pendiente §5.5). |
| RSS con enlaces desalineados | Auditar `rss.xml.js` frente a rutas reales. |
| Dos despliegues en paralelo (CRA + Astro) | Cortar tráfico por rutas o dominio con plan de rollback. |
| Secretos SMTP en entorno | Solo variables de entorno en CI/hosting; rotación si hubo exposición. |
| Columnas legacy en RDS (referidos) | Migración DBA o convivencia hasta limpieza. |

---

## 10. Referencias en este monorepo / workspace

| Documento | Ubicación |
|-----------|-----------|
| Resumen blog → landing (contexto anterior) | `slowork-landing-v2/docs/RESUMEN-PARA-INTEGRACION-LANDING.md` |
| Resumen migración CRA → Astro | `sloworkLanding/docs/RESUMEN-PARA-MIGRACION-ASTRO.md` |
| README producto blog | `slowork-landing-v2/README.md` |
| Esquema waitlist | `slowork-landing-v2/prisma/schema.prisma` |
| Middleware idioma | `slowork-landing-v2/src/middleware.ts` |
| Memoria persistente (decisiones de sesión) | **Engram** — proyectos `slowork-unified`, `slowork-landing-v2` (tópicos p. ej. `slowork-unified/assets-legal-seo-sitemap`, `slowork-landing-v2/waitlist-api-architecture`, `slowork-unified/home-hero-vt-rotator`, `architecture/aliases-api-waitlist`) |

---

## 11. Glosario

| Término | Significado |
|---------|-------------|
| **landing-waitlist-v2** | Nombre del producto / release: landing unificada en Astro con waitlist v2. |
| **slowork-unified** | Nombre de arquitectura / producto y línea de trabajo de unificación (landing + blog), usado en memoria de equipo (Engram); código en repo `slowork-landing-v2`. |
| **slowork-landing-v2** | Repositorio Astro que implementa hoy la mayor parte del alcance. |
| **sloworkLanding** | Legacy React + Express; fuente de paridad y migración. |

---

*Este documento debe actualizarse cuando cambien rutas canónicas, contrato del proxy waitlist, la política final de blog (MD vs API GraphQL) o el modelo de despliegue descrito en §4.6. Las decisiones reflejadas en Engram deben revalidarse tras refactors grandes.*
