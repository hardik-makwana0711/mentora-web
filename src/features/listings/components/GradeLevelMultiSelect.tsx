import { useStrings } from '@/constants/strings';
import { LISTING_GRADE_LEVELS } from '@/features/listings/lib/listing-labels';
import type { ListingGradeLevel } from '@/types/listings';
import { choicePillClass } from '@/lib/button-styles';
import { FormField } from '@/features/listings/components/FormField';

export function GradeLevelMultiSelect({
  value,
  onChange,
  error,
  disabled,
}: {
  value: ListingGradeLevel[];
  onChange: (next: ListingGradeLevel[]) => void;
  error?: string;
  disabled?: boolean;
}) {
  const tr = useStrings();

  function toggle(level: ListingGradeLevel) {
    if (disabled) return;
    onChange(value.includes(level) ? value.filter((v) => v !== level) : [...value, level]);
  }

  return (
    <FormField label={tr.gradesLabel} error={error}>
      <div className="flex flex-wrap gap-2">
        {LISTING_GRADE_LEVELS.map((g) => {
          const selected = value.includes(g.value);
          return (
            <button
              key={g.value}
              type="button"
              disabled={disabled}
              onClick={() => toggle(g.value)}
              className={choicePillClass(selected, disabled)}
            >
              {tr[g.labelKey as keyof typeof tr]}
            </button>
          );
        })}
      </div>
    </FormField>
  );
}
