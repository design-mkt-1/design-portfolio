(function initializeAlmeronAnalytics(window, document) {
  'use strict';

  const EVENT_PARAMETERS = Object.freeze({
    cta_click: ['site_section', 'site_language', 'element_id', 'element_type', 'element_location', 'link_url'],
    navigation_click: ['site_section', 'site_language', 'element_id', 'element_location', 'link_url'],
    contact_click: ['site_section', 'site_language', 'method', 'element_id', 'element_location', 'link_url'],
    select_content: ['site_section', 'site_language', 'content_type', 'content_id', 'element_location'],
    faq_open: ['site_section', 'site_language', 'content_type', 'content_id', 'element_location'],
    contact_form_start: ['site_section', 'site_language', 'form_id', 'form_location'],
    contact_form_submit_attempt: ['site_section', 'site_language', 'form_id', 'form_location'],
    contact_form_error: ['site_section', 'site_language', 'form_id', 'form_location', 'error_type', 'field_name'],
    generate_lead: ['site_section', 'site_language', 'form_id', 'form_location', 'method'],
    language_change: ['site_section', 'previous_language', 'selected_language', 'element_location'],
    consent_update: ['consent_action', 'consent_analytics', 'consent_ads'],
  });

  const SNAKE_CASE_PARAMETERS = new Set([
    'site_section',
    'site_language',
    'element_id',
    'element_type',
    'element_location',
    'form_id',
    'form_location',
    'error_type',
    'field_name',
    'previous_language',
    'selected_language',
    'content_type',
    'content_id',
    'method',
    'consent_action',
    'consent_analytics',
    'consent_ads',
  ]);

  const dataLayer = (window.dataLayer = Array.isArray(window.dataLayer) ? window.dataLayer : []);
  const startedForms = new WeakSet();
  const successfulForms = new WeakSet();
  const validationReportedForms = new WeakSet();
  const debugEnabled =
    /^(localhost|127(?:\.\d{1,3}){3}|\[::1\])$/i.test(window.location.hostname) ||
    /^(1|true)$/i.test(new URLSearchParams(window.location.search).get('analytics_debug') || '');

  function toSnakeCase(value) {
    return String(value)
      .trim()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .toLowerCase()
      .slice(0, 100);
  }

  function cleanValue(key, value) {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') return undefined;
    const text = String(value).trim();
    if (!text) return undefined;
    if (key === 'link_url') return safeLinkUrl(text);
    return SNAKE_CASE_PARAMETERS.has(key) ? toSnakeCase(text) : text.slice(0, 100);
  }

  function safeLinkUrl(rawUrl) {
    if (!rawUrl || /^(mailto|tel|sms|whatsapp):/i.test(rawUrl)) return undefined;
    try {
      const parsed = new URL(rawUrl, window.location.href);
      if (!/^https?:$/i.test(parsed.protocol)) return undefined;
      parsed.username = '';
      parsed.password = '';
      parsed.search = '';
      parsed.hash = '';
      return parsed.origin === window.location.origin
        ? `${parsed.pathname || '/'}`
        : `${parsed.origin}${parsed.pathname || '/'}`;
    } catch {
      return undefined;
    }
  }

  function siteSection() {
    return document.body?.dataset.siteSection || 'unknown';
  }

  function siteLanguage() {
    return document.documentElement.lang || 'en';
  }

  function push(eventName, parameters) {
    const normalizedEvent = toSnakeCase(eventName);
    const allowed = EVENT_PARAMETERS[normalizedEvent];
    if (!allowed) return false;

    const source = {
      site_section: siteSection(),
      site_language: siteLanguage(),
      ...(parameters || {}),
    };
    const payload = { event: normalizedEvent };
    for (const key of allowed) {
      const value = cleanValue(key, source[key]);
      if (value !== undefined) payload[key] = value;
    }
    dataLayer.push(payload);
    if (debugEnabled) console.debug('[AlmeronAnalytics]', payload);
    return true;
  }

  function formContext(form) {
    if (!(form instanceof HTMLFormElement)) return null;
    const formId = form.dataset.formId;
    const formLocation = form.dataset.formLocation;
    if (!formId || !formLocation) return null;
    return { form_id: formId, form_location: formLocation };
  }

  function trackFormSubmitAttempt(form) {
    const context = formContext(form);
    return context ? push('contact_form_submit_attempt', context) : false;
  }

  function trackFormError(form, errorType, fieldName) {
    const context = formContext(form);
    return context
      ? push('contact_form_error', {
          ...context,
          error_type: errorType || 'unknown',
          field_name: fieldName,
        })
      : false;
  }

  function trackFormSuccess(form) {
    const context = formContext(form);
    if (!context || successfulForms.has(form)) return false;
    successfulForms.add(form);
    return push('generate_lead', { ...context, method: 'website_form' });
  }

  function clickParameters(element) {
    const eventName = element.dataset.analyticsEvent;
    const params = {
      element_id: element.dataset.analyticsId,
      element_type:
        element.dataset.analyticsType ||
        (element instanceof HTMLAnchorElement ? 'link' : element instanceof HTMLButtonElement ? 'button' : undefined),
      element_location: element.dataset.analyticsLocation,
      content_type: element.dataset.contentType,
      content_id: element.dataset.contentId,
      method: element.dataset.contactMethod,
      link_url: element instanceof HTMLAnchorElement ? element.getAttribute('href') : undefined,
    };
    return { eventName, params };
  }

  document.addEventListener(
    'click',
    (event) => {
      const target = event.target instanceof Element ? event.target.closest('[data-analytics-event]') : null;
      if (!(target instanceof HTMLElement)) return;
      const { eventName, params } = clickParameters(target);
      if (!eventName || eventName === 'faq_open') return;

      if (eventName === 'language_change') {
        const previousLanguage = siteLanguage();
        const selectedLanguage = target.dataset.selectedLanguage || target.dataset.lang;
        if (!selectedLanguage || previousLanguage === selectedLanguage) return;
        push(eventName, {
          previous_language: previousLanguage,
          selected_language: selectedLanguage,
          element_location: target.dataset.analyticsLocation,
        });
        return;
      }

      push(eventName, params);
    },
    true,
  );

  document.addEventListener(
    'input',
    (event) => {
      const field = event.target;
      if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement)) {
        return;
      }
      const form = field.form;
      const context = formContext(form);
      if (!form || !context) return;
      validationReportedForms.delete(form);
      if (startedForms.has(form)) return;
      startedForms.add(form);
      push('contact_form_start', context);
    },
    true,
  );

  document.addEventListener(
    'invalid',
    (event) => {
      const field = event.target;
      if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement)) {
        return;
      }
      const form = field.form;
      if (!form || validationReportedForms.has(form)) return;
      validationReportedForms.add(form);
      trackFormError(form, 'validation', field.name || field.id || undefined);
    },
    true,
  );

  document.addEventListener(
    'toggle',
    (event) => {
      const details = event.target;
      if (!(details instanceof HTMLDetailsElement) || !details.open || details.dataset.analyticsEvent !== 'faq_open') return;
      push('faq_open', {
        content_type: details.dataset.contentType || 'faq',
        content_id: details.dataset.contentId,
        element_location: details.dataset.analyticsLocation,
      });
    },
    true,
  );

  window.AlmeronAnalytics = Object.freeze({
    push,
    trackFormSubmitAttempt,
    trackFormError,
    trackFormSuccess,
  });
})(window, document);
