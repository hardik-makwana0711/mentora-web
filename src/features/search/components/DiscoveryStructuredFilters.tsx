import { useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GraduationCap, Loader2, SlidersHorizontal, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DropdownSelect } from '@/components/ui/DropdownSelect';
import { UniversityAutocomplete } from '@/features/education/components/UniversityAutocomplete';
import { useStrings } from '@/constants/strings';
import { qk } from '@/constants/query-keys';
import { EDUCATION_LEVELS, EXAM_TRACKS, GRADES_BY_EDUCATION_LEVEL, gradeDisplayName } from '@/constants/education-levels';
import { educationService } from '@/services/education.service';
import { choicePillClass } from '@/lib/button-styles';
import type { EducationLevel, ExamTrack, UniversitySummary } from '@/types/education';
import type { SearchFilters, StructuredFilterLabels } from '@/types/search';
import { cn } from '@/lib/utils';

type ChipFilterKey = 'subject' | 'grade_level' | 'lesson_format';

function FilterSection({
  icon,
  title,
  children,
  className,
}: {
  icon?: ReactNode;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2">
        {icon ? <span className="text-[var(--color-m-primary)]">{icon}</span> : null}
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-m-text-secondary)]">{title}</h3>
      </div>
      {children}
    </section>
  );
}

