/// <reference types="astro/client" />

// Globals shared between inline page scripts.
interface Window {
  /** current UI language, set by the i18n script in Base.astro */
  __lang?: string;
  /** translate a STRINGS key into a language (Base.astro) */
  __tk?: (key: string, lang: string) => string;
  /** analytics runtime, public/assets/js/analytics.js */
  AlmeronAnalytics?: {
    push(event: string, parameters?: Record<string, unknown>): void;
    trackFormSubmitAttempt(form: HTMLFormElement): void;
    trackFormSuccess(form: HTMLFormElement): void;
    trackFormError(form: HTMLFormElement, errorType: string): void;
  };
}
