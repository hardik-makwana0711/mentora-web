import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Plus, Pencil, Eye, BookOpen, ClipboardList, FileText, Inbox } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { useStrings } from '@/constants/strings';
import { qk } from '@/constants/query-keys';
import {
  materialsService,
  type MaterialStatus,
  type MaterialType,
  type TeacherMaterial,
} from '@/services/materials.service';
import { MaterialTabs } from '@/features/materials/components/MaterialTabs';
import { MaterialTypeBadge } from '@/features/materials/components/MaterialTypeBadge';
import { useRoleBase } from '@/features/profile/hooks/useRoleBase';
import { cn } from '@/lib/utils';

type TabValue = 'all' | MaterialType;

export default function MentorMaterialsPage() {
  const tr = useStrings();
  const navigate = useNavigate();
  const roleBase = useRoleBase();
  const [tab, setTab] = useState<TabValue>('all');
  const [statusFilter, setStatusFilter] = useState<MaterialStatus>('active');
  const [search, setSearch] = useState('');

  const materialsQ = useQuery({
    queryKey: qk.mentorMaterials(`${statusFilter}-${tab}`),
    queryFn: () =>
      materialsService.getMentorMaterials({
        status: statusFilter,
        ...(tab === 'all' ? {} : { type: tab }),
      }),
  });

  const allForStatusQ = useQuery({
    queryKey: qk.mentorMaterials(`counts-${statusFilter}`),
    queryFn: () => materialsService.getMentorMaterials({ status: statusFilter }),
  });

  const materials = useMemo(() => materialsQ.data ?? [], [materialsQ.data]);
  const allForCounts = useMemo(
    () => allForStatusQ.data ?? materials,
    [allForStatusQ.data, materials]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return materials;
    return materials.filter((m) => m.title.toLowerCase().includes(q));
  }, [materials, search]);

  const counts = useMemo(() => {
    const assignment = allForCounts.filter((m) => m.type === 'assignment').length;
    const resource = allForCounts.filter((m) => m.type === 'course_resource').length;
    return {
      all: allForCounts.length,
      assignment,
      course_resource: resource,
    };
  }, [allForCounts]);

  const stats = useMemo(() => {
    const active = statusFilter === 'active' ? allForCounts.length : allForCounts.filter((m) => (m.status ?? 'active') === 'active').length;
    const assignments = allForCounts.filter((m) => m.type === 'assignment').length;
    const resources = allForCounts.filter((m) => m.type === 'course_resource').length;
    let pending = 0;
    for (const m of allForCounts) {
      if (m.type !== 'assignment') continue;
      const assigned = m.assignedStudentCount ?? 0;
      const submitted = m.submissionCount ?? 0;
      if (assigned > submitted) pending += assigned - submitted;
    }
    return { active, assignments, resources, pending };
    // TODO: Late submissions count is not exposed on the materials list API — hide until available.
  }, [allForCounts, statusFilter]);

  const columns: Column<TeacherMaterial>[] = [
    {
      key: 'title',
      header: tr.materialColTitle,
      render: (row) => <span className="font-medium text-[var(--color-m-text)]">{row.title}</span>,
    },
    {
      key: 'type',
      header: tr.materialColType,
      render: (row) => <MaterialTypeBadge type={row.type} />,
    },
    {
      key: 'students',
      header: tr.materialColAssigned,
      render: (row) => row.assignedStudentCount ?? 0,
    },
    {
      key: 'dueDate',
      header: tr.materialColDueDate,
      render: (row) =>
        row.type === 'assignment' && row.dueDate
          ? format(new Date(row.dueDate), 'd MMM yyyy')
          : '—',
    },
    {
      key: 'submissions',
      header: tr.materialColSubmissions,
      render: (row) => {
        if (row.type !== 'assignment') return tr.materialNoSubmissionRequired;
        const total = row.assignedStudentCount ?? 0;
        const submitted = row.submissionCount ?? 0;
        return tr.materialSubmittedCount
          .replace('{{submitted}}', String(submitted))
          .replace('{{total}}', String(total));
      },
    },
    {
      key: 'createdAt',
      header: tr.materialColCreated,
      render: (row) => (row.createdAt ? format(new Date(row.createdAt), 'd MMM yyyy') : '—'),
    },
    {
      key: 'status',
      header: tr.materialColStatus,
      render: (row) => {
        const status = row.status ?? 'active';
        return (
          <Badge variant={status === 'active' ? 'success' : 'default'}>
            {status === 'active' ? tr.materialStatusActive : tr.materialStatusArchived}
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      header: tr.materialColActions,
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => navigate(`${roleBase}/materials/${row.id}`)}
          >
            <Eye className="mr-1.5 size-4" />
            {tr.materialViewDetails}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => navigate(`${roleBase}/materials/${row.id}/edit`)}
          >
            <Pencil className="mr-1.5 size-4" />
            {tr.materialEdit}
          </Button>
        </div>
      ),
    },
  ];

  const statCards = [
    { key: 'active', label: tr.materialStatActive, value: stats.active, icon: FileText },
    { key: 'assignments', label: tr.materialStatAssignments, value: stats.assignments, icon: ClipboardList },
    { key: 'resources', label: tr.materialStatResources, value: stats.resources, icon: BookOpen },
    { key: 'pending', label: tr.materialStatPending, value: stats.pending, icon: Inbox },
  ];

  return (
    <div>
      <PageHeader
        title={tr.materialsMentorTitle}
        description={tr.materialsMentorDescription}
        actions={
          <Button type="button" onClick={() => navigate(`${roleBase}/materials/new`)}>
            <Plus className="mr-2 size-4" />
            {tr.materialCreate}
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.key}
              className="flex items-center gap-3 rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] px-4 py-3 ring-1 ring-[var(--color-m-ring-subtle)]"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-m-primary)]/12 text-[var(--color-m-primary-light)]">
                <Icon className="size-5" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-[var(--color-m-text-muted)]">{card.label}</p>
                <p className="mt-0.5 text-xl font-semibold tabular-nums text-[var(--color-m-text)]">
                  {card.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] p-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="min-w-0 flex-1 sm:min-w-[200px]">
          <Input
            label={tr.materialSearchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tr.materialSearchPlaceholder}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-[var(--color-m-text-muted)]">
            {tr.materialFilterStatusLabel}
          </label>
          <div className="flex gap-2">
            {(['active', 'archived'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={cn(
                  'rounded-lg border px-3 py-2 text-sm font-medium transition',
                  statusFilter === status
                    ? 'border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/15 text-[var(--color-m-text)]'
                    : 'border-[var(--color-m-card-border)] text-[var(--color-m-text-muted)]'
                )}
              >
                {status === 'active' ? tr.materialStatusActive : tr.materialStatusArchived}
              </button>
            ))}
          </div>
        </div>
      </div>

      <MaterialTabs
        value={tab}
        onChange={setTab}
        labels={{
          all: tr.materialTabAllCount.replace('{{count}}', String(counts.all)),
          assignment: tr.materialTabAssignmentsCount.replace('{{count}}', String(counts.assignment)),
          course_resource: tr.materialTabResourcesCount.replace(
            '{{count}}',
            String(counts.course_resource)
          ),
        }}
      />

      {materialsQ.isPending ? (
        <div className="flex min-h-[20vh] items-center justify-center">
          <Spinner className="size-8 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />
        </div>
      ) : materialsQ.isError ? (
        <ErrorState title={tr.materialsLoadError} onRetry={() => void materialsQ.refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={tr.materialsEmptyTitle}
          description={tr.materialsEmptyMentorDescription}
          action={
            <Button type="button" onClick={() => navigate(`${roleBase}/materials/new`)}>
              <Plus className="mr-2 size-4" />
              {tr.materialCreate}
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          empty={<EmptyState title={tr.materialsEmptyTitle} />}
        />
      )}
    </div>
  );
}
