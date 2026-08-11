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
import { Input } from '@/components/ui/Input';
import { DropdownSelect } from '@/components/ui/DropdownSelect';
import { AdminPagination } from '@/features/admin/components/AdminPagination';
import { ModerationStatusBadge } from '@/features/admin/components/ModerationStatusBadge';
import { adminService } from '@/services/admin.service';
import { qk } from '@/constants/query-keys';
import { useStrings } from '@/constants/strings';
import type { AdminListingListItem, ListingModerationStatus } from '@/types/admin';

export default function AdminListingsPage() {
  const tr = useStrings();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page') ?? '1');
  const moderationStatus = (searchParams.get('moderationStatus') as ListingModerationStatus | null) ?? undefined;

  const filters = useMemo(
    () => ({ page, limit: 20, moderationStatus, search: searchParams.get('search') ?? undefined }),
    [page, moderationStatus, searchParams]
  );

  const query = useQuery({
    queryKey: qk.adminListings(filters),
    queryFn: () => adminService.listListings(filters),
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
        <PageHeader title={tr.adminNavListings} />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </PageContainer>
    );
  }

  if (query.isError || !query.data) {
    return (
      <PageContainer width="full">
        <ErrorState title={tr.adminListingsLoadError} onRetry={() => void query.refetch()} />
      </PageContainer>
    );
  }

  return (
    <PageContainer width="full">
      <PageHeader title={tr.adminNavListings} description={tr.adminListingsSubtitle} />

      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          placeholder={tr.searchPlaceholder}
          className="max-w-xs"
          defaultValue={searchParams.get('search') ?? ''}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              updateParams({ search: (e.target as HTMLInputElement).value.trim() || undefined, page: '1' });
            }
          }}
        />
        <DropdownSelect
          value={moderationStatus ?? ''}
          onChange={(v) => updateParams({ moderationStatus: v || undefined, page: '1' })}
          options={[
            { value: '', label: tr.adminFilterAllStatuses },
            { value: 'pending_review', label: tr.adminStatusPendingReview },
            { value: 'approved', label: tr.adminStatusApproved },
            { value: 'changes_requested', label: tr.adminStatusChangesRequested },
            { value: 'rejected', label: tr.adminStatusRejected },
            { value: 'hidden_by_admin', label: tr.adminStatusHidden },
          ]}
        />
      </div>

      <DataTable<AdminListingListItem>
        rows={query.data.items}
        empty={<EmptyState title={tr.adminListingsEmpty} />}
        columns={[
          {
            key: 'id',
            header: tr.adminColListing,
            render: (row) => row.id.slice(0, 8),
          },
          {
            key: 'format',
            header: tr.adminColLessonFormat,
            render: (row) => row.lesson_format,
          },
          {
            key: 'moderation',
            header: tr.adminColModerationStatus,
            render: (row) => <ModerationStatusBadge status={row.listing_moderation_status} kind="listing" />,
          },
          {
            key: 'availability',
            header: tr.adminColAvailability,
            render: (row) => <ModerationStatusBadge status={row.status} kind="account" />,
          },
          {
            key: 'submitted',
            header: tr.adminColSubmitted,
            render: (row) =>
              row.submitted_for_review_at ? format(new Date(row.submitted_for_review_at), 'PP') : '—',
          },
          {
            key: 'actions',
            header: tr.adminColActions,
            render: (row) => (
              <Link
                to={`/admin/listings/${row.id}`}
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
