import { Users, User } from 'lucide-react';
import { useStrings } from '@/constants/strings';
import { LISTING_LESSON_FORMATS } from '@/features/listings/lib/listing-labels';
import type { ListingLessonFormat } from '@/types/listings';
import { segmentOptionClass, segmentTrackClass } from '@/lib/button-styles';
import { FormField } from '@/features/listings/components/FormField';

export function LessonFormatSelector({
  value,
  onChange,
  error,
  disabled,
}: {
  value: ListingLessonFormat;
  onChange: (next: ListingLessonFormat) => void;
  error?: string;
  disabled?: boolean;
}) {
  const tr = useStrings();

  return (
    <FormField label={tr.listingLessonFormat} error={error}>
      <div className={segmentTrackClass()}>
        {LISTING_LESSON_FORMATS.map((f) => {
          const active = value === f.value;
          const Icon = f.value === 'one_to_one' ? User : Users;
          return (
            <button
              key={f.value}
              type="button"
              disabled={disabled}
              onClick={() => onChange(f.value)}
              className={segmentOptionClass(active, disabled)}
            >
              <Icon className="size-4" aria-hidden />
              {tr[f.labelKey as keyof typeof tr]}
            </button>
          );
        })}
      </div>
    </FormField>
  );
}
