import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import type { Strings } from '@/locales/en';

function bindStrings(t: (key: string, options?: Record<string, unknown>) => string): Strings {
  return new Proxy({} as Strings, {
    get(_target, prop: string | symbol) {
      if (typeof prop !== 'string') return undefined;
      return t(prop);
    },
  });
}

const StringsContext = createContext<Strings | null>(null);

export function StringsProvider({ children }: { children: ReactNode }) {
  const { t, i18n: i18nInstance } = useTranslation();
  const locale = i18nInstance.resolvedLanguage ?? i18nInstance.language;
  const strings = useMemo(() => bindStrings(t), [t, locale]);
  return (
    <StringsContext.Provider value={strings}>
      <div key={locale}>{children}</div>
    </StringsContext.Provider>
  );
}

export function useStrings(): Strings {
  const ctx = useContext(StringsContext);
  const { t, i18n: i18nInstance } = useTranslation();
  const fallback = useMemo(
    () => bindStrings(t),
    [t, i18nInstance.resolvedLanguage ?? i18nInstance.language]
  );
  return ctx ?? fallback;
}

/** Non-React modules may read the current locale at call time. */
export const tr = bindStrings((key, options) => i18n.t(key, options));
