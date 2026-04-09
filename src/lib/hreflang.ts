import type { SupportedLang } from '@/lib/seo';

export type HreflangAlternate = {
  hreflang: string;
  href: string;
};

/**
 * hreflang para parejas es/en con x-default → versión en español (locale por defecto del sitio).
 * `pathSuffix` incluye slashes finales, p. ej. `/privacy-policy/` o `/` para la home.
 */
export function buildI18nAlternates(
  origin: string,
  pathSuffix: string,
  _currentLang: SupportedLang,
): { alternates: HreflangAlternate[] } {
  const esPath = pathSuffix === '/' ? '/es/' : `/es${pathSuffix}`;
  const enPath = pathSuffix === '/' ? '/en/' : `/en${pathSuffix}`;
  const esHref = new URL(esPath, origin).href;
  const enHref = new URL(enPath, origin).href;

  return {
    alternates: [
      { hreflang: 'es', href: esHref },
      { hreflang: 'en', href: enHref },
      { hreflang: 'x-default', href: esHref },
    ],
  };
}

export type LanguageSwitcherPaths = {
  readonly es: string;
  readonly en: string;
};

/** Alineado con `trailingSlash: 'always'` en rutas de app. */
function withTrailingSlash(pathname: string): string {
  if (pathname === '/es' || pathname === '/en') return `${pathname}/`;
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

/**
 * Construye href de pathname absolutos para ES y EN intercambiando solo el prefijo de idioma.
 * Si la ruta no empieza por `/es` ni `/en`, cae a home por idioma.
 */
export function swapLangPrefixInPath(pathname: string): LanguageSwitcherPaths {
  const trimmed = pathname.trim();
  const normalized = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  const segments = normalized.split('/').filter((segment) => segment.length > 0);

  if (segments.length === 0) {
    return { es: '/es/', en: '/en/' };
  }

  const first = segments[0]?.toLowerCase();
  if (first !== 'es' && first !== 'en') {
    return { es: '/es/', en: '/en/' };
  }

  const tail = segments.slice(1);
  const suffix = tail.length > 0 ? `/${tail.join('/')}/` : '/';
  return {
    es: withTrailingSlash(`/es${suffix}`),
    en: withTrailingSlash(`/en${suffix}`),
  };
}

/**
 * Pareja de rutas para el conmutador ES/EN: prioriza `hreflang` es/en de `alternates` (p. ej. slugs distintos en blog);
 * si faltan, deriva de la URL actual.
 */
export function languageSwitcherPaths(args: {
  alternates: ReadonlyArray<HreflangAlternate | { hreflang: string; href: string }>;
  pathname: string;
  origin: string;
}): LanguageSwitcherPaths {
  let esPath = '';
  let enPath = '';

  for (const a of args.alternates) {
    if (a.hreflang === 'es') esPath = new URL(a.href, args.origin).pathname;
    if (a.hreflang === 'en') enPath = new URL(a.href, args.origin).pathname;
  }

  if (esPath && enPath) {
    return {
      es: withTrailingSlash(esPath),
      en: withTrailingSlash(enPath),
    };
  }

  return swapLangPrefixInPath(args.pathname);
}
