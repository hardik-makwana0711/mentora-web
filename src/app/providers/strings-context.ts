import { createContext, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import type { Strings } from '@/locales/en';

export function bindStrings(
  t: (key: string, options?: Record<string, unknown>) => string
): Strings {
  return new Proxy({} as Strings, {
    get(_target, prop: string | symbol) {
      if (typeof prop !== 'string') return undefined;
      return t(prop);
    },
  });
}

export const StringsContext = createContext<Strings | null>(null);

export function useStrings(): Strings {
  const ctx = useContext(StringsContext);
  const { t, i18n: i18nInstance } = useTranslation();
  const locale = i18nInstance.resolvedLanguage ?? i18nInstance.language;
  // `locale` isn't read inside the callback, but bindStrings must re-bind whenever
  // the active language changes so consumers don't render stale translations.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fallback = useMemo(() => bindStrings(t), [t, locale]);
  return ctx ?? fallback;
}

/** Non-React modules may read the current locale at call time. */
export const tr = bindStrings((key, options) => i18n.t(key, options));
