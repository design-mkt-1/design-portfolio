(function initializeConsentPreferences(window, document) {
  'use strict';

  const bootstrap = window.AlmeronConsentBootstrap || {};
  const preferenceKey = bootstrap.preferenceKey || 'almeron_consent_v1';
  const banner = document.getElementById('consent-banner');
  const dialog = document.getElementById('consent-dialog');
  const analyticsInput = document.getElementById('consent-analytics');
  const adsInput = document.getElementById('consent-ads');

  if (!(analyticsInput instanceof HTMLInputElement) || !(adsInput instanceof HTMLInputElement)) return;

  function readPreference() {
    const bootstrapped = bootstrap.preference;
    if (
      bootstrapped &&
      bootstrapped.version === 1 &&
      typeof bootstrapped.analytics === 'boolean' &&
      typeof bootstrapped.ads === 'boolean'
    ) {
      return bootstrapped;
    }
    try {
      const stored = JSON.parse(window.localStorage.getItem(preferenceKey) || 'null');
      return stored &&
        stored.version === 1 &&
        typeof stored.analytics === 'boolean' &&
        typeof stored.ads === 'boolean'
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

  function updateConsent(action, analytics, ads) {
    currentPreference = { version: 1, analytics: Boolean(analytics), ads: Boolean(ads) };
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

    if (banner) banner.hidden = true;
    syncInputs(currentPreference);
    closeDialog();
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