export function DiscoveryStructuredFilters({
  filters,
  labels,
  onChange,
  onLabelsChange,
}: {
  filters: SearchFilters;
  labels: StructuredFilterLabels;
  onChange: (next: SearchFilters) => void;
  onLabelsChange: (next: StructuredFilterLabels) => void;
}) {
  const tr = useStrings();
  const legacyChips: { key: ChipFilterKey; value: string; label: string }[] = [
    { key: 'subject', value: 'mathematics', label: tr.filterMathematics },
    { key: 'subject', value: 'physics', label: tr.filterPhysics },
    { key: 'grade_level', value: 'high_school', label: tr.filterHighSchool },
    { key: 'lesson_format', value: 'one_to_one', label: tr.filterOneToOne },
    { key: 'lesson_format', value: 'group', label: tr.filterGroup },
  ];
  const [educationLevel, setEducationLevel] = useState<EducationLevel | ''>('');
  const [localGrade, setLocalGrade] = useState('');
  const [localSubjectId, setLocalSubjectId] = useState('');
  const [examTrack, setExamTrack] = useState<ExamTrack | ''>('');
  const [localExamSubjectId, setLocalExamSubjectId] = useState('');
  const [filterUniversity, setFilterUniversity] = useState<UniversitySummary | null>(
    filters.university_id && labels.university_name
      ? {
          id: filters.university_id,
          name: labels.university_name,
          city: null,
          institution_type: '',
        }
      : null
  );

  const grade = localGrade ? Number(localGrade) : null;
  const gradeOptions =
    educationLevel && educationLevel in GRADES_BY_EDUCATION_LEVEL
      ? GRADES_BY_EDUCATION_LEVEL[educationLevel].map((g) => ({
          value: String(g),
          label: gradeDisplayName(g),
        }))
      : [];

  const subjectsQuery = useQuery({
    queryKey: grade != null ? qk.educationSubjects(grade) : ['education', 'subjects', 'none'],
    queryFn: () => educationService.getSubjectsByGrade(grade as number),
    enabled: grade != null && grade >= 1 && grade <= 12,
    staleTime: 60_000,
  });

  const subjectOptions =
    subjectsQuery.data?.items.map((s) => ({ value: s.id, label: s.display_name })) ?? [];

  const examQuery = useQuery({
    queryKey: examTrack ? qk.educationExamSubjects(examTrack) : ['education', 'exam-subjects', 'none'],
    queryFn: () => educationService.getExamSubjects(examTrack as ExamTrack),
    enabled: Boolean(examTrack),
    staleTime: 60_000,
  });

  const examOptions = examQuery.data?.items.map((s) => ({ value: s.id, label: s.display_name })) ?? [];

  function applyUniversity(u: UniversitySummary | null) {
    setFilterUniversity(u);
    onChange({ ...filters, university_id: u?.id });
    onLabelsChange({ ...labels, university_name: u?.name });
  }

  function applyGradeSubject() {
    if (!grade || !localSubjectId || !subjectsQuery.data) return;
    const subject = subjectsQuery.data.items.find((s) => s.id === localSubjectId);
    if (!subject) return;
    onChange({
      ...filters,
      grade,
      subject_id: subject.id,
    });
    onLabelsChange({
      ...labels,
      grade_display: subjectsQuery.data.grade.display_name,
      subject_name: subject.display_name,
    });
  }

  function applyExamSubject() {
    if (!localExamSubjectId || !examQuery.data) return;
    const item = examQuery.data.items.find((s) => s.id === localExamSubjectId);
    if (!item) return;
    onChange({ ...filters, exam_track_subject_id: item.id });
    onLabelsChange({ ...labels, exam_subject_name: item.display_name });
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-m-card-border)] bg-[var(--color-m-surface-light)] shadow-[var(--shadow-m-card)] ring-1 ring-[var(--color-m-ring-subtle)]">
      <div className="border-b border-[var(--color-m-card-border)] bg-[var(--color-m-hover-overlay)] px-4 py-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-[var(--color-m-primary)]" aria-hidden />
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-m-text)]">{tr.searchFilters}</h2>
            <p className="text-xs text-[var(--color-m-text-muted)]">{tr.searchFiltersHint}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <FilterSection title={tr.filterUniversity}>
          <UniversityAutocomplete
            label=""
            variant="compact"
            value={filterUniversity}
            onChange={applyUniversity}
            className="mb-0"
          />
        </FilterSection>

        <div className="border-t border-[var(--color-m-card-border)] pt-4">
          <FilterSection icon={<GraduationCap className="size-3.5" aria-hidden />} title={`${tr.filterSubject} / ${tr.filterExactGrade}`}>
            <div className="grid gap-2 sm:grid-cols-2">
              <DropdownSelect
                label={tr.filterEducationLevel}
                labelVariant="compact"
                value={educationLevel}
                placeholder={tr.selectEducationLevel}
                onChange={(v) => {
                  setEducationLevel(v as EducationLevel);
                  setLocalGrade('');
                  setLocalSubjectId('');
                }}
                options={EDUCATION_LEVELS.map((l) => ({ value: l.value, label: tr[l.labelKey] }))}
                className="mb-0"
              />
              <DropdownSelect
                label={tr.filterExactGrade}
                labelVariant="compact"
                value={localGrade}
                placeholder={educationLevel ? tr.selectGrade : tr.selectEducationLevelFirst}
                disabled={!educationLevel}
                emptyMessage={tr.selectEducationLevelFirst}
                onChange={(v) => {
                  setLocalGrade(v);
                  setLocalSubjectId('');
                }}
                options={gradeOptions}
                className="mb-0"
              />
            </div>

            {grade != null ? (
              subjectsQuery.isLoading ? (
                <div className="flex items-center gap-2 rounded-xl border border-dashed border-[var(--color-m-card-border)] px-3 py-2.5 text-sm text-[var(--color-m-text-muted)]">
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  {tr.loading}
                </div>
              ) : subjectsQuery.isError ? (
                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--color-m-error)]/30 bg-[var(--color-m-error)]/5 px-3 py-2.5 text-sm text-[var(--color-m-error)]">
                  {tr.subjectsLoadError}
                  <Button type="button" variant="secondary" size="sm" onClick={() => void subjectsQuery.refetch()}>
                    {tr.retry}
                  </Button>
                </div>
              ) : (
                <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
                  <DropdownSelect
                    label={tr.filterSubject}
                    labelVariant="compact"
                    value={localSubjectId}
                    placeholder={tr.selectSubject}
                    onChange={setLocalSubjectId}
                    options={subjectOptions}
                    className="mb-0"
                  />
                  <Button type="button" size="sm" disabled={!localSubjectId} onClick={applyGradeSubject}>
                    {tr.addProficiency}
                  </Button>
                </div>
              )
            ) : null}
          </FilterSection>
        </div>

        <div className="border-t border-[var(--color-m-card-border)] pt-4">
          <FilterSection title={tr.filterExamPrep}>
            <div className="grid gap-2 sm:grid-cols-2">
              <DropdownSelect
                label={tr.selectExamTrack}
                labelVariant="compact"
                value={examTrack}
                placeholder={tr.selectExamTrack}
                onChange={(v) => {
                  setExamTrack(v as ExamTrack);
                  setLocalExamSubjectId('');
                }}
                options={EXAM_TRACKS.map((t) => ({ value: t, label: t }))}
                className="mb-0"
              />
              {examTrack ? (
                examQuery.isLoading ? (
                  <div className="flex items-center gap-2 self-end pb-1 text-sm text-[var(--color-m-text-muted)]">
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    {tr.loading}
                  </div>
                ) : examQuery.isError ? (
                  <div className="flex flex-wrap items-center gap-2 self-end pb-1 text-sm text-[var(--color-m-error)]">
                    {tr.examSubjectsLoadError}
                    <Button type="button" variant="secondary" size="sm" onClick={() => void examQuery.refetch()}>
                      {tr.retry}
                    </Button>
                  </div>
                ) : (
                  <DropdownSelect
                    label={tr.selectExamSubject}
                    labelVariant="compact"
                    value={localExamSubjectId}
                    placeholder={tr.selectExamSubject}
                    onChange={setLocalExamSubjectId}
                    options={examOptions}
                    className="mb-0"
                  />
                )
              ) : (
                <div className="hidden sm:block" aria-hidden />
              )}
            </div>
            {examTrack && !examQuery.isLoading && !examQuery.isError ? (
              <div className="flex justify-end">
                <Button type="button" size="sm" disabled={!localExamSubjectId} onClick={applyExamSubject}>
                  {tr.addExamSubject}
                </Button>
              </div>
            ) : null}
          </FilterSection>
        </div>

        <div className="border-t border-[var(--color-m-card-border)] pt-4">
          <FilterSection icon={<Star className="size-3.5" aria-hidden />} title={tr.filterMinRating}>
            <div className="flex flex-wrap gap-1.5">
              {[null, 3, 4, 5].map((r) => {
                const active = (filters.rating ?? null) === r;
                return (
                  <button
                    key={r ?? 'any'}
                    type="button"
                    onClick={() => onChange({ ...filters, rating: r ?? undefined })}
                    className={choicePillClass(active)}
                  >
                    {r == null ? tr.filterRatingAny : `${r}★+`}
                  </button>
                );
              })}
            </div>
          </FilterSection>
        </div>

        <div className="border-t border-[var(--color-m-card-border)] pt-4">
          <FilterSection title={tr.filterQuickTags}>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label={tr.filtersAriaLabel}>
              {legacyChips.map((chip) => {
                const active = filters[chip.key] === chip.value;
                return (
                  <button
                    key={`${chip.key}-${chip.value}`}
                    type="button"
                    onClick={() =>
                      onChange({
                        ...filters,
                        [chip.key]: active ? undefined : chip.value,
                      })
                    }
                    className={choicePillClass(active)}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>
          </FilterSection>
        </div>
      </div>
    </div>
  );
}
