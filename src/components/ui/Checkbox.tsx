import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { className, label, id, ...props },
  ref
) {
  const cid = id ?? props.name;
  return (
    <label
      className="mb-4 flex cursor-pointer items-center gap-2 text-[15px] text-[var(--color-m-text-secondary)]"
      htmlFor={cid}
    >
      <input
        ref={ref}
        id={cid}
        type="checkbox"
        className={cn(
          'size-4 rounded border-[1.5px] border-[var(--color-m-card-border)] bg-[var(--color-m-surface-light)] text-[var(--color-m-primary)] accent-[var(--color-m-primary)] focus:ring-2 focus:ring-[var(--color-m-primary)] focus:ring-offset-0',
          className
        )}
        {...props}
      />
      <span>{label}</span>
    </label>
  );
});
