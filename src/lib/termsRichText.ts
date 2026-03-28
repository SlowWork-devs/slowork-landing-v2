import type { SupportedLang } from '@/lib/seo';

/**
 * Sustituye marcadores `<1>...</1>` del copy legacy (react-i18next) por enlaces HTML seguros.
 */
export function termsLinkify(text: string, lang: SupportedLang): string {
  return text.replace(/<1>(.*?)<\/1>/g, (_, inner: string) => {
    const trimmed = inner.trim();
    if (/^https?:\/\//i.test(trimmed)) {
      return `<a href="${trimmed}" target="_blank" rel="noopener noreferrer">${trimmed}</a>`;
    }
    const href = `/${lang}/privacy-policy/`;
    return `<a href="${href}">${inner}</a>`;
  });
}
