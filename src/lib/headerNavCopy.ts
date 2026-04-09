import type { HeaderNavTranslations } from '@/models/headerNav';
import type { SupportedLang } from '@/lib/seo';

import { homeNavCopy } from '@/lib/homeContent';

/** @deprecated Use `homeNavCopy` from `@/lib/homeContent` (SSOT). */
export function getHeaderNav(lang: SupportedLang): HeaderNavTranslations {
  return homeNavCopy(lang);
}
