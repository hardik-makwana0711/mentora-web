import { useCallback, useMemo, useSyncExternalStore, type ReactNode } from 'react';
import type { AppTheme } from '@/lib/app-theme';
import {
  ThemeContext,
  getThemeSnapshot,
  setThemeGlobal,
  subscribeTheme,
} from '@/app/providers/theme-context';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, () => 'light' as AppTheme);

  const setTheme = useCallback((next: AppTheme) => {
    setThemeGlobal(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeGlobal(theme === 'dark' ? 'light' : 'dark');
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
