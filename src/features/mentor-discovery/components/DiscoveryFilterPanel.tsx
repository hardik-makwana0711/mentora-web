import { useMemo, useState, type ReactNode } from 'react';
import { GraduationCap, SlidersHorizontal, Star, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { useStrings } from '@/constants/strings';
import { choicePillClass } from '@/lib/button-styles';
import type { DiscoveryFilters } from '@/types/discovery';
import { cn } from '@/lib/utils';

const TEACHING_STYLES = [
  { value: 'Patient', labelKey: 'stylePatient' as const },
  { value: 'Motivating', labelKey: 'styleMotivating' as const },
  { value: 'Disciplined', labelKey: 'styleDisciplined' as const },
  { value: 'Friendly', labelKey: 'styleFriendly' as const },
  { value: 'Exam-Oriented', labelKey: 'styleExamOriented' as const },
  { value: 'Supportive', labelKey: 'styleSupportive' as const },
  { value: 'Structured', labelKey: 'styleStructured' as const },
  { value: 'Fun', labelKey: 'styleFun' as const },
] as const;

const TEACHING_FORMATS: ReadonlyArray<{
  value: NonNullable<DiscoveryFilters['teaching_format']>;
  labelKey: 'formatOnline' | 'formatInPerson' | 'formatHybrid';
}> = [
  { value: 'online', labelKey: 'formatOnline' },
  { value: 'in_person', labelKey: 'formatInPerson' },
  { value: 'hybrid', labelKey: 'formatHybrid' },
];

const EXAM_CHIPS = ['LGS', 'YKS', 'TYT', 'AYT', 'TOEFL'] as const;
const GRADE_NUMBERS = [8, 9, 10, 11, 12] as const;

function FilterSection({
  icon,
  title,
  children,
}: {
  icon?: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2.5">
      <div className="flex items-center gap-2">
        {icon ? <span className="text-[var(--color-m-primary)]">{icon}</span> : null}
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-m-text-secondary)]">
          {title}
        </h3>
      </div>
      {children}
    </section>
  );
}

export function countDiscoveryFilters(filters: DiscoveryFilters): number {
  let n = 0;
  if (filters.subject) n += 1;
  if (filters.exam_type) n += 1;
  if (filters.grade_level) n += 1;
  if (filters.teaching_format) n += 1;
  if (filters.min_rating) n += 1;
  if (filters.tags) n += filters.tags.split(',').filter(Boolean).length;
  return n;
}

function useSubjectChips() {
  const tr = useStrings();
  return useMemo(
    () => [
      { value: 'Mathematics', label: tr.filterMathematics },
      { value: 'Physics', label: tr.filterPhysics },
      { value: 'Chemistry', label: tr.filterChemistry },
      { value: 'English', label: tr.filterEnglish },
      { value: 'Biology', label: tr.filterBiology },
    ],
    [tr.filterMathematics, tr.filterPhysics, tr.filterChemistry, tr.filterEnglish, tr.filterBiology]
  );
}

