import { useStrings } from '@/constants/strings';
import { DashboardPanelCard } from '@/features/dashboard/components/DashboardPanelCard';

type AvailabilityCardProps = {
  openSlots: number;
  bookedSlots: number;
  /** TODO: Wire when availability API exposes next open slot time. */
  nextAvailableTime?: string | null;
};

export function AvailabilityCard({
  openSlots,
  bookedSlots,
  nextAvailableTime,
}: AvailabilityCardProps) {
  const tr = useStrings();
  const total = openSlots + bookedSlots;
  const bookedPct = total > 0 ? Math.round((bookedSlots / total) * 100) : 0;

  return (
    <DashboardPanelCard>
      <p className="text-sm font-semibold text-[var(--color-m-text)]">{tr.availabilityStatus}</p>
      <div className="mt-4 flex flex-wrap gap-4">
        <div className="flex-1 text-center">
          <div className="mx-auto mb-1 h-2 w-2 rounded-full bg-green-500" />
          <p className="text-2xl font-bold text-[var(--color-m-text)]">{openSlots}</p>
          <p className="text-xs text-[var(--color-text-muted)]">{tr.dashboardOpenSlots}</p>
        </div>
        <div className="flex-1 text-center">
          <div className="mx-auto mb-1 h-2 w-2 rounded-full bg-[var(--color-brand-primary)]" />
          <p className="text-2xl font-bold text-[var(--color-m-text)]">{bookedSlots}</p>
          <p className="text-xs text-[var(--color-text-muted)]">{tr.dashboardBookedSlots}</p>
        </div>
        <div className="flex-1 text-center">
          <div className="mb-1 flex items-center justify-center">
            <svg className="size-2" viewBox="0 0 6 6" aria-hidden>
              <rect width="6" height="6" rx="1" className="fill-[var(--color-text-muted)]" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-[var(--color-m-text)]">{total}</p>
          <p className="text-xs text-[var(--color-text-muted)]">{tr.dashboardTotal}</p>
        </div>
      </div>
      {total > 0 && (
        <div className="mt-4">
          <div className="h-2 overflow-hidden rounded-full bg-[var(--color-m-card-border)]">
            <div
              className="h-full rounded-full bg-[var(--color-brand-primary)] transition-all"
              style={{ width: `${bookedPct}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-[var(--color-text-muted)]">
            <span>{tr.dashboardAvailableShort}</span>
            <span>{tr.dashboardBookedPercent.replace('{{percent}}', String(bookedPct))}</span>
          </div>
        </div>
      )}
      {nextAvailableTime ? (
        <p className="mt-3 text-xs text-[var(--color-m-text-muted)]">{nextAvailableTime}</p>
      ) : null}
    </DashboardPanelCard>
  );
}
