export type AppTheme = 'light' | 'dark';

const STORAGE_KEY = 'mentora:theme';

export function getStoredAppTheme(): AppTheme {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === 'light' || value === 'dark') return value;
  } catch {
    // Ignore storage errors.
  }
  return 'dark';
}

export function setStoredAppTheme(theme: AppTheme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Ignore storage errors.
  }
}

export function applyAppTheme(theme: AppTheme): void {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function initAppTheme(): AppTheme {
  const theme = getStoredAppTheme();
  applyAppTheme(theme);
  return theme;
}
