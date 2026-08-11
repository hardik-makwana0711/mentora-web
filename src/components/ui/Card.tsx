import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Matches `apps/mobile/src/components/common/Card.tsx` */
export function Card({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] p-4 shadow-[var(--shadow-m-card)] ring-1 ring-[var(--color-m-ring-subtle)] sm:p-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
