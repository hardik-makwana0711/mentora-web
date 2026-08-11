import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { env } from '@/config/env';
import { getStoredAppLocale } from '@/lib/app-locale';
import { en } from '@/locales/en';
import { tr as trLocale } from '@/locales/tr';

export type AppLocale = 'en' | 'tr';
export const APP_LOCALES: AppLocale[] = ['en', 'tr'];

const initialLocale = getStoredAppLocale();
const appName = env.appName || en.appName;

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: { ...en, appName } },
    tr: { translation: { ...trLocale, appName } },
  },
  lng: initialLocale,
  fallbackLng: 'en',
  supportedLngs: APP_LOCALES,
  interpolation: { escapeValue: false },
  returnEmptyString: false,
  react: {
    useSuspense: false,
    bindI18n: 'languageChanged',
    bindI18nStore: 'added removed',
  },
});

document.documentElement.lang = initialLocale;
document.title = i18n.t('appName');

i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
  document.title = i18n.t('appName');
});

export default i18n;
