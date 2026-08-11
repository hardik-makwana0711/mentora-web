import { Link, useSearchParams } from 'react-router-dom';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { DataTable } from '@/components/ui/DataTable';
import { Skeleton } from '@/components/ui/Skeleton';
import { DropdownSelect } from '@/components/ui/DropdownSelect';
import { AdminPagination } from '@/features/admin/components/AdminPagination';
import { ModerationStatusBadge } from '@/features/admin/components/ModerationStatusBadge';
import { formatUserRole } from '@/features/admin/lib/admin-labels';
import { adminService } from '@/services/admin.service';
import { qk } from '@/constants/query-keys';
import { useStrings } from '@/constants/strings';
import type { AdminUserListItem } from '@/types/admin';

export default function AdminUsersPage() {
  const tr = useStrings();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page') ?? '1');
  const role = searchParams.get('role') ?? undefined;
  const accountStatus = searchParams.get('accountStatus') ?? undefined;

  const filters = useMemo(() => ({ page, limit: 20, role, accountStatus }), [page, role, accountStatus]);

  const query = useQuery({
    queryKey: qk.adminUsers(filters),
    queryFn: () => adminService.listUsers(filters),
  });

  function updateParams(patch: Record<string, string | undefined>) {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([k, v]) => {
      if (!v) next.delete(k);
      else next.set(k, v);
    });
    setSearchParams(next);
  }

  if (query.isPending) {
    return (
      <PageContainer width="full">
        <PageHeader title={tr.adminNavUsers} />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </PageContainer>
    );
  }

  if (query.isError || !query.data) {
    return (
      <PageContainer width="full">
        <ErrorState title={tr.adminUsersLoadError} onRetry={() => void query.refetch()} />
      </PageContainer>
    );
  }

  return (
    <PageContainer width="full">
      <PageHeader title={tr.adminNavUsers} description={tr.adminUsersSubtitle} />

      <div className="mb-4 flex flex-wrap gap-3">
        <DropdownSelect
          value={role ?? ''}
          onChange={(v) => updateParams({ role: v || undefined, page: '1' })}
          options={[
            { value: '', label: tr.adminFilterAllRoles },
            { value: 'parent', label: tr.roleParent },
            { value: 'student', label: tr.roleStudent },
            { value: 'mentor', label: tr.roleMentor },
            { value: 'admin', label: tr.adminRoleAdmin },
          ]}
        />
        <DropdownSelect
          value={accountStatus ?? ''}
          onChange={(v) => updateParams({ accountStatus: v || undefined, page: '1' })}
          options={[
            { value: '', label: tr.adminFilterAllStatuses },
            { value: 'active', label: tr.adminStatusActive },
            { value: 'suspended', label: tr.adminStatusSuspended },
          ]}
        />
      </div>

      <DataTable<AdminUserListItem>
        rows={query.data.items}
        empty={<EmptyState title={tr.adminUsersEmpty} />}
        columns={[
          {
            key: 'name',
            header: tr.adminColName,
            render: (row) => `${row.first_name} ${row.last_name}`.trim(),
          },
          { key: 'email', header: tr.email, render: (row) => row.email },
          {
            key: 'role',
            header: tr.role,
            render: (row) => formatUserRole(row.role),
          },
          {
            key: 'status',
            header: tr.adminColAccountStatus,
            render: (row) => <ModerationStatusBadge status={row.account_status} kind="account" />,
          },
          {
            key: 'created',
            header: tr.adminColCreated,
            render: (row) => format(new Date(row.created_at), 'PP'),
          },
          {
            key: 'actions',
            header: tr.adminColActions,
            render: (row) => (
              <Link
                to={`/admin/users/${row.id}`}
                className="inline-flex h-9 items-center rounded-full border border-[var(--color-m-card-border)] bg-[var(--color-m-surface-light)] px-4 text-[13px] font-semibold text-[var(--color-m-text)] hover:bg-[var(--color-m-surface-elevated)]"
              >
                {tr.adminView}
              </Link>
            ),
          },
        ]}
      />

      <AdminPagination pagination={query.data.pagination} onPageChange={(p) => updateParams({ page: String(p) })} />
    </PageContainer>
  );
}
