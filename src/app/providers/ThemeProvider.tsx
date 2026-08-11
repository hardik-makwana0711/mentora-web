import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import {
  applyAppTheme,
  getStoredAppTheme,
  setStoredAppTheme,
  type AppTheme,
} from '@/lib/app-theme';

type ThemeContextValue = {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const themeListeners = new Set<() => void>();
let themeSnapshot: AppTheme = getStoredAppTheme();

function emitThemeChange() {
  themeListeners.forEach((l) => l());
}

function subscribeTheme(onStoreChange: () => void) {
  themeListeners.add(onStoreChange);
  return () => themeListeners.delete(onStoreChange);
}

function getThemeSnapshot(): AppTheme {
  return themeSnapshot;
}

function setThemeGlobal(next: AppTheme) {
  if (themeSnapshot === next) return;
  themeSnapshot = next;
  setStoredAppTheme(next);
  applyAppTheme(next);
  emitThemeChange();
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, () => 'dark' as AppTheme);

  const setTheme = useCallback((next: AppTheme) => {
    setThemeGlobal(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeGlobal(theme === 'dark' ? 'light' : 'dark');
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAppTheme must be used within ThemeProvider');
  return ctx;
}
