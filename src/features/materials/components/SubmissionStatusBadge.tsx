import { cn } from '@/lib/utils';
import { useStrings } from '@/constants/strings';
import type { SubmissionStatus } from '@/services/materials.service';
import type { ParentDisplayStatus } from '@/features/materials/lib/parent-assignment-status';

const STATUS_STYLES: Record<string, string> = {
  not_submitted:
    'border-[var(--color-m-card-border)] bg-[var(--color-m-surface-light)] text-[var(--color-m-text-muted)]',
  submitted:
    'border-[var(--color-m-success)]/30 bg-[var(--color-m-success)]/10 text-[var(--color-m-success)]',
  late: 'border-[var(--color-m-accent)]/30 bg-[var(--color-m-accent)]/10 text-[var(--color-m-accent-text)]',
  resubmitted:
    'border-[var(--color-m-info)]/30 bg-[var(--color-m-info)]/10 text-[var(--color-m-info)]',
  due_tomorrow:
    'border-[var(--color-m-warning)]/30 bg-[var(--color-m-warning)]/10 text-[var(--color-m-warning)]',
  overdue:
    'border-[var(--color-m-error)]/30 bg-[var(--color-m-error)]/10 text-[var(--color-m-error)]',
};

export function SubmissionStatusBadge({
  status,
}: {
  status?: SubmissionStatus | ParentDisplayStatus | null;
}) {
  const tr = useStrings();
  if (!status) return null;

  const labelMap: Record<string, string> = {
    not_submitted: tr.materialStatusNotSubmitted,
    submitted: tr.materialStatusSubmitted,
    late: tr.materialStatusLate,
    resubmitted: tr.materialStatusResubmitted,
    due_tomorrow: tr.materialStatusDueTomorrow,
    overdue: tr.materialStatusOverdue,
  };

  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        STATUS_STYLES[status] ?? STATUS_STYLES.not_submitted
      )}
    >
      {labelMap[status] ?? status}
    </span>
  );
}
