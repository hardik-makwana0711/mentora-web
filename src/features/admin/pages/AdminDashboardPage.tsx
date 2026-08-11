import { useQuery } from '@tanstack/react-query';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { ErrorState } from '@/components/ui/ErrorState';
import { StatCard } from '@/features/admin/components/StatCard';
import { adminService } from '@/services/admin.service';
import { qk } from '@/constants/query-keys';
import { useStrings } from '@/constants/strings';

export default function AdminDashboardPage() {
  const tr = useStrings();
  const query = useQuery({
    queryKey: qk.adminDashboard,
    queryFn: () => adminService.getDashboard(),
  });

  if (query.isError) {
    return (
      <PageContainer width="full">
        <ErrorState title={tr.adminDashboardLoadError} onRetry={() => void query.refetch()} />
      </PageContainer>
    );
  }

  const data = query.data;
  const loading = query.isPending;

  return (
    <PageContainer width="full">
      <PageHeader title={tr.adminNavDashboard} description={tr.adminDashboardSubtitle} />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <StatCard label={tr.adminStatTotalUsers} value={data?.users.total ?? 0} loading={loading} to="/admin/users" />
        <StatCard label={tr.adminStatMentors} value={data?.mentors.total ?? 0} loading={loading} to="/admin/users?role=mentor" />
        <StatCard
          label={tr.adminStatSuspended}
          value={data?.suspended.total ?? 0}
          loading={loading}
          to="/admin/users?accountStatus=suspended"
        />
        <StatCard
          label={tr.adminStatPendingVerifications}
          value={data?.verifications.pending ?? 0}
          loading={loading}
          to="/admin/mentor-verifications"
        />
        <StatCard
          label={tr.adminStatPendingProfiles}
          value={data?.profileModeration.pending_review ?? 0}
          loading={loading}
          to="/admin/mentor-profiles?moderationStatus=pending_review"
        />
        <StatCard
          label={tr.adminStatProfileRevisions}
          value={data?.profileModeration.changes_requested ?? 0}
          loading={loading}
          to="/admin/mentor-profiles?reviewType=profile_revision"
        />
        <StatCard
          label={tr.adminStatHiddenProfiles}
          value={data?.profileModeration.hidden_by_admin ?? 0}
          loading={loading}
          to="/admin/mentor-profiles?moderationStatus=hidden_by_admin"
        />
        <StatCard
          label={tr.adminStatPendingListings}
          value={data?.listingModeration.pending_review ?? 0}
          loading={loading}
          to="/admin/listings?moderationStatus=pending_review"
        />
        <StatCard
          label={tr.adminStatHiddenListings}
          value={data?.listingModeration.hidden_by_admin ?? 0}
          loading={loading}
          to="/admin/listings?moderationStatus=hidden_by_admin"
        />
      </div>
    </PageContainer>
  );
}
