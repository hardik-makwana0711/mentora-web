import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { useStrings } from '@/constants/strings';
import { PdfActions } from '@/features/materials/components/PdfActions';
import { SubmissionStatusBadge } from '@/features/materials/components/SubmissionStatusBadge';
import type { MaterialSubmission, SubmissionStatus } from '@/services/materials.service';

type FilterValue = 'all' | 'submitted' | 'not_submitted' | 'late';

export function SubmissionStatusTable({
  submissions,
}: {
  submissions: MaterialSubmission[];
  teacherFileUrl?: string | null;
  teacherFileName?: string | null;
}) {
  const tr = useStrings();
  const [filter, setFilter] = useState<FilterValue>('all');

  const counts = useMemo(() => {
    const submitted = submissions.filter(
      (s) => s.status === 'submitted' || s.status === 'resubmitted'
    ).length;
    const notSubmitted = submissions.filter(
      (s) => !s.status || s.status === 'not_submitted'
    ).length;
    const late = submissions.filter((s) => s.status === 'late').length;
    return {
      all: submissions.length,
      submitted,
      not_submitted: notSubmitted,
      late,
    };
  }, [submissions]);

  const filtered = useMemo(() => {
    if (filter === 'all') return submissions;
    if (filter === 'submitted') {
      return submissions.filter((s) => s.status === 'submitted' || s.status === 'resubmitted');
    }
    if (filter === 'not_submitted') {
      return submissions.filter((s) => !s.status || s.status === 'not_submitted');
    }
    return submissions.filter((s) => s.status === 'late');
  }, [filter, submissions]);

  const columns: Column<MaterialSubmission>[] = [
    {
      key: 'student',
      header: tr.materialColStudent,
      render: (row) => <span className="font-medium text-[var(--color-m-text)]">{row.studentName}</span>,
    },
    {
      key: 'parent',
      header: tr.materialColParent,
      render: (row) => row.parentName ?? '—',
    },
    {
      key: 'status',
      header: tr.materialColStatus,
      render: (row) => (
        <SubmissionStatusBadge status={(row.status ?? 'not_submitted') as SubmissionStatus} />
      ),
    },
    {
      key: 'submittedAt',
      header: tr.materialColSubmittedAt,
      render: (row) =>
        row.submittedAt
          ? format(new Date(row.submittedAt), 'd MMM yyyy HH:mm')
          : tr.materialNoSubmissionYet,
    },
    {
      key: 'file',
      header: tr.materialColFile,
      render: (row) =>
        row.submittedFileUrl ? (
          <PdfActions
            fileUrl={row.submittedFileUrl}
            fileName={row.submittedFileName}
            variant="submitted"
            compact
          />
        ) : (
          <span className="text-[var(--color-m-text-muted)]">{tr.materialNoFile}</span>
        ),
    },
    {
      key: 'actions',
      header: tr.materialColActions,
      render: (row) =>
        row.submittedFileUrl ? (
          <PdfActions
            fileUrl={row.submittedFileUrl}
            fileName={row.submittedFileName}
            variant="submitted"
            compact
          />
        ) : (
          '—'
        ),
    },
  ];

  const filterTabs: { value: FilterValue; label: string }[] = [
    {
      value: 'all',
      label: tr.materialFilterAllCount.replace('{{count}}', String(counts.all)),
    },
    {
      value: 'submitted',
      label: tr.materialFilterSubmittedCount.replace('{{count}}', String(counts.submitted)),
    },
    {
      value: 'not_submitted',
      label: tr.materialFilterNotSubmittedCount.replace('{{count}}', String(counts.not_submitted)),
    },
    {
      value: 'late',
      label: tr.materialFilterLateCount.replace('{{count}}', String(counts.late)),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-[var(--color-m-text)]">{tr.materialSubmissionTable}</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setFilter(tab.value)}
            className={
              filter === tab.value
                ? 'rounded-lg border border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/15 px-3 py-1.5 text-xs font-medium text-[var(--color-m-text)]'
                : 'rounded-lg border border-[var(--color-m-card-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-m-text-muted)] hover:text-[var(--color-m-text)]'
            }
          >
            {tab.label}
          </button>
        ))}
      </div>
      <DataTable
        columns={columns}
        rows={filtered}
        empty={
          <p className="py-8 text-center text-sm text-[var(--color-m-text-muted)]">
            {tr.materialNoSubmissions}
          </p>
        }
      />
    </div>
  );
}
