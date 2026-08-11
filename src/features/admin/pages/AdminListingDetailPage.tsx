import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { BackLink } from '@/components/ui/BackLink';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { PresignedAvatar } from '@/features/profile/components/PresignedAvatar';
import { ConfirmModal } from '@/features/admin/components/ConfirmModal';
import { ReasonModal } from '@/features/admin/components/ReasonModal';
import { ModerationStatusBadge } from '@/features/admin/components/ModerationStatusBadge';
import { adminService } from '@/services/admin.service';
import { qk } from '@/constants/query-keys';
import { useStrings } from '@/constants/strings';

function normAxios(e: unknown, fallback: string): string {
  const ax = e as AxiosError & { normalizedMessage?: string };
  return ax.normalizedMessage || ax.message || fallback;
}

type ActionKind = 'approve' | 'requestChanges' | 'reject' | 'hide' | 'restore' | null;

export default function AdminListingDetailPage() {
  const tr = useStrings();
  const { listingId = '' } = useParams();
  const qc = useQueryClient();
  const [action, setAction] = useState<ActionKind>(null);

  const query = useQuery({
    queryKey: qk.adminListing(listingId),
    queryFn: () => adminService.getListing(listingId),
    enabled: Boolean(listingId),
  });

  const invalidate = async () => {
    await qc.invalidateQueries({ queryKey: ['admin', 'listings'] });
    await qc.invalidateQueries({ queryKey: qk.adminListing(listingId) });
    await qc.invalidateQueries({ queryKey: qk.adminDashboard });
  };

  const approveMutation = useMutation({
    mutationFn: () => adminService.approveListing(listingId),
    onSuccess: async () => {
      toast.success(tr.adminActionApproved);
      setAction(null);
      await invalidate();
    },
    onError: (e) => toast.error(normAxios(e, tr.adminActionFailed)),
  });

  const reasonMutation = useMutation({
    mutationFn: ({ kind, reason }: { kind: Exclude<ActionKind, 'approve' | 'restore' | null>; reason: string }) => {
      if (kind === 'requestChanges') return adminService.requestListingChanges(listingId, reason);
      if (kind === 'reject') return adminService.rejectListing(listingId, reason);
      return adminService.hideListing(listingId, reason);
    },
    onSuccess: async () => {
      toast.success(tr.adminActionSaved);
      setAction(null);
      await invalidate();
    },
    onError: (e) => toast.error(normAxios(e, tr.adminActionFailed)),
  });

  const restoreMutation = useMutation({
    mutationFn: () => adminService.restoreListing(listingId),
    onSuccess: async () => {
      toast.success(tr.adminActionRestored);
      setAction(null);
      await invalidate();
    },
    onError: (e) => toast.error(normAxios(e, tr.adminActionFailed)),
  });

  const busy = approveMutation.isPending || reasonMutation.isPending || restoreMutation.isPending;

  if (query.isPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-10 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return <ErrorState title={tr.adminListingLoadError} onRetry={() => void query.refetch()} />;
  }

  const data = query.data;

  return (
    <PageContainer width="full">
      <BackLink to="/admin/listings">{tr.back}</BackLink>
      <PageHeader title={tr.listingDetail} description={data.listingId} />

      <Card className="mt-6 flex gap-4 p-5">
        <PresignedAvatar storedUrl={data.mentor.avatarUrl} name={data.mentor.name} className="size-14" />
        <div>
          <p className="font-semibold text-[var(--color-m-text)]">{data.mentor.name}</p>
          <p className="text-sm text-[var(--color-text-muted)]">{data.mentor.mentorId}</p>
        </div>
      </Card>

      <Card className="mt-4 p-5">
        <div className="flex flex-wrap gap-2">
          <ModerationStatusBadge status={data.listingModerationStatus} kind="listing" />
          <ModerationStatusBadge status={data.availabilityStatus} kind="account" />
        </div>
        <dl className="mt-4 space-y-2 text-sm">
          <div>
            <dt className="text-[var(--color-text-muted)]">{tr.adminColSubmitted}</dt>
            <dd className="text-[var(--color-m-text)]">
              {data.submittedForReviewAt ? format(new Date(data.submittedForReviewAt), 'PPpp') : tr.notProvided}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-text-muted)]">{tr.adminColReviewed}</dt>
            <dd className="text-[var(--color-m-text)]">
              {data.reviewedAt ? format(new Date(data.reviewedAt), 'PPpp') : tr.notProvided}
            </dd>
          </div>
        </dl>
      </Card>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button type="button" onClick={() => setAction('approve')} disabled={busy}>
          {tr.adminApprove}
        </Button>
        <Button type="button" variant="secondary" onClick={() => setAction('requestChanges')} disabled={busy}>
          {tr.adminRequestChanges}
        </Button>
        <Button type="button" variant="danger" onClick={() => setAction('reject')} disabled={busy}>
          {tr.adminReject}
        </Button>
        <Button type="button" variant="secondary" onClick={() => setAction('hide')} disabled={busy}>
          {tr.adminHide}
        </Button>
        <Button type="button" variant="secondary" onClick={() => setAction('restore')} disabled={busy}>
          {tr.adminRestore}
        </Button>
      </div>

      <ConfirmModal
        open={action === 'approve'}
        title={tr.adminApproveListingTitle}
        body={tr.adminApproveListingBody}
        confirmLabel={tr.adminApprove}
        loading={approveMutation.isPending}
        onClose={() => setAction(null)}
        onConfirm={() => approveMutation.mutate()}
      />

      <ConfirmModal
        open={action === 'restore'}
        title={tr.adminRestoreListingTitle}
        body={tr.adminRestoreListingBody}
        confirmLabel={tr.adminRestore}
        loading={restoreMutation.isPending}
        onClose={() => setAction(null)}
        onConfirm={() => restoreMutation.mutate()}
      />

      <ReasonModal
        open={action === 'requestChanges' || action === 'reject' || action === 'hide'}
        title={
          action === 'requestChanges'
            ? tr.adminRequestChangesTitle
            : action === 'reject'
              ? tr.adminRejectListingTitle
              : tr.adminHideListingTitle
        }
        confirmLabel={
          action === 'requestChanges' ? tr.adminRequestChanges : action === 'reject' ? tr.adminReject : tr.adminHide
        }
        loading={reasonMutation.isPending}
        onClose={() => setAction(null)}
        onConfirm={(reason) => {
          if (action && action !== 'approve' && action !== 'restore') {
            reasonMutation.mutate({ kind: action, reason });
          }
        }}
      />
    </PageContainer>
  );
}
