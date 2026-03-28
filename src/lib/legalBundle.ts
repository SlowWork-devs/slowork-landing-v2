import enLegal from '@/data/legal/en.json';
import esLegal from '@/data/legal/es.json';
import type { LegalLocaleBundle } from '@/models/legal';
import type { SupportedLang } from '@/lib/seo';

const en = enLegal as LegalLocaleBundle;

export function getLegalBundle(lang: SupportedLang): LegalLocaleBundle {
  return lang === 'es' ? esLegal : en;
}
