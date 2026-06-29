import type esLegal from '@/data/legal/es.json';

/** Bundle i18n legal + impact (misma forma en es/en). */
export type LegalLocaleBundle = typeof esLegal;

export type PrivacyPolicyContent = LegalLocaleBundle['privacyPolicy'];
export type CookiesPolicyContent = LegalLocaleBundle['cookiesPolicy'];
export type LegalNoticeContent = LegalLocaleBundle['legalNotice'];
export type TermsAndConditionsContent = LegalLocaleBundle['termsAndConditions'];

export type TermsParagraphBlock = { type: 'paragraph'; text: string };
export type TermsListBlock = { type: 'list'; items: string[] };
export type TermsDefinitionsBlock = {
  type: 'definitions';
  items: { term: string; text: string }[];
};
export type TermsFlowStatesBlock = { type: 'flowStates'; states: string[] };
export type TermsCreditTableBlock = {
  type: 'creditTable';
  platforms: { name: string; rows: { format: string; credits: string }[] }[];
};
export type TermsBonusListBlock = {
  type: 'bonusList';
  categories: { title: string; items: string[] }[];
};
export type TermsBlock =
  | TermsParagraphBlock
  | TermsListBlock
  | TermsDefinitionsBlock
  | TermsFlowStatesBlock
  | TermsCreditTableBlock
  | TermsBonusListBlock;

export type ImpactProgramContent = LegalLocaleBundle['impactProgram'];
