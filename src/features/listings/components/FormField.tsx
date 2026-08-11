import type { ReactNode } from 'react';

export function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-4 w-full">
      <label className="mb-2 block text-[13px] font-semibold uppercase tracking-[0.3px] text-[var(--color-m-text-secondary)]">
        {label}
      </label>
      {children}
      {error ? <p className="mt-1 pl-1 text-[11px] text-[var(--color-m-error)]">{error}</p> : null}
    </div>
  );
}
