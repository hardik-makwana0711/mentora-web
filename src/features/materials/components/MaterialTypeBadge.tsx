import { cn } from '@/lib/utils';
import { useStrings } from '@/constants/strings';
import type { MaterialType } from '@/services/materials.service';

export function MaterialTypeBadge({ type }: { type: MaterialType }) {
  const tr = useStrings();
  const isAssignment = type === 'assignment';
  return (
    <span
      className={cn(
        'inline-flex shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        isAssignment
          ? 'border-orange-500/30 bg-orange-500/10 text-orange-400'
          : 'border-[var(--color-brand-primary)]/30 bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]'
      )}
    >
      {isAssignment ? tr.materialTypeAssignment : tr.materialTypeCourseResource}
    </span>
  );
}
