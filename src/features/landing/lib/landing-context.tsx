import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useAppLocale } from '@/hooks/use-app-locale';
import { createLandingCopy, type LandingCopy, type LandingLanguage } from './copy';

type LandingContextValue = {
  language: LandingLanguage;
  setLanguage: (lang: LandingLanguage) => void;
  t: LandingCopy;
};

const LandingContext = createContext<LandingContextValue | null>(null);

export function LandingLanguageProvider({ children }: { children: ReactNode }) {
  const { locale, setLocale } = useAppLocale();
  const language = locale as LandingLanguage;
  const t = useMemo(() => createLandingCopy(language), [language]);

  return (
    <LandingContext.Provider value={{ language, setLanguage: setLocale, t }}>
      {children}
    </LandingContext.Provider>
  );
}

export function useLandingLanguage() {
  const ctx = useContext(LandingContext);
  if (!ctx) throw new Error('useLandingLanguage must be used within LandingLanguageProvider');
  return ctx;
}
