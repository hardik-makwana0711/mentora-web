import { X } from 'lucide-react';
import { useStrings } from '@/constants/strings';
import { choicePillClass } from '@/lib/button-styles';
import {
  formatGradeLevel,
  formatLessonFormat,
  formatSubject,
} from '@/features/search/lib/format-labels';
import type { SearchFilters, StructuredFilterLabels } from '@/types/search';

type ActiveFilterChip = {
  key: keyof SearchFilters;
  label: string;
};

function buildActiveChips(filters: SearchFilters, labels: StructuredFilterLabels): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = [];
  if (filters.university_id && labels.university_name) {
    chips.push({ key: 'university_id', label: labels.university_name });
  }
  if (filters.grade != null && labels.grade_display) {
    chips.push({ key: 'grade', label: labels.grade_display });
  }
  if (filters.subject_id && labels.subject_name) {
    chips.push({ key: 'subject_id', label: labels.subject_name });
  }
  if (filters.exam_track_subject_id && labels.exam_subject_name) {
    chips.push({ key: 'exam_track_subject_id', label: labels.exam_subject_name });
  }
  if (filters.subject) {
    chips.push({ key: 'subject', label: formatSubject(filters.subject) });
  }
  if (filters.grade_level) {
    chips.push({ key: 'grade_level', label: formatGradeLevel(filters.grade_level) });
  }
  if (filters.lesson_format) {
    chips.push({ key: 'lesson_format', label: formatLessonFormat(filters.lesson_format) });
  }
  if (filters.rating != null) {
    chips.push({ key: 'rating', label: `${filters.rating}★+` });
  }
  return chips;
}

export function ActiveFilterChips({
  filters,
  labels,
  onChange,
  onLabelsChange,
  onClearAll,
}: {
  filters: SearchFilters;
  labels: StructuredFilterLabels;
  onChange: (next: SearchFilters) => void;
  onLabelsChange?: (next: StructuredFilterLabels) => void;
  onClearAll: () => void;
}) {
  const tr = useStrings();
  const chips = buildActiveChips(filters, labels);
  if (chips.length === 0) return null;

  function removeChip(key: keyof SearchFilters) {
    const next = { ...filters, [key]: undefined };
    const nextLabels = { ...labels };
    if (key === 'university_id') delete nextLabels.university_name;
    if (key === 'grade') {
      next.subject_id = undefined;
      delete nextLabels.grade_display;
      delete nextLabels.subject_name;
    }
    if (key === 'subject_id') {
      next.grade = undefined;
      delete nextLabels.subject_name;
      delete nextLabels.grade_display;
    }
    if (key === 'exam_track_subject_id') delete nextLabels.exam_subject_name;
    onChange(next);
    onLabelsChange?.(nextLabels);
  }

  return (
    <div className="mt-3 rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-bg)]/60 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-m-text-secondary)]">
          {tr.activeFilters}
        </p>
        <button
          type="button"
          onClick={onClearAll}
          className="text-xs font-medium text-[var(--color-m-primary)] hover:underline"
        >
          {tr.clearAllFilters}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <span key={chip.key} className={`${choicePillClass(true)} inline-flex items-center gap-1`}>
            {chip.label}
            <button
              type="button"
              aria-label={tr.clearSelection}
              className="inline-flex rounded-full p-0.5 hover:bg-[var(--color-m-hover-overlay)]"
              onClick={() => removeChip(chip.key)}
            >
              <X className="size-3.5" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
