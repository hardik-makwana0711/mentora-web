import { Badge } from '@/components/ui/Badge';
import { useStrings } from '@/constants/strings';

export function MentorModerationBadge({ status }: { status: string }) {
  const tr = useStrings();
  const labels: Record<string, string> = {
    draft: tr.moderationStatusDraft,
    pending_review: tr.moderationStatusPendingReview,
    approved: tr.moderationStatusApproved,
    changes_requested: tr.moderationStatusChangesRequested,
    rejected: tr.moderationStatusRejected,
    hidden_by_admin: tr.moderationStatusHidden,
  };
  const label = labels[status] ?? status;
  const variant =
    status === 'approved'
      ? 'success'
      : status === 'pending_review'
        ? 'warning'
        : status === 'rejected' || status === 'hidden_by_admin'
          ? 'danger'
          : 'info';
  return <Badge variant={variant}>{label}</Badge>;
}

export function MentorModerationNotice({
  profileModerationStatus,
  hasPendingRevision,
}: {
  profileModerationStatus?: string;
  hasPendingRevision?: boolean;
}) {
  const tr = useStrings();
  if (!profileModerationStatus) return null;

  const showPendingRevision =
    profileModerationStatus === 'approved' && hasPendingRevision;
  const isApproved = profileModerationStatus === 'approved';

  return (
    <div className="mb-6 space-y-3 rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] p-4">
      {showPendingRevision ? (
        <>
          <p className="text-sm font-medium text-[var(--color-m-text)]">{tr.profileCurrentApproved}</p>
          <p className="text-sm font-medium text-[var(--color-m-text)]">{tr.profilePendingEditsWaiting}</p>
          <p className="text-sm text-[var(--color-m-text-secondary)]">
            {tr.profileApprovedVisibleWhileReview}
          </p>
        </>
      ) : isApproved ? (
        <p className="text-sm text-[var(--color-m-text-secondary)]">{tr.profileApprovedAndVisible}</p>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-[var(--color-m-text-muted)]">{tr.profileModerationStatus}:</span>
          <MentorModerationBadge status={profileModerationStatus} />
        </div>
      )}
    </div>
  );
}
