import type { SelectHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, label, error, id, children, ...props },
  ref
) {
  const sid = id ?? props.name;
  return (
    <div className="mb-4 w-full">
      {label ? (
        <label
          className="mb-2 block text-[13px] font-semibold uppercase tracking-[0.3px] text-[var(--color-m-text-secondary)]"
          htmlFor={sid}
        >
          {label}
        </label>
      ) : null}
      <div
        className={cn(
          'flex min-h-[52px] flex-row items-center overflow-hidden rounded-[12px] border-[1.5px] bg-[var(--color-m-surface-light)] transition-colors',
          error ? 'border-[var(--color-m-error)]' : 'border-[var(--color-m-card-border)]',
          'focus-within:border-[var(--color-m-primary)] focus-within:bg-[var(--color-m-surface-elevated)]'
        )}
      >
        <select
          ref={ref}
          id={sid}
          className={cn(
            'min-h-[52px] w-full flex-1 cursor-pointer border-0 bg-transparent px-4 text-[15px] text-[var(--color-m-text)] outline-none',
            className
          )}
          {...props}
        >
          {children}
        </select>
      </div>
      {error ? <p className="mt-1 pl-1 text-[11px] text-[var(--color-m-error)]">{error}</p> : null}
    </div>
  );
});
