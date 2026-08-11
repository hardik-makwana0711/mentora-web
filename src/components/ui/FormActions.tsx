import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Form footer — primary CTA first (left on desktop), secondary cancel beside it. */
export function FormActions({
  children,
  className,
  align = 'start',
}: {
  children: ReactNode;
  className?: string;
  align?: 'start' | 'end';
}) {
  return (
    <div
      className={cn(
        'flex flex-col-reverse gap-3 pt-6 sm:flex-row',
        align === 'end' ? 'sm:justify-end' : 'sm:justify-start',
        className
      )}
    >
      {children}
    </div>
  );
}
