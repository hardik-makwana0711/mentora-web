import { useMemo } from 'react';
import { Search } from 'lucide-react';
import { DropdownSelect } from '@/components/ui/DropdownSelect';
import { useStrings } from '@/constants/strings';
import type { ContactRequest } from '@/types/contact-requests';

export type ContactRequestSort = 'newest' | 'oldest';

export function ContactRequestControls({
  items,
  search,
  onSearchChange,
  subject,
  onSubjectChange,
  grade,
  onGradeChange,
  sort,
  onSortChange,
}: {
  items: ContactRequest[];
  search: string;
  onSearchChange: (v: string) => void;
  subject: string;
  onSubjectChange: (v: string) => void;
  grade: string;
  onGradeChange: (v: string) => void;
  sort: ContactRequestSort;
  onSortChange: (v: ContactRequestSort) => void;
}) {
  const tr = useStrings();

  const subjectOptions = useMemo(() => {
    const values = new Set(items.map((r) => r.subject).filter((v): v is string => Boolean(v)));
    return [
      { value: '', label: tr.contactRequestsFilterSubjectAll },
      ...Array.from(values).map((v) => ({ value: v, label: v })),
    ];
  }, [items, tr]);

  const gradeOptions = useMemo(() => {
    const values = new Set(items.map((r) => r.gradeLevel).filter((v): v is string => Boolean(v)));
    return [
      { value: '', label: tr.contactRequestsFilterGradeAll },
      ...Array.from(values).map((v) => ({ value: v, label: v })),
    ];
  }, [items, tr]);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="relative flex items-center">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-m-text-muted)]"
          aria-hidden
        />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={tr.contactRequestsSearchPlaceholder}
          aria-label={tr.contactRequestsSearchPlaceholder}
          className="min-h-[44px] w-full rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-bg)] py-0 pl-9 pr-3 text-[15px] text-[var(--color-m-text)] outline-none transition-colors placeholder:text-[var(--color-m-text-muted)] focus:border-[var(--color-m-primary)] focus:bg-[var(--color-m-surface-elevated)]"
        />
      </div>

      <DropdownSelect
        value={subject}
        onChange={onSubjectChange}
        options={subjectOptions}
        placeholder={tr.subjectField}
        labelVariant="compact"
        className="mb-0"
      />

      <DropdownSelect
        value={grade}
        onChange={onGradeChange}
        options={gradeOptions}
        placeholder={tr.gradeLevel}
        labelVariant="compact"
        className="mb-0"
      />

      <DropdownSelect
        value={sort}
        onChange={(v) => onSortChange(v as ContactRequestSort)}
        options={[
          { value: 'newest', label: tr.contactRequestsSortNewest },
          { value: 'oldest', label: tr.contactRequestsSortOldest },
        ]}
        placeholder={tr.contactRequestsSortLabel}
        labelVariant="compact"
        className="mb-0"
      />
    </div>
  );
}
