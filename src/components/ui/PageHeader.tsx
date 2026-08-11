import type { ReactNode } from 'react';

/** Section title — `FontSizes.xxl` / `FontWeights.bold` from mobile theme */
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-[var(--color-m-card-border)]/80 pb-6 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0 flex-1">
        <h1 className="text-[28px] font-bold tracking-tight text-[var(--color-m-text)] md:text-[32px]">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 text-[15px] text-[var(--color-m-text-secondary)] md:text-base">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
