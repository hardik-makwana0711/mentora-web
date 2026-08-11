import { useMemo, useState } from 'react';
import { useStrings } from '@/constants/strings';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { MentorStudentOption } from '@/features/materials/hooks/useMentorStudents';

export function AssignedStudentsPicker({
  students,
  selectedIds,
  onChange,
  error,
  isLoading,
}: {
  students: MentorStudentOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  error?: string | null;
  isLoading?: boolean;
}) {
  const tr = useStrings();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.parentName ?? '').toLowerCase().includes(q) ||
        (s.grade ?? '').toLowerCase().includes(q)
    );
  }, [students, search]);

  const toggle = (studentId: string) => {
    onChange(
      selectedIds.includes(studentId)
        ? selectedIds.filter((id) => id !== studentId)
        : [...selectedIds, studentId]
    );
  };

  const selectAll = () => onChange(filtered.map((s) => s.id));
  const clearSelection = () => onChange([]);

  return (
    <div>
      <label className="mb-2 block text-[13px] font-semibold uppercase tracking-[0.3px] text-[var(--color-m-text-secondary)]">
        {tr.materialAssignStudents}
      </label>

      {isLoading ? (
        <p className="text-sm text-[var(--color-m-text-muted)]">{tr.loading}</p>
      ) : students.length === 0 ? (
        <div className="rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-surface-light)] p-4 text-sm text-[var(--color-m-text-muted)]">
          {tr.materialNoStudentsAvailable}
        </div>
      ) : (
        <div className="space-y-3">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tr.materialSearchStudents}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={selectAll}>
              {tr.materialSelectAll}
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={clearSelection}>
              {tr.materialClearSelection}
            </Button>
            <span className="text-xs text-[var(--color-m-text-muted)]">
              {tr.materialSelectedStudents.replace('{{count}}', String(selectedIds.length))}
            </span>
          </div>
          <div className="max-h-80 space-y-2 overflow-y-auto overscroll-contain pr-1">
            {filtered.map((student) => {
              const selected = selectedIds.includes(student.id);
              return (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => toggle(student.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors',
                    selected
                      ? 'border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/10'
                      : 'border-[var(--color-m-card-border)] bg-[var(--color-m-surface-light)] hover:border-[var(--color-brand-primary)]/40'
                  )}
                >
                  <span
                    className={cn(
                      'flex size-5 shrink-0 items-center justify-center rounded border text-xs',
                      selected
                        ? 'border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)] text-[var(--color-m-text)]'
                        : 'border-[var(--color-m-card-border)]'
                    )}
                  >
                    {selected ? '✓' : ''}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-[var(--color-m-text)]">
                      {student.name}
                    </span>
                    {student.grade ? (
                      <span className="block text-xs text-[var(--color-m-text-muted)]">
                        {student.grade}
                      </span>
                    ) : null}
                    {student.parentName ? (
                      <span className="block text-xs text-[var(--color-m-text-muted)]">
                        {student.parentName}
                      </span>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      {error ? <p className="mt-2 text-sm text-[var(--color-m-error)]">{error}</p> : null}
    </div>
  );
}
