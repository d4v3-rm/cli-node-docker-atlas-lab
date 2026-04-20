import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '@/locales/en.json';
import it from '@/locales/it.json';

export const dashboardLanguages = ['it', 'en'] as const;
export type DashboardLanguage = (typeof dashboardLanguages)[number];

export const dashboardLanguageStorageKey = 'atlas-dashboard-language';

const resources = {
  en: {
    translation: en
  },
  it: {
    translation: it
  }
} as const;

export function resolveDashboardLanguage(
  value: string | null | undefined
): DashboardLanguage | null {
  if (!value) {
    return null;
  }

  const normalizedValue = value.trim().toLowerCase().slice(0, 2);
  return dashboardLanguages.includes(normalizedValue as DashboardLanguage)
    ? (normalizedValue as DashboardLanguage)
    : null;
}

function resolveInitialLanguage(): DashboardLanguage {
  if (typeof window === 'undefined') {
    return 'it';
  }

  const storedLanguage = resolveDashboardLanguage(
    window.localStorage.getItem(dashboardLanguageStorageKey)
  );
  if (storedLanguage) {
    return storedLanguage;
  }

  const browserLanguage = resolveDashboardLanguage(window.navigator.language);
  return browserLanguage ?? 'it';
}

function syncDocumentLanguage(language: string) {
  if (typeof document === 'undefined') {
    return;
  }

  const normalizedLanguage = resolveDashboardLanguage(language) ?? 'it';
  document.documentElement.lang = normalizedLanguage;
}

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    lng: resolveInitialLanguage(),
    resources,
    supportedLngs: dashboardLanguages
  });

  if (typeof window !== 'undefined') {
    i18n.on('languageChanged', (language) => {
      const normalizedLanguage = resolveDashboardLanguage(language);

      if (normalizedLanguage) {
        window.localStorage.setItem(dashboardLanguageStorageKey, normalizedLanguage);
        syncDocumentLanguage(normalizedLanguage);
      }
    });
  }
}

syncDocumentLanguage(i18n.resolvedLanguage ?? i18n.language);

export default i18n;
