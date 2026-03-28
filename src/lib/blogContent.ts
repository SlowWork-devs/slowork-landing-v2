import type { BlogUiCopy } from '@/models/blog';
import type { SupportedLang } from '@/lib/seo';

const es: BlogUiCopy = {
  backToBlog: 'Volver al Blog',
  scrollToTop: 'Volver arriba',
};

const en: BlogUiCopy = {
  backToBlog: 'Back to Blog',
  scrollToTop: 'Back to top',
};

export function getBlogUiCopy(lang: SupportedLang): BlogUiCopy {
  return lang === 'es' ? es : en;
}
