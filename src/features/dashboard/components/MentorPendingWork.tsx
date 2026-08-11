import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import { useStrings } from '@/constants/strings';
import { DashboardPanelCard } from '@/features/dashboard/components/DashboardPanelCard';

export type PendingWorkItem = {
  id: string;
  label: string;
  href: string;
};

type Props = {
  items: PendingWorkItem[];
};

export function MentorPendingWork({ items }: Props) {
  const tr = useStrings();
  const navigate = useNavigate();

  return (
    <DashboardPanelCard className="!p-4">
      <p className="text-sm font-semibold text-[var(--color-m-text)]">{tr.dashboardPendingWorkTitle}</p>
      {items.length === 0 ? (
        <div className="mt-3 flex items-center gap-2 text-sm text-[var(--color-m-text-secondary)]">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-500" aria-hidden />
          {tr.dashboardCaughtUp}
        </div>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => navigate(item.href)}
                className="flex w-full items-center justify-between gap-3 rounded-lg border border-[var(--color-m-card-border)] bg-[var(--color-m-surface-light)] px-3 py-2.5 text-left text-sm text-[var(--color-m-text)] transition hover:border-[var(--color-brand-primary)]/40"
              >
                <span className="min-w-0">{item.label}</span>
                <ChevronRight className="size-4 shrink-0 text-[var(--color-m-text-muted)]" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </DashboardPanelCard>
  );
}
