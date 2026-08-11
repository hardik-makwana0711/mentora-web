import { Link, useSearchParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import type { AdminMentorProfileDetail, ProfileModerationStatus } from '@/types/admin';

export default function MentorProfilesPage() {
  const tr = useStrings();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '');
  const page = Number(searchParams.get('page') ?? '1');
  const moderationStatus = (searchParams.get('moderationStatus') as ProfileModerationStatus | null) ?? undefined;
  const reviewType = (searchParams.get('reviewType') as 'initial_submission' | 'profile_revision' | null) ?? undefined;

  const filters = useMemo(
    () => ({ page, limit: 20, moderationStatus, reviewType, search: searchParams.get('search') ?? undefined }),
    [page, moderationStatus, reviewType, searchParams]
  );

  const query = useQuery({
    queryKey: qk.adminMentorProfiles(filters),
    queryFn: () => adminService.listMentorProfiles(filters),
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
        <PageHeader title={tr.adminNavProfiles} />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </PageContainer>
    );
  }

  if (query.isError || !query.data) {
    return (
      <PageContainer width="full">
        <ErrorState title={tr.adminProfilesLoadError} onRetry={() => void query.refetch()} />
      </PageContainer>
    );
  }

  const rows = query.data.items;

  return (
    <PageContainer width="full">
      <PageHeader title={tr.adminNavProfiles} description={tr.adminProfilesSubtitle} />

      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder={tr.searchPlaceholder}
          className="max-w-xs"
          onKeyDown={(e) => {
            if (e.key === 'Enter') updateParams({ search: searchInput.trim() || undefined, page: '1' });
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
        <DropdownSelect
          value={reviewType ?? ''}
          onChange={(v) => updateParams({ reviewType: v || undefined, page: '1' })}
          options={[
            { value: '', label: tr.adminFilterAllReviewTypes },
            { value: 'initial_submission', label: tr.adminReviewInitial },
            { value: 'profile_revision', label: tr.adminReviewRevision },
          ]}
        />
      </div>

      <DataTable<AdminMentorProfileDetail>
        rows={rows}
        empty={<EmptyState title={tr.adminProfilesEmpty} />}
        columns={[
          {
            key: 'mentor',
            header: tr.adminColMentor,
            render: (row) =>
              row.publishedProfile?.full_name ??
              (row.pendingRevision?.proposedProfileData?.full_name as string | undefined) ??
              row.mentorId.slice(0, 8),
          },
          {
            key: 'status',
            header: tr.adminColModerationStatus,
            render: (row) => <ModerationStatusBadge status={row.profileModerationStatus} kind="profile" />,
          },
          {
            key: 'revision',
            header: tr.adminColPendingRevision,
            render: (row) => (row.pendingRevision ? tr.yes : tr.no),
          },
          {
            key: 'actions',
            header: tr.adminColActions,
            render: (row) => (
              <Link
                to={`/admin/mentor-profiles/${row.mentorId}`}
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
