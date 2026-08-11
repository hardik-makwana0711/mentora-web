import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { BackLink } from '@/components/ui/BackLink';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
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

function ProfilePanel({
  title,
  profile,
}: {
  title: string;
  profile: Record<string, unknown> | null;
}) {
  const tr = useStrings();
  if (!profile) {
    return (
      <Card className="p-5">
        <h3 className="font-semibold text-[var(--color-m-text)]">{title}</h3>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">{tr.notProvided}</p>
      </Card>
    );
  }

  const fields: Array<[string, unknown]> = [
    [tr.firstName, profile.full_name],
    [tr.bio, profile.short_bio],
    [tr.university, profile.university],
    [tr.adminProfessionalTitle, profile.professional_title],
    [tr.adminHourlyRate, profile.hourly_rate],
  ];

  return (
    <Card className="p-5">
      <h3 className="font-semibold text-[var(--color-m-text)]">{title}</h3>
      <dl className="mt-4 space-y-2 text-sm">
        {fields.map(([label, value]) =>
          value != null && value !== '' ? (
            <div key={label}>
              <dt className="text-[var(--color-text-muted)]">{label}</dt>
              <dd className="text-[var(--color-m-text)]">{String(value)}</dd>
            </div>
          ) : null
        )}
      </dl>
    </Card>
  );
}

type ActionKind = 'approve' | 'requestChanges' | 'reject' | 'hide' | 'restore' | null;

export default function MentorProfileDetailPage() {
  const tr = useStrings();
  const { mentorId = '' } = useParams();
  const qc = useQueryClient();
  const [action, setAction] = useState<ActionKind>(null);

  const query = useQuery({
    queryKey: qk.adminMentorProfile(mentorId),
    queryFn: () => adminService.getMentorProfile(mentorId),
    enabled: Boolean(mentorId),
  });

  const invalidate = async () => {
    await qc.invalidateQueries({ queryKey: ['admin', 'mentor-profiles'] });
    await qc.invalidateQueries({ queryKey: qk.adminMentorProfile(mentorId) });
    await qc.invalidateQueries({ queryKey: qk.adminDashboard });
  };

  const approveMutation = useMutation({
    mutationFn: () => adminService.approveMentorProfile(mentorId),
    onSuccess: async () => {
      toast.success(tr.adminActionApproved);
      setAction(null);
      await invalidate();
    },
    onError: (e) => toast.error(normAxios(e, tr.adminActionFailed)),
  });

  const reasonMutation = useMutation({
    mutationFn: ({ kind, reason }: { kind: Exclude<ActionKind, 'approve' | 'restore' | null>; reason: string }) => {
      if (kind === 'requestChanges') return adminService.requestMentorProfileChanges(mentorId, reason);
      if (kind === 'reject') return adminService.rejectMentorProfile(mentorId, reason);
      return adminService.hideMentorProfile(mentorId, reason);
    },
    onSuccess: async () => {
      toast.success(tr.adminActionSaved);
      setAction(null);
      await invalidate();
    },
    onError: (e) => toast.error(normAxios(e, tr.adminActionFailed)),
  });

  const restoreMutation = useMutation({
    mutationFn: () => adminService.restoreMentorProfile(mentorId),
    onSuccess: async () => {
      toast.success(tr.adminActionRestored);
      setAction(null);
      await invalidate();
    },
    onError: (e) => toast.error(normAxios(e, tr.adminActionFailed)),
  });

  const busy =
    approveMutation.isPending || reasonMutation.isPending || restoreMutation.isPending;

  if (query.isPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-10 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return <ErrorState title={tr.adminProfileLoadError} onRetry={() => void query.refetch()} />;
  }

  const data = query.data;
  const pendingData = data.pendingRevision?.proposedProfileData ?? null;

  return (
    <PageContainer width="full">
      <BackLink to="/admin/mentor-profiles">{tr.back}</BackLink>
      <PageHeader
        title={data.publishedProfile?.full_name ?? tr.adminNavProfiles}
        description={data.mentorId}
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <ModerationStatusBadge status={data.profileModerationStatus} kind="profile" />
        {data.pendingRevision ? (
          <ModerationStatusBadge status={data.pendingRevision.status} kind="profile" />
        ) : null}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ProfilePanel title={tr.adminPublishedProfile} profile={data.publishedProfile as unknown as Record<string, unknown>} />
        <ProfilePanel title={tr.adminPendingRevision} profile={pendingData} />
      </div>

      {data.pendingRevision?.rejectionReason ? (
        <Card className="mt-4 border-[var(--color-m-error)]/30 p-4 text-sm text-[var(--color-m-error)]">
          {data.pendingRevision.rejectionReason}
        </Card>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-3">
        <Button type="button" onClick={() => setAction('approve')} disabled={busy}>
          {data.pendingRevision ? tr.adminApproveRevision : tr.adminApproveProfile}
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
        title={tr.adminApproveProfileTitle}
        body={tr.adminApproveProfileBody}
        confirmLabel={tr.adminApprove}
        loading={approveMutation.isPending}
        onClose={() => setAction(null)}
        onConfirm={() => approveMutation.mutate()}
      />

      <ConfirmModal
        open={action === 'restore'}
        title={tr.adminRestoreProfileTitle}
        body={tr.adminRestoreProfileBody}
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
              ? tr.adminRejectProfileTitle
              : tr.adminHideProfileTitle
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
