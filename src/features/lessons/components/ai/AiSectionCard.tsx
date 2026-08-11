import { Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';

export function AiSectionCard({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="rounded-2xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-[var(--color-brand-primary)]" />
          <h3 className="text-sm font-semibold text-[var(--color-m-text)]">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
