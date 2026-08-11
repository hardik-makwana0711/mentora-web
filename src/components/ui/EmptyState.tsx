import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[var(--color-surface-border)] bg-[var(--color-surface-card)]/40 px-6 py-14 text-center">
      <Inbox className="size-10 text-[var(--color-text-muted)]" aria-hidden />
      <div>
        <p className="text-base font-medium text-[var(--color-text-primary)]">{title}</p>
        {description ? (
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
