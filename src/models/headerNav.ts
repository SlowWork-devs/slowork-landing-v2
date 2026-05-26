/**
 * Textos del header y del drawer móvil (ES/EN).
 * Single source of textos: `homeNavCopy` en `@/lib/homeContent`.
 */
export type HeaderNavTranslations = {
  readonly blog: string;
  readonly about: string;
  readonly impact: string;
  /** Etiqueta del dropdown que agrupa los programas. */
  readonly programs: string;
  /** Enlace al programa de creadores (externo). */
  readonly creators: string;
  /** CTA compacto (desktop). */
  readonly join: string;
  /** Enlace al portal de login. */
  readonly login: string;
  readonly menu: string;
  readonly close: string;
  /** CTA principal del drawer móvil (beneficio + exclusividad). */
  readonly mobileEarlyAccessWaitlist: string;
  /** Nombre accesible del panel móvil (`role="dialog"`). */
  readonly mobileDrawerAriaLabel: string;
};
