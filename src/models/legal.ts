import type esLegal from '@/data/legal/es.json';

/** Bundle i18n legal + impact (misma forma en es/en). */
export type LegalLocaleBundle = typeof esLegal;

export type PrivacyPolicyContent = LegalLocaleBundle['privacyPolicy'];
export type CookiesPolicyContent = LegalLocaleBundle['cookiesPolicy'];
export type LegalNoticeContent = LegalLocaleBundle['legalNotice'];
export type TermsAndConditionsContent = LegalLocaleBundle['termsAndConditions'];
export type ImpactProgramContent = LegalLocaleBundle['impactProgram'];
