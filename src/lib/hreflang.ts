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
  currentLang: SupportedLang,
): { alternates: HreflangAlternate[]; headerAlternateLink: string } {
  const esPath = pathSuffix === '/' ? '/es/' : `/es${pathSuffix}`;
  const enPath = pathSuffix === '/' ? '/en/' : `/en${pathSuffix}`;
  const esHref = new URL(esPath, origin).href;
  const enHref = new URL(enPath, origin).href;
  const alternateLang = currentLang === 'es' ? 'en' : 'es';
  const headerPath = pathSuffix === '/' ? `/${alternateLang}/` : `/${alternateLang}${pathSuffix}`;

  return {
    alternates: [
      { hreflang: 'es', href: esHref },
      { hreflang: 'en', href: enHref },
      { hreflang: 'x-default', href: esHref },
    ],
    headerAlternateLink: headerPath,
  };
}
