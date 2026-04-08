import intlTelInput from 'intl-tel-input/intlTelInputWithUtils';
import i18nEs from 'intl-tel-input/i18n/es';
import i18nEn from 'intl-tel-input/i18n/en';
import { normalizeWaitlistPhoneInput } from '@/models/waitlist';

export type WaitlistPhoneUiLang = 'es' | 'en';

type ItiInstance = ReturnType<typeof intlTelInput>;

/**
 * Encapsula intl-tel-input: el formulario solo habla con esta capa (inversión de dependencias).
 */
export class PhoneController {
  private readonly input: HTMLInputElement;

  private readonly iti: ItiInstance;

  private constructor(input: HTMLInputElement, iti: ItiInstance) {
    this.input = input;
    this.iti = iti;
  }

  static attach(input: HTMLInputElement, lang: WaitlistPhoneUiLang): PhoneController;
  static attach(input: null | undefined, lang: WaitlistPhoneUiLang): null;
  static attach(
    input: HTMLInputElement | null | undefined,
    lang: WaitlistPhoneUiLang,
  ): PhoneController | null {
    if (!input) return null;
    intlTelInput.getInstance(input)?.destroy();
    const iti = intlTelInput(input, {
      i18n: lang === 'es' ? i18nEs : i18nEn,
      countrySearch: true,
      strictMode: true,
      initialCountry: lang === 'es' ? 'es' : 'us',
      formatAsYouType: true,
    });
    return new PhoneController(input, iti);
  }

  destroy(): void {
    this.iti.destroy();
  }

  /** E.164 normalizado con la misma lógica que el esquema Zod del waitlist. */
  get fullNumber(): string {
    const e164 = intlTelInput.utils?.numberFormat?.E164;
    const fromLib = typeof e164 === 'number' ? this.iti.getNumber(e164) : '';
    const raw = fromLib.length > 0 ? fromLib : this.input.value;
    return normalizeWaitlistPhoneInput(raw);
  }

  /**
   * Validez según libphonenumber (intl-tel-input). Vacío → false (la obligatoriedad la cubre Zod).
   */
  isValid(): boolean {
    if (this.fullNumber.length === 0) return false;
    return this.iti.isValidNumber() === true;
  }

  clear(): void {
    this.iti.setNumber('');
  }
}
