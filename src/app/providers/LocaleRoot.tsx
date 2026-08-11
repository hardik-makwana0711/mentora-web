import { useEffect, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import { getStoredAppLocale, normalizeAppLocale } from '@/lib/app-locale';

/** Remounts the app tree when language changes so legacy `tr.*` reads refresh everywhere. */
export function LocaleRoot({ children }: { children: ReactNode }) {
  const { i18n: i18nInstance } = useTranslation();
  const locale = normalizeAppLocale(i18nInstance.resolvedLanguage ?? i18nInstance.language);

  useEffect(() => {
    const stored = getStoredAppLocale();
    if (stored !== locale) {
      void i18nInstance.changeLanguage(stored);
    }
    const onLanguageChanged = () => {
      document.documentElement.lang = i18nInstance.resolvedLanguage ?? i18nInstance.language;
      document.title = i18n.t('appName');
    };
    i18nInstance.on('languageChanged', onLanguageChanged);
    return () => i18nInstance.off('languageChanged', onLanguageChanged);
  }, [i18nInstance, locale]);

  return <div key={locale}>{children}</div>;
}
