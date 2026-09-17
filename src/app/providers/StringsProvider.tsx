import { useMemo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { StringsContext, bindStrings } from '@/app/providers/strings-context';

export function StringsProvider({ children }: { children: ReactNode }) {
  const { t, i18n: i18nInstance } = useTranslation();
  const locale = i18nInstance.resolvedLanguage ?? i18nInstance.language;
  // `locale` isn't read inside the callback, but bindStrings must re-bind whenever
  // the active language changes so consumers don't render stale translations.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const strings = useMemo(() => bindStrings(t), [t, locale]);
  return (
    <StringsContext.Provider value={strings}>
      <div key={locale}>{children}</div>
    </StringsContext.Provider>
  );
}
