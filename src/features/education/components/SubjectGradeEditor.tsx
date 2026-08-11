import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DropdownSelect } from '@/components/ui/DropdownSelect';
import { useStrings } from '@/constants/strings';
import { qk } from '@/constants/query-keys';
import { EDUCATION_LEVELS, GRADES_BY_EDUCATION_LEVEL, gradeDisplayName } from '@/constants/education-levels';
import { educationService } from '@/services/education.service';
import {
  addSubjectGrade,
  removeSubject,
  removeSubjectGrade,
  type SubjectProficiencyDraft,
} from '@/features/education/lib/education-utils';
import type { EducationLevel } from '@/types/education';

type SubjectGradeEditorProps = {
  value: SubjectProficiencyDraft[];
  onChange: (next: SubjectProficiencyDraft[]) => void;
  disabled?: boolean;
  error?: string;
};

export function SubjectGradeEditor({ value, onChange, disabled, error }: SubjectGradeEditorProps) {
  const tr = useStrings();
  const [educationLevel, setEducationLevel] = useState<EducationLevel | ''>('');
  const [gradeNumber, setGradeNumber] = useState('');
  const [subjectId, setSubjectId] = useState('');

  const grade = gradeNumber ? Number(gradeNumber) : null;
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

  function handleAdd() {
    if (!grade || !subjectId || !subjectsQuery.data) return;
    const subject = subjectsQuery.data.items.find((s) => s.id === subjectId);
    if (!subject) return;
    const gradeInfo = subjectsQuery.data.grade;
    onChange(
      addSubjectGrade(value, subject.id, subject.display_name, {
        grade_level_id: gradeInfo.grade_level_id,
        grade_number: gradeInfo.grade_number,
        display_name: gradeInfo.display_name,
      })
    );
    setSubjectId('');
  }

  return (
    <div className="mb-4 w-full">
      <p className="mb-2 text-[13px] font-semibold uppercase tracking-[0.3px] text-[var(--color-m-text-secondary)]">
        {tr.subjectsAndGrades}
      </p>

      <div className="space-y-1 rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-surface-light)] p-4">
        <DropdownSelect
          label={tr.selectEducationLevel}
          value={educationLevel}
          onChange={(v) => {
            setEducationLevel(v as EducationLevel);
            setGradeNumber('');
            setSubjectId('');
          }}
          options={EDUCATION_LEVELS.map((l) => ({ value: l.value, label: tr[l.labelKey] }))}
        />
        <DropdownSelect
          label={tr.selectGrade}
          value={gradeNumber}
          onChange={(v) => {
            setGradeNumber(v);
            setSubjectId('');
          }}
          options={gradeOptions}
        />

        {grade != null ? (
          subjectsQuery.isLoading ? (
            <div className="mb-4 flex items-center gap-2 text-sm text-[var(--color-m-text-muted)]">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              {tr.loading}
            </div>
          ) : subjectsQuery.isError ? (
            <div className="mb-4 flex items-center gap-2 text-sm text-[var(--color-m-error)]">
              {tr.subjectsLoadError}
              <Button type="button" variant="secondary" size="sm" onClick={() => void subjectsQuery.refetch()}>
                {tr.retry}
              </Button>
            </div>
          ) : (
            <>
              <DropdownSelect
                label={tr.selectSubject}
                value={subjectId}
                onChange={setSubjectId}
                options={subjectOptions}
              />
              <Button
                type="button"
                size="sm"
                disabled={disabled || !subjectId}
                onClick={handleAdd}
              >
                {tr.addProficiency}
              </Button>
            </>
          )
        ) : null}
      </div>

      {value.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--color-m-text-muted)]">{tr.noSubjectsAdded}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {value.map((prof) => (
            <li
              key={prof.subject_id}
              className="rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-surface-light)] p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-[var(--color-m-text)]">{prof.display_name}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {prof.grades.map((g) => (
                      <span
                        key={g.grade_level_id}
                        className="inline-flex items-center gap-1 rounded-full border border-[var(--color-m-card-border)] bg-[var(--color-m-surface-elevated)] px-3 py-1 text-xs text-[var(--color-m-text)]"
                      >
                        {g.display_name}
                        <button
                          type="button"
                          aria-label={tr.removeGrade}
                          disabled={disabled}
                          className="rounded-full p-0.5 hover:bg-[var(--color-m-hover-overlay)]"
                          onClick={() => onChange(removeSubjectGrade(value, prof.subject_id, g.grade_level_id))}
                        >
                          <X className="size-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  aria-label={tr.removeSubject}
                  disabled={disabled}
                  className="shrink-0 rounded-lg p-1 text-[var(--color-m-text-muted)] hover:bg-[var(--color-m-hover-overlay)] hover:text-[var(--color-m-text)]"
                  onClick={() => onChange(removeSubject(value, prof.subject_id))}
                >
                  <X className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {error ? <p className="mt-2 pl-1 text-[11px] text-[var(--color-m-error)]">{error}</p> : null}
    </div>
  );
}
