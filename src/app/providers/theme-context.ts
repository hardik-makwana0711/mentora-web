import { createContext, useContext } from 'react';
import {
  applyAppTheme,
  getStoredAppTheme,
  setStoredAppTheme,
  type AppTheme,
} from '@/lib/app-theme';

export type ThemeContextValue = {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export const themeListeners = new Set<() => void>();
export let themeSnapshot: AppTheme = getStoredAppTheme();

export function emitThemeChange() {
  themeListeners.forEach((l) => l());
}

export function subscribeTheme(onStoreChange: () => void) {
  themeListeners.add(onStoreChange);
  return () => themeListeners.delete(onStoreChange);
}

export function getThemeSnapshot(): AppTheme {
  return themeSnapshot;
}

export function setThemeGlobal(next: AppTheme) {
  if (themeSnapshot === next) return;
  themeSnapshot = next;
  setStoredAppTheme(next);
  applyAppTheme(next);
  emitThemeChange();
}

export function useAppTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAppTheme must be used within ThemeProvider');
  return ctx;
}
