export type AppLocale = 'en' | 'tr';

const STORAGE_KEY = 'mentora:locale';

export function getStoredAppLocale(): AppLocale {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === 'en' || value === 'tr') return value;
  } catch {
    // Ignore storage errors (private browsing, etc.).
  }
  return 'en';
}

export function setStoredAppLocale(locale: AppLocale): void {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // Ignore storage errors.
  }
}

export function normalizeAppLocale(value: string | undefined | null): AppLocale {
  return value === 'tr' ? 'tr' : 'en';
}
