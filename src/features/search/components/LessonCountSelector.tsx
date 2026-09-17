import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
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
  const isPreset = PRESETS.includes(count);
  const [customMode, setCustomMode] = useState(!isPreset);

  return (
    <div>
      <h2 className="text-lg font-semibold text-[var(--color-m-text)]">{tr.howManyLessons}</h2>
      <p className="mt-1 text-sm text-[var(--color-m-text-muted)]">{tr.lessonHourNote}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {PRESETS.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => {
              setCustomMode(false);
              onChange(n);
            }}
            className={countPickerItemClass(!customMode && count === n)}
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            setCustomMode(true);
            if (isPreset) onChange(PRESETS[PRESETS.length - 1]! + 1);
          }}
          className={countPickerItemClass(customMode)}
        >
          {tr.customLessonCount}
        </button>
      </div>

      {customMode ? (
        <div className="mt-4 flex items-center gap-4">
          <button
            type="button"
            aria-label="-"
            onClick={() => onChange(Math.max(1, count - 1))}
            className="flex size-10 items-center justify-center rounded-full border border-[var(--color-m-card-border)] text-[var(--color-m-text)] transition hover:border-[var(--color-m-primary)]"
          >
            <Minus className="size-4" aria-hidden />
          </button>
          <span className="w-8 text-center text-lg font-semibold text-[var(--color-m-text)]">
            {count}
          </span>
          <button
            type="button"
            aria-label="+"
            onClick={() => onChange(count + 1)}
            className="flex size-10 items-center justify-center rounded-full border border-[var(--color-m-card-border)] text-[var(--color-m-text)] transition hover:border-[var(--color-m-primary)]"
          >
            <Plus className="size-4" aria-hidden />
          </button>
        </div>
      ) : null}
    </div>
  );
}
