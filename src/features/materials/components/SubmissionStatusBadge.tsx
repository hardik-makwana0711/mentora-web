import { cn } from '@/lib/utils';
import { useStrings } from '@/constants/strings';
import type { SubmissionStatus } from '@/services/materials.service';
import type { ParentDisplayStatus } from '@/features/materials/lib/parent-assignment-status';

const STATUS_STYLES: Record<string, string> = {
  not_submitted: 'border-[var(--color-m-card-border)] bg-[var(--color-m-surface-light)] text-[var(--color-m-text-muted)]',
  submitted: 'border-green-500/30 bg-green-500/10 text-green-400',
  late: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
  resubmitted: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  due_tomorrow: 'border-orange-500/30 bg-orange-500/10 text-orange-400',
  overdue: 'border-red-500/30 bg-red-500/10 text-red-400',
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
