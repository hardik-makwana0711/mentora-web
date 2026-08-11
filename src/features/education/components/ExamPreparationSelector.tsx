import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DropdownSelect } from '@/components/ui/DropdownSelect';
import { useStrings } from '@/constants/strings';
import { qk } from '@/constants/query-keys';
import { EXAM_TRACKS } from '@/constants/education-levels';
import { educationService } from '@/services/education.service';
import type { ExamProficiency, ExamTrack } from '@/types/education';

type ExamPreparationSelectorProps = {
  value: ExamProficiency[];
  onChange: (next: ExamProficiency[]) => void;
  disabled?: boolean;
  error?: string;
};

export function ExamPreparationSelector({ value, onChange, disabled, error }: ExamPreparationSelectorProps) {
  const tr = useStrings();
  const [examTrack, setExamTrack] = useState<ExamTrack | ''>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  const examQuery = useQuery({
    queryKey: examTrack ? qk.educationExamSubjects(examTrack) : ['education', 'exam-subjects', 'none'],
    queryFn: () => educationService.getExamSubjects(examTrack as ExamTrack),
    enabled: Boolean(examTrack),
    staleTime: 60_000,
  });

  const availableOptions =
    examQuery.data?.items
      .filter((item) => !value.some((v) => v.id === item.id))
      .map((item) => ({ value: item.id, label: item.display_name })) ?? [];

  function handleAdd() {
    if (!selectedSubjectId || !examTrack || !examQuery.data) return;
    const item = examQuery.data.items.find((s) => s.id === selectedSubjectId);
    if (!item) return;
    onChange([
      ...value,
      { id: item.id, exam_track: examTrack, display_name: item.display_name },
    ]);
    setSelectedSubjectId('');
  }

  function removeExam(id: string) {
    onChange(value.filter((v) => v.id !== id));
  }

  return (
    <div className="mb-4 w-full">
      <p className="mb-2 text-[13px] font-semibold uppercase tracking-[0.3px] text-[var(--color-m-text-secondary)]">
        {tr.examPreparation}
      </p>

      <div className="space-y-1 rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-surface-light)] p-4">
        <DropdownSelect
          label={tr.selectExamTrack}
          value={examTrack}
          onChange={(v) => {
            setExamTrack(v as ExamTrack);
            setSelectedSubjectId('');
          }}
          options={EXAM_TRACKS.map((t) => ({ value: t, label: t }))}
        />

        {examTrack ? (
          examQuery.isLoading ? (
            <div className="mb-4 flex items-center gap-2 text-sm text-[var(--color-m-text-muted)]">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              {tr.loading}
            </div>
          ) : examQuery.isError ? (
            <div className="mb-4 flex items-center gap-2 text-sm text-[var(--color-m-error)]">
              {tr.examSubjectsLoadError}
              <Button type="button" variant="secondary" size="sm" onClick={() => void examQuery.refetch()}>
                {tr.retry}
              </Button>
            </div>
          ) : (
            <>
              <DropdownSelect
                label={tr.selectExamSubject}
                value={selectedSubjectId}
                onChange={setSelectedSubjectId}
                options={availableOptions}
              />
              <Button
                type="button"
                size="sm"
                disabled={disabled || !selectedSubjectId}
                onClick={handleAdd}
              >
                {tr.addExamSubject}
              </Button>
            </>
          )
        ) : null}
      </div>

      {value.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--color-m-text-muted)]">{tr.noExamSubjectsAdded}</p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {value.map((item) => (
            <span
              key={item.id}
              className="inline-flex items-center gap-1 rounded-full border border-[var(--color-m-primary)]/40 bg-[var(--color-m-primary)]/15 px-3 py-1.5 text-sm text-[var(--color-m-text)]"
            >
              {item.display_name}
              <button
                type="button"
                aria-label={tr.clearSelection}
                disabled={disabled}
                className="rounded-full p-0.5 hover:bg-[var(--color-m-hover-overlay)]"
                onClick={() => removeExam(item.id)}
              >
                <X className="size-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
      {error ? <p className="mt-2 pl-1 text-[11px] text-[var(--color-m-error)]">{error}</p> : null}
    </div>
  );
}
