export type SupportedLang = 'es' | 'en';

export type HreflangAlternate = {
  hreflang: string;
  href: string;
};

export function isSupportedLang(lang: string | undefined | null): lang is SupportedLang {
  return lang === 'es' || lang === 'en';
}

export function otherLang(lang: SupportedLang): SupportedLang {
  return lang === 'es' ? 'en' : 'es';
}

/**
 * Creates absolute hreflang alternates for a given path (must start with '/').
 */
export function buildAlternates(args: {
  lang: SupportedLang;
  origin: string;
  path: string;
  alternatePath?: string;
}): HreflangAlternate[] {
  const { lang, origin, path, alternatePath } = args;
  const altLang = otherLang(lang);

  const selfHref = new URL(path, origin).href;
  const altHref = new URL(alternatePath ?? path.replace(`/${lang}/`, `/${altLang}/`), origin).href;

  return [
    { hreflang: lang, href: selfHref },
    { hreflang: altLang, href: altHref },
  ];
}

export function canonicalFromPath(args: { origin: string; path: string }): string {
  return new URL(args.path, args.origin).href;
}

