import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { useStrings } from '@/constants/strings';
import { AppChromeControls } from '@/components/ui/AppChromeControls';

/**
 * Visual shell matching `apps/mobile/src/screens/auth/LoginScreen.tsx`
 * (gradient bg, blobs, logo block, content card area).
 */
export function AuthScreenChrome({
  children,
  card,
  showClose = true,
  closeTo = '/',
}: {
  children: ReactNode;
  /** Main form card (mobile `styles.card`) */
  card: ReactNode;
  /** Top-right control to return to the public landing page */
  showClose?: boolean;
  closeTo?: string;
}) {
  const tr = useStrings();
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-[var(--color-m-bg)]">
      <div className="pointer-events-none absolute inset-0 auth-screen-bg" aria-hidden />
      <div
        className="pointer-events-none absolute -right-20 -top-20 size-[300px] rounded-full auth-screen-blob-primary blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-24 -left-20 size-[250px] rounded-full auth-screen-blob-accent blur-2xl"
        aria-hidden
      />

      <div className="absolute right-4 top-4 z-20 flex items-center gap-2 sm:right-6 sm:top-6">
        <AppChromeControls className="rounded-full border border-[var(--color-m-card-border)] bg-[var(--color-m-surface)]/90 p-1 shadow-[var(--shadow-m-card)] backdrop-blur-sm" />
        {showClose ? (
          <Link
            to={closeTo}
            className="flex size-9 items-center justify-center rounded-full border border-[var(--color-m-card-border)] bg-[var(--color-m-surface)]/90 text-[var(--color-m-text-secondary)] shadow-[var(--shadow-m-card)] backdrop-blur-sm transition hover:border-[var(--color-m-primary)]/40 hover:bg-[var(--color-m-surface)] hover:text-[var(--color-m-text)]"
            aria-label={tr.backToLanding}
            title={tr.backToLanding}
          >
            <X className="size-5" aria-hidden />
          </Link>
        ) : null}
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center px-5 pb-16 pt-14 sm:px-8 sm:pt-20">
        {children}

        <div className="mt-10 w-full max-w-md">{card}</div>
      </div>
    </div>
  );
}

export function AuthLogoBlock({
  appName,
  tagline,
}: {
  appName: string;
  tagline: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div
        className="mb-4 shadow-[var(--shadow-m-glow)]"
        style={{ borderRadius: 24 }}
      >
        <div
          className="flex size-20 items-center justify-center bg-gradient-to-br from-[var(--color-m-primary)] to-[#8B5CF6]"
          style={{ borderRadius: 24 }}
        >
          <span className="text-[40px] leading-none" role="img" aria-hidden>
            🎓
          </span>
        </div>
      </div>
      <h1
        className="text-[36px] font-extrabold tracking-tight text-[var(--color-m-text)]"
        style={{ letterSpacing: -1 }}
      >
        {appName}
      </h1>
      <p className="mt-1 text-[15px] text-[var(--color-m-text-secondary)]">{tagline}</p>
    </div>
  );
}

export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <div
      className="border border-[var(--color-m-card-border)] bg-[var(--color-m-surface)] p-6 sm:p-8"
      style={{ borderRadius: 24 }}
    >
      {children}
    </div>
  );
}
