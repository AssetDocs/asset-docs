import { useState, useEffect } from 'react';

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

export interface CookieConsent {
  hasConsented: boolean;
  preferences: CookiePreferences;
  consentDate: string;
}

const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true, // Always true, can't be disabled
  analytics: false,
  marketing: false,
  functional: false,
};

const COOKIE_CONSENT_KEY = 'property-tracker-cookie-consent';

export const useCookieConsent = () => {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (stored) {
      try {
        const parsedConsent = JSON.parse(stored);
        setConsent(parsedConsent);
        setShowBanner(false);
      } catch (error) {
        console.error('Error parsing stored cookie consent:', error);
        setShowBanner(true);
      }
    } else {
      setShowBanner(true);
    }
  }, []);

  const saveConsent = (preferences: CookiePreferences) => {
    const consentData: CookieConsent = {
      hasConsented: true,
      preferences: { ...preferences, necessary: true }, // Ensure necessary is always true
      consentDate: new Date().toISOString(),
    };

    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentData));
    setConsent(consentData);
    setShowBanner(false);

    // Trigger any analytics or tracking setup based on preferences
    if (preferences.analytics) {
      // Initialize analytics
      console.log('Analytics cookies accepted');
    }
    if (preferences.marketing) {
      // Initialize marketing pixels
      console.log('Marketing cookies accepted');
    }
    if (preferences.functional) {
      // Initialize functional cookies
      console.log('Functional cookies accepted');
    }
  };

  const acceptAll = () => {
    saveConsent({
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    });
  };

  const rejectAll = () => {
    saveConsent({
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    });
  };

  const resetConsent = () => {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    setConsent(null);
    setShowBanner(true);
  };

  return {
    consent,
    showBanner,
    acceptAll,
    rejectAll,
    saveConsent,
    resetConsent,
    hasAnalytics: consent?.preferences.analytics ?? false,
    hasMarketing: consent?.preferences.marketing ?? false,
    hasFunctional: consent?.preferences.functional ?? false,
  };
};