import { useEffect, type ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import { AppErrorBoundary } from '@/components/feedback/AppErrorBoundary';
import { LocaleRoot } from '@/app/providers/LocaleRoot';
import { StringsProvider } from '@/app/providers/StringsProvider';
import { ThemeProvider } from '@/app/providers/ThemeProvider';
import { ThemeAwareToaster } from '@/components/feedback/ThemeAwareToaster';
import { useAuthStore } from '@/app/store/authStore';
import { queryClient } from '@/app/query-client';
import i18n from '@/i18n';

let authBootstrapStarted = false;

function AuthBootstrap({ children }: { children: ReactNode }) {
  const bootstrap = useAuthStore((s) => s.bootstrap);
  useEffect(() => {
    if (authBootstrapStarted) return;
    authBootstrapStarted = true;
    void bootstrap();
  }, [bootstrap]);
  return children;
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <StringsProvider>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <AppErrorBoundary>
              <LocaleRoot>
                <AuthBootstrap>{children}</AuthBootstrap>
              </LocaleRoot>
            </AppErrorBoundary>
          </QueryClientProvider>
          <ThemeAwareToaster />
        </ThemeProvider>
      </StringsProvider>
    </I18nextProvider>
  );
}
