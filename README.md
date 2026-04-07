# Slowork — slowork-landing-v2

> **Otro estilo de vida es posible.**

**Landing principal** de **Slowork**, implementada con **[Astro 6](https://astro.build/)** en un solo repositorio: marca, blog, lista de espera, páginas legales y contenido editorial, con **internacionalización** español / inglés.

**Dominio canónico (producción):** [https://www.slowork.app](https://www.slowork.app)  
**Paquete npm:** `slowork-landing-v2`

---

## Requisitos

- **Node.js** `>= 22.12.0` (ver `package.json` → `engines`)

---

## Stack

| Área | Tecnología |
|------|------------|
| Framework | Astro 6, modo **`output: 'server'`** (SSR) |
| Despliegue | [@astrojs/vercel](https://docs.astro.build/en/guides/integrations-guide/vercel/) |
| Estilos | Tailwind CSS 4, [DaisyUI](https://daisyui.com/), tipografía Poppins (Fontsource) |
| Contenido | Content Collections, Markdown / MDX (`@astrojs/mdx`) |
| Validación | Zod (`src/models/`) |
| Blog (remoto) | GraphQL + `marked` (`src/lib/api-service.ts`) |
| Email | Nodemailer (`src/services/`) |
| Datos opcionales | Prisma + PostgreSQL (`prisma/`) — uso según rutas y entorno |

A nivel de **infraestructura**, el front se ejecuta en **Vercel**; la **API** (GraphQL, waitlist, welcome) se consume vía `SLOWORK_API_URL` (backend alojado fuera de este repo). Detalle en [`docs/SPECIFICATION_WAITLIST_V2.md`](docs/SPECIFICATION_WAITLIST_V2.md) (incl. §4.6 despliegue desacoplado).

---

## Estructura del código

Orientación alineada al manifiesto Slowork:

- `src/pages/` — rutas y endpoints (`[lang]/`, `api/`)
- `src/layouts/`, `src/components/` — UI
- `src/lib/` — cliente API, SEO, copy, utilidades
- `src/models/` — esquemas y tipos
- `src/services/` — lógica de negocio (email, etc.)
- `src/content/blog/` — entradas Markdown/MDX (colección `blog`)
- `src/middleware.ts` — redirección de `/` según idioma

---

## Internacionalización (i18n)

- **Español:** `/es/…`
- **Inglés:** `/en/…`

La raíz **`/`** redirige a `/es/` o `/en/` según cookie `slowork-language` y cabecera `Accept-Language`.

En **Content Collections**, las entradas locales usan `language` y, cuando aplica, `translationSlug` para enlazar versiones entre idiomas. El **listado del blog en producción** se obtiene desde la **API**; el detalle de post puede resolverse desde colección local **o** desde la API según la ruta.

---

## Variables de entorno

Copia **`.env.example`** a `.env` y ajusta valores. Las más relevantes:

| Variable | Uso |
|----------|-----|
| **`SLOWORK_API_URL`** | Base URL del backend (GraphQL, `POST /api/waitlist`, `POST /api/welcome`). **Necesaria** para blog remoto y flujo de waitlist en condiciones reales. |
| **`VERCEL_URL`** | En previews, Vercel la inyecta; alimenta `site` en `astro.config.mjs` para URLs absolutas. |
| **`PUBLIC_GA_ID`** | Opcional. ID de medición GA4 (`G-…`); carga vía Partytown en el layout. |
| **`DATABASE_URL`** / `DB_*_LANDING` | Solo si usas Prisma contra PostgreSQL en este proyecto. |
| **`GODADDY_EMAIL`**, **`GODADDY_PASS`** | Credenciales SMTP (nombres históricos; ver comentarios en `.env.example`). |

---

## Scripts

```bash
npm install          # dependencias
npm run dev          # servidor de desarrollo (Astro)
npm run build        # build de producción
npm run preview      # sirve el build localmente
```

---

## Flujo de waitlist (resumen)

El navegador envía **`POST /api/waitlist/`** (con **barra final**, coherente con `trailingSlash: 'always'`). La ruta Astro valida el cuerpo con Zod, **reenvía** el alta a `${SLOWORK_API_URL}/api/waitlist` y, si procede, orquesta el email de bienvenida vía el backend. No expone la URL interna de la API al cliente.

---

## Documentación del producto

| Documento | Contenido |
|-----------|-----------|
| [`docs/SPECIFICATION_WAITLIST_V2.md`](docs/SPECIFICATION_WAITLIST_V2.md) | Especificación **landing-waitlist-v2**: rutas, API, SEO, decisiones, arquitectura |
| [`docs/RESUMEN-PARA-INTEGRACION-LANDING.md`](docs/RESUMEN-PARA-INTEGRACION-LANDING.md) | Contexto de integración con la landing legacy |

---

## Licencia

Repositorio privado / propiedad Slowork. No se incluye fichero `LICENSE` público en la raíz.
