import { useCallback, useSyncExternalStore } from 'react';
import i18n from '@/i18n';
import {
  getStoredAppLocale,
  normalizeAppLocale,
  setStoredAppLocale,
  type AppLocale,
} from '@/lib/app-locale';

function subscribe(onStoreChange: () => void) {
  i18n.on('languageChanged', onStoreChange);
  return () => i18n.off('languageChanged', onStoreChange);
}

function getSnapshot(): AppLocale {
  return normalizeAppLocale(i18n.resolvedLanguage ?? i18n.language);
}

export function useAppLocale() {
  const locale = useSyncExternalStore(subscribe, getSnapshot, () => 'en' as AppLocale);

  const setLocale = useCallback((next: AppLocale) => {
    if (normalizeAppLocale(next) === getSnapshot()) return;
    setStoredAppLocale(next);
    void i18n.changeLanguage(next);
    document.documentElement.lang = next;
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'tr' ? 'en' : 'tr');
  }, [locale, setLocale]);

  return { locale, setLocale, toggleLocale };
}

export function initAppLocale(): AppLocale {
  const stored = getStoredAppLocale();
  void i18n.changeLanguage(stored);
  document.documentElement.lang = stored;
  return stored;
}
