/**
 * Textos del header y del drawer móvil (ES/EN).
 * Single source of textos: `homeNavCopy` en `@/lib/homeContent`.
 */
export type HeaderNavTranslations = {
  readonly blog: string;
  readonly about: string;
  readonly impact: string;
  /** CTA compacto (desktop). */
  readonly join: string;
  readonly menu: string;
  readonly close: string;
  /** CTA principal del drawer móvil (beneficio + exclusividad). */
  readonly mobileEarlyAccessWaitlist: string;
  /** Nombre accesible del panel móvil (`role="dialog"`). */
  readonly mobileDrawerAriaLabel: string;
};
