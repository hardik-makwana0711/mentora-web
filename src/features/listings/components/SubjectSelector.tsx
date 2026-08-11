import { useStrings } from '@/constants/strings';
import { LISTING_SUBJECTS } from '@/features/listings/lib/listing-labels';
import { FormField } from '@/features/listings/components/FormField';
import type { ListingSubject } from '@/types/listings';
import { choicePillClass } from '@/lib/button-styles';

export function SubjectSelector({
  value,
  onChange,
  onBlur,
  error,
  disabled,
}: {
  value: string;
  onChange: (next: ListingSubject | '') => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
}) {
  const tr = useStrings();

  function select(subject: ListingSubject) {
    if (disabled) return;
    onChange(value === subject ? '' : subject);
    onBlur?.();
  }

  return (
    <FormField label={tr.filterSubject} error={error}>
      <div className="flex flex-wrap gap-2" role="group" aria-label={tr.filterSubject}>
        {LISTING_SUBJECTS.map((s) => {
          const selected = value === s.value;
          return (
            <button
              key={s.value}
              type="button"
              disabled={disabled}
              aria-pressed={selected}
              onClick={() => select(s.value)}
              className={choicePillClass(selected, disabled)}
            >
              {tr[s.labelKey as keyof typeof tr]}
            </button>
          );
        })}
      </div>
    </FormField>
  );
}
