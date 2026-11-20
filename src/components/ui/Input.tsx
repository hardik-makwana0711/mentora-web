import { forwardRef, type InputHTMLAttributes, useId } from 'react';
import { cn } from '@/lib/utils';

/** Matches `apps/mobile/src/components/common/Input.tsx` */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, label, error, hint, id, onFocus, onBlur, ...props },
  ref
) {
  const autoId = useId();
  const inputId = id ?? props.name ?? autoId;

  return (
    <div className="mb-4 w-full">
      {label ? (
        <label
          className="mb-2 block text-[12px] font-bold uppercase tracking-[0.7px] text-[var(--color-m-text-secondary)]"
          htmlFor={inputId}
        >
          {label}
        </label>
      ) : null}
      <div
        className={cn(
          'flex min-h-[52px] flex-row items-center overflow-hidden rounded-[var(--radius-m-button)] border-[1.5px] bg-[var(--color-m-card)] transition-[border-color,box-shadow,background-color]',
          error ? 'border-[var(--color-m-error)]' : 'border-[var(--color-m-card-border)]',
          'focus-within:border-[var(--color-m-primary)] focus-within:bg-[var(--color-m-surface-elevated)] focus-within:shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-m-primary)_16%,transparent)]'
        )}
      >
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'min-h-[52px] flex-1 border-0 bg-transparent px-4 text-[15px] font-normal text-[var(--color-m-text)] outline-none placeholder:text-[var(--color-m-text-muted)]',
            className
          )}
          onFocus={onFocus}
          onBlur={onBlur}
          {...props}
        />
      </div>
      {error ? (
        <p className="mt-1 pl-1 text-[12px] text-[var(--color-m-error)]">{error}</p>
      ) : hint ? (
        <p className="mt-1 pl-1 text-[12px] text-[var(--color-m-text-muted)]">{hint}</p>
      ) : null}
    </div>
  );
});
