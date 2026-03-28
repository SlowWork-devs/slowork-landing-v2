import type { HeaderNavTranslations } from '@/models/headerNav';
import type { SupportedLang } from '@/lib/seo';

const es: HeaderNavTranslations = {
  blog: 'BLOG',
  about: 'ABOUT',
  impact: 'IMPACT',
  join: 'Únete a la lista de espera',
  menu: 'Abrir menú',
  close: 'Cerrar menú',
  mobileEarlyAccessWaitlist: 'Consigue Acceso Anticipado: Únete a la Waitlist',
};

const en: HeaderNavTranslations = {
  blog: 'BLOG',
  about: 'ABOUT',
  impact: 'IMPACT',
  join: 'Join the waiting list',
  menu: 'Open menu',
  close: 'Close menu',
  mobileEarlyAccessWaitlist: 'Get Early Access: Join the Waitlist',
};

export function getHeaderNav(lang: SupportedLang): HeaderNavTranslations {
  return lang === 'es' ? es : en;
}
