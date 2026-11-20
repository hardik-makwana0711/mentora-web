import { cn } from '@/lib/utils';
import { useStrings } from '@/constants/strings';
import type { MaterialType } from '@/services/materials.service';

export function MaterialTypeBadge({ type }: { type: MaterialType }) {
  const tr = useStrings();
  const isAssignment = type === 'assignment';
  return (
    <span
      className={cn(
        'inline-flex shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide',
        isAssignment
          ? 'border-[var(--color-m-warning)]/30 bg-[var(--color-m-warning)]/10 text-[var(--color-m-warning)]'
          : 'border-[var(--color-brand-primary)]/30 bg-[var(--color-brand-primary)]/10 text-[var(--color-m-primary-text)]'
      )}
    >
      {isAssignment ? tr.materialTypeAssignment : tr.materialTypeCourseResource}
    </span>
  );
}
