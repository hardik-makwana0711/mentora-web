import { countPickerItemClass } from '@/lib/button-styles';
import { useStrings } from '@/constants/strings';

const PRESETS = [1, 2, 3, 4];

export function LessonCountSelector({
  count,
  onChange,
}: {
  count: number;
  onChange: (n: number) => void;
}) {
  const tr = useStrings();
  return (
    <div>
      <h2 className="text-lg font-semibold text-[var(--color-m-text)]">{tr.howManyLessons}</h2>
      <p className="mt-1 text-sm text-[var(--color-m-text-muted)]">{tr.lessonHourNote}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {PRESETS.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={countPickerItemClass(count === n)}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