function DiscoveryFilterFields({
  value,
  onChange,
}: {
  value: DiscoveryFilters;
  onChange: (next: DiscoveryFilters) => void;
}) {
  const tr = useStrings();
  const subjectChips = useSubjectChips();
  const selectedTags = new Set(value.tags?.split(',').map((t) => t.trim()).filter(Boolean) ?? []);

  const toggleTag = (tag: string) => {
    const current = value.tags?.split(',').map((t) => t.trim()).filter(Boolean) ?? [];
    const next = current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag];
    onChange({ ...value, tags: next.length ? next.join(',') : undefined });
  };

  return (
    <div className="space-y-5">
      <FilterSection title={tr.filterSubject}>
        <div className="flex flex-wrap gap-2">
          {subjectChips.map((s) => (
            <button
              key={s.value}
              type="button"
              className={choicePillClass(value.subject === s.value)}
              onClick={() =>
                onChange({ ...value, subject: value.subject === s.value ? undefined : s.value })
              }
            >
              {s.label}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection icon={<GraduationCap className="size-4" />} title={tr.filterExamPrep}>
        <div className="flex flex-wrap gap-2">
          {EXAM_CHIPS.map((e) => (
            <button
              key={e}
              type="button"
              className={choicePillClass(value.exam_type === e)}
              onClick={() =>
                onChange({ ...value, exam_type: value.exam_type === e ? undefined : e })
              }
            >
              {e}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title={tr.filterExactGrade}>
        <div className="flex flex-wrap gap-2">
          {GRADE_NUMBERS.map((g) => {
            const gradeValue = `Grade ${g}`;
            const label = tr.marketingGradeN.replace('{{n}}', String(g));
            return (
              <button
                key={g}
                type="button"
                className={choicePillClass(value.grade_level === gradeValue)}
                onClick={() =>
                  onChange({
                    ...value,
                    grade_level: value.grade_level === gradeValue ? undefined : gradeValue,
                  })
                }
              >
                {label}
              </button>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection title={tr.teachingFormat}>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={choicePillClass(!value.teaching_format)}
            onClick={() => onChange({ ...value, teaching_format: undefined })}
          >
            {tr.allFormats}
          </button>
          {TEACHING_FORMATS.map((f) => (
            <button
              key={f.value}
              type="button"
              className={choicePillClass(value.teaching_format === f.value)}
              onClick={() => onChange({ ...value, teaching_format: f.value })}
            >
              {tr[f.labelKey]}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection icon={<Star className="size-4" />} title={tr.filterMinRating}>
        <div className="flex flex-wrap gap-2">
          {[
            { value: '', label: tr.anyRating },
            { value: '4', label: '4+' },
            { value: '4.5', label: '4.5+' },
            { value: '5', label: '5' },
          ].map((opt) => (
            <button
              key={opt.value || 'any'}
              type="button"
              className={choicePillClass(
                opt.value === '' ? value.min_rating == null : value.min_rating === Number(opt.value)
              )}
              onClick={() =>
                onChange({
                  ...value,
                  min_rating: opt.value ? Number(opt.value) : undefined,
                })
              }
            >
              {opt.label}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title={tr.teachingStyle}>
        <div className="flex flex-wrap gap-2">
          {TEACHING_STYLES.map((tag) => (
            <button
              key={tag.value}
              type="button"
              className={choicePillClass(selectedTags.has(tag.value))}
              onClick={() => toggleTag(tag.value)}
            >
              {tr[tag.labelKey]}
            </button>
          ))}
        </div>
      </FilterSection>
    </div>
  );
}

/** Desktop sidebar — same pattern as mentor search filters */
export function DiscoveryFilterSidebar({
  filters,
  onChange,
  onApply,
  onClear,
}: {
  filters: DiscoveryFilters;
  onChange: (next: DiscoveryFilters) => void;
  onApply: () => void;
  onClear: () => void;
}) {
  const tr = useStrings();

  const applyChange = (next: DiscoveryFilters) => {
    onChange(next);
    onApply();
  };

  return (
    <div className="hidden overflow-hidden rounded-2xl border border-[var(--color-m-card-border)] bg-[var(--color-m-surface-light)] shadow-[var(--shadow-m-card)] ring-1 ring-[var(--color-m-ring-subtle)] lg:block">
      <div className="border-b border-[var(--color-m-card-border)] bg-[var(--color-m-hover-overlay)] px-4 py-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-[var(--color-m-primary)]" aria-hidden />
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-m-text)]">{tr.filters}</h2>
            <p className="text-xs text-[var(--color-m-text-muted)]">{tr.searchFiltersHint}</p>
          </div>
        </div>
      </div>
      <div className="app-scroll-area max-h-[calc(100vh-12rem)] overflow-y-auto p-4">
        <DiscoveryFilterFields value={filters} onChange={applyChange} />
      </div>
      <div className="border-t border-[var(--color-m-card-border)] p-3">
        <Button type="button" variant="ghost" size="sm" className="w-full" onClick={onClear}>
          {tr.clearFilters}
        </Button>
      </div>
    </div>
  );
}

/** Mobile filter button + drawer */
export function DiscoveryFilterPanel({
  filters,
  onChange,
  onApply,
  onClear,
}: {
  filters: DiscoveryFilters;
  onChange: (next: DiscoveryFilters) => void;
  onApply: () => void;
  onClear: () => void;
}) {
  const tr = useStrings();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DiscoveryFilters>(filters);
  const activeCount = countDiscoveryFilters(filters);

  const openPanel = () => {
    setDraft(filters);
    setOpen(true);
  };

  const apply = () => {
    onChange(draft);
    onApply();
    setOpen(false);
  };

  const clear = () => {
    setDraft({});
    onClear();
    setOpen(false);
  };

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="relative shrink-0 gap-2 lg:hidden"
        onClick={openPanel}
        aria-label={tr.filtersAriaLabel}
      >
        <SlidersHorizontal className="size-4" aria-hidden />
        <span className="hidden sm:inline">{tr.filters}</span>
        {activeCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-[var(--color-m-primary)] text-[10px] font-bold text-[var(--color-m-text)]">
            {activeCount}
          </span>
        ) : null}
      </Button>

      <Drawer
        open={open}
        title={tr.filters}
        onClose={() => setOpen(false)}
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={clear}>
              {tr.clearFilters}
            </Button>
            <Button type="button" variant="primary" size="sm" onClick={apply}>
              {tr.applyFilters}
            </Button>
          </div>
        }
      >
        <DiscoveryFilterFields value={draft} onChange={setDraft} />
      </Drawer>
    </>
  );
}

export function ActiveDiscoveryFilterChips({
  filters,
  onRemove,
  onClearAll,
  className,
}: {
  filters: DiscoveryFilters;
  onRemove: (key: keyof DiscoveryFilters) => void;
  onClearAll: () => void;
  className?: string;
}) {
  const tr = useStrings();
  const chips: { key: keyof DiscoveryFilters; label: string }[] = [];

  if (filters.subject) chips.push({ key: 'subject', label: filters.subject });
  if (filters.exam_type) chips.push({ key: 'exam_type', label: filters.exam_type });
  if (filters.grade_level) chips.push({ key: 'grade_level', label: filters.grade_level });
  if (filters.teaching_format) chips.push({ key: 'teaching_format', label: filters.teaching_format });
  if (filters.min_rating) chips.push({ key: 'min_rating', label: `${filters.min_rating}+ ★` });
  if (filters.tags) {
    filters.tags.split(',').forEach((tag) => {
      if (tag.trim()) chips.push({ key: 'tags', label: tag.trim() });
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className={cn('rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-bg)]/60 p-3', className)}>
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
        {chips.map((chip, i) => (
          <span
            key={`${chip.key}-${chip.label}-${i}`}
            className={cn(choicePillClass(true), 'inline-flex items-center gap-1 py-1.5')}
          >
            {chip.label}
            <button
              type="button"
              aria-label={tr.clearSelection}
              className="inline-flex rounded-full p-0.5 hover:bg-[var(--color-m-hover-overlay)]"
              onClick={() => onRemove(chip.key)}
            >
              <X className="size-3.5" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
