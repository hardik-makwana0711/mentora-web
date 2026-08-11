import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const styles = {
  default: 'bg-[var(--color-m-surface-elevated)] text-[var(--color-m-text-secondary)]',
  primary: 'bg-[var(--color-m-primary)]/25 text-[var(--color-m-primary-light)]',
  info: 'bg-[var(--color-m-info)]/20 text-[var(--color-m-info)]',
  success: 'bg-[var(--color-m-success)]/20 text-[var(--color-m-success)]',
  warning: 'bg-[var(--color-m-warning)]/20 text-[var(--color-m-warning)]',
  danger: 'bg-[var(--color-m-error)]/15 text-[var(--color-m-error)]',
} as const;

export function Badge({
  className,
  variant = 'default',
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: keyof typeof styles }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
        styles[variant],
        className
      )}
      {...props}
    />
  );
}
