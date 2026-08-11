import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { DataTable } from '@/components/ui/DataTable';
import { Skeleton } from '@/components/ui/Skeleton';
import { ModerationStatusBadge } from '@/features/admin/components/ModerationStatusBadge';
import { adminService } from '@/services/admin.service';
import { qk } from '@/constants/query-keys';
import { useStrings } from '@/constants/strings';
import type { AdminMentorVerificationListItem } from '@/types/admin';

export default function MentorVerificationsPage() {
  const tr = useStrings();
  const query = useQuery({
    queryKey: qk.adminMentorVerifications,
    queryFn: () => adminService.listMentorVerifications(),
  });

  if (query.isPending) {
    return (
      <PageContainer width="full">
        <PageHeader title={tr.adminNavVerifications} />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </PageContainer>
    );
  }

  if (query.isError) {
    return (
      <PageContainer width="full">
        <ErrorState title={tr.adminVerificationsLoadError} onRetry={() => void query.refetch()} />
      </PageContainer>
    );
  }

  const rows = query.data?.pending ?? [];

  return (
    <PageContainer width="full">
      <PageHeader title={tr.adminNavVerifications} description={tr.adminVerificationsSubtitle} />

      <DataTable<AdminMentorVerificationListItem>
        rows={rows}
        empty={<EmptyState title={tr.adminVerificationsEmpty} />}
        columns={[
          {
            key: 'email',
            header: tr.email,
            render: (row) => row.email,
          },
          {
            key: 'student',
            header: tr.adminColStudentVerification,
            render: (row) => (
              <ModerationStatusBadge status={row.student_verification_status} kind="account" />
            ),
          },
          {
            key: 'identity',
            header: tr.adminColIdentityVerification,
            render: (row) => (
              <ModerationStatusBadge status={row.identity_verification_status} kind="account" />
            ),
          },
          {
            key: 'access',
            header: tr.adminColAccessStatus,
            render: (row) => <ModerationStatusBadge status={row.mentor_access_status} kind="account" />,
          },
          {
            key: 'submitted',
            header: tr.adminColSubmitted,
            render: (row) => format(new Date(row.created_at), 'PP'),
          },
          {
            key: 'actions',
            header: tr.adminColActions,
            render: (row) => (
              <Link
                to={`/admin/mentor-verifications/${row.mentor_id}`}
                className="inline-flex h-9 items-center rounded-full border border-[var(--color-m-card-border)] bg-[var(--color-m-surface-light)] px-4 text-[13px] font-semibold text-[var(--color-m-text)] hover:bg-[var(--color-m-surface-elevated)]"
              >
                {tr.adminView}
              </Link>
            ),
          },
        ]}
      />
    </PageContainer>
  );
}
