import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Spinner } from '@/components/ui/Spinner';

export function SuspenseLayout() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-[var(--color-surface-bg)]">
          <Spinner className="size-10 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />
        </div>
      }
    >
      <Outlet />
    </Suspense>
  );
}
