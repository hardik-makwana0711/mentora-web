import type { TextareaHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, label, error, id, ...props },
  ref
) {
  const tid = id ?? props.name;
  return (
    <label className="flex w-full flex-col gap-1.5 text-sm text-[var(--color-text-secondary)]" htmlFor={tid}>
      {label ? <span>{label}</span> : null}
      <textarea
        ref={ref}
        id={tid}
        className={cn(
          'min-h-[120px] w-full rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-elevated)] px-3 py-2.5 text-[var(--color-text-primary)] focus:border-[var(--color-brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-primary)]',
          error && 'border-[var(--color-brand-accent)]',
          className
        )}
        {...props}
      />
      {error ? <span className="text-xs text-[var(--color-brand-accent)]">{error}</span> : null}
    </label>
  );
});
