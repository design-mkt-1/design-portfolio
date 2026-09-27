(function initializeConsentPreferences(window, document) {
  'use strict';

  const bootstrap = window.AlmeronConsentBootstrap || {};
  const preferenceKey = bootstrap.preferenceKey || 'almeron_consent_v1';
  const banner = document.getElementById('consent-banner');
  const dialog = document.getElementById('consent-dialog');
  const analyticsInput = document.getElementById('consent-analytics');
  const MAX_AGE_MS = 365 * 864e5; // re-ask after 12 months (same rule as AnalyticsHead.astro)
  const fresh = (p) => !(typeof p.ts === 'number' && Date.now() - p.ts > MAX_AGE_MS);
  const adsInput = document.getElementById('consent-ads');

  if (!(analyticsInput instanceof HTMLInputElement) || !(adsInput instanceof HTMLInputElement)) return;

  function readPreference() {
    const bootstrapped = bootstrap.preference;
    if (
      bootstrapped &&
      bootstrapped.version === 1 &&
      typeof bootstrapped.analytics === 'boolean' &&
      typeof bootstrapped.ads === 'boolean' &&
      fresh(bootstrapped)
    ) {
      return bootstrapped;
    }
    try {
      const stored = JSON.parse(window.localStorage.getItem(preferenceKey) || 'null');
      return stored &&
        stored.version === 1 &&
        typeof stored.analytics === 'boolean' &&
        typeof stored.ads === 'boolean' &&
        fresh(stored)
        ? stored
        : null;
    } catch {
      return null;
    }
  }

  let currentPreference = readPreference();

  function syncInputs(preference) {
    analyticsInput.checked = Boolean(preference?.analytics);
    adsInput.checked = Boolean(preference?.ads);
  }

  function openDialog() {
    syncInputs(currentPreference);
    if (dialog instanceof HTMLDialogElement && typeof dialog.showModal === 'function') dialog.showModal();
    else dialog?.setAttribute('open', '');
  }

  function closeDialog() {
    if (dialog instanceof HTMLDialogElement && typeof dialog.close === 'function') dialog.close();
    else dialog?.removeAttribute('open');
  }

  function persistPreference(preference) {
    try {
      window.localStorage.setItem(preferenceKey, JSON.stringify(preference));
    } catch {}
  }

  // Withdrawing analytics consent also removes the GA cookies already set
  // (_ga, _ga_<id>), on this host and on the parent domain GA uses.
  function clearAnalyticsCookies() {
    try {
      const host = window.location.hostname;
      const domains = ['', host, `.${host.split('.').slice(-2).join('.')}`];
      for (const pair of document.cookie.split(';')) {
        const name = pair.split('=')[0].trim();
        if (!/^_ga(_|$)/.test(name)) continue;
        for (const d of domains) document.cookie = `${name}=; Max-Age=0; path=/${d ? `; domain=${d}` : ''}`;
      }
    } catch {
      // no cookie access (sandboxed or opaque origin): nothing to clear
    }
  }

  function updateConsent(action, analytics, ads) {
    const hadAnalytics = Boolean(currentPreference?.analytics);
    currentPreference = { version: 1, analytics: Boolean(analytics), ads: Boolean(ads), ts: Date.now() };
    bootstrap.preference = currentPreference;
    persistPreference(currentPreference);

    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage: currentPreference.analytics ? 'granted' : 'denied',
        ad_storage: currentPreference.ads ? 'granted' : 'denied',
        ad_user_data: currentPreference.ads ? 'granted' : 'denied',
        ad_personalization: currentPreference.ads ? 'granted' : 'denied',
      });
    }

    const parameters = {
      consent_action: action,
      consent_analytics: currentPreference.analytics ? 'granted' : 'denied',
      consent_ads: currentPreference.ads ? 'granted' : 'denied',
    };
    if (window.AlmeronAnalytics?.push) window.AlmeronAnalytics.push('consent_update', parameters);
    else {
      window.dataLayer = Array.isArray(window.dataLayer) ? window.dataLayer : [];
      window.dataLayer.push({ event: 'consent_update', ...parameters });
    }

    const focusWasInBanner = banner?.contains(document.activeElement);
    if (hadAnalytics && !currentPreference.analytics) clearAnalyticsCookies();
    if (banner) banner.hidden = true;
    syncInputs(currentPreference);
    closeDialog();
    // The focused button just disappeared: hand focus to the page, not <body>.
    if (focusWasInBanner) document.getElementById('main')?.focus({ preventScroll: true });
  }

  document.getElementById('consent-accept')?.addEventListener('click', () => {
    updateConsent('accept_analytics', true, false);
  });
  document.getElementById('consent-reject')?.addEventListener('click', () => {
    updateConsent('reject_non_essential', false, false);
  });
  document.getElementById('consent-manage')?.addEventListener('click', openDialog);
  document.getElementById('consent-settings')?.addEventListener('click', openDialog);
  document.getElementById('consent-cancel')?.addEventListener('click', closeDialog);
  document.getElementById('consent-save')?.addEventListener('click', () => {
    updateConsent('save_preferences', analyticsInput.checked, adsInput.checked);
  });

  dialog?.addEventListener('click', (event) => {
    if (event.target === dialog) closeDialog();
  });

  syncInputs(currentPreference);
  if (banner) banner.hidden = Boolean(currentPreference);
})(window, document);
