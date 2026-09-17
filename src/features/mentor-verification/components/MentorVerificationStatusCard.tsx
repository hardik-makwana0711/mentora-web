import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useStrings } from '@/constants/strings';
import { useMentorVerificationGate } from '@/features/mentor-verification/hooks/useMentorVerificationGate';
import { mentorVerificationLabel } from '@/features/profile/lib/profile-utils';
import type { StudentVerificationStatus } from '@/types/profile';

function academicStatusLabel(
  status: StudentVerificationStatus | undefined,
  tr: ReturnType<typeof useStrings>
): string {
  switch (status) {
    case 'approved':
      return tr.verificationAcademicComplete;
    case 'pending':
      return tr.verificationStatusPending;
    case 'rejected':
      return tr.verificationStatusRejected;
    case 'not_required':
      return tr.verificationStatusNotRequired;
    default:
      return tr.verificationStatusNotStarted;
  }
}

function academicVariant(
  status: StudentVerificationStatus | undefined
): 'success' | 'warning' | 'danger' | 'default' {
  if (status === 'approved' || status === 'not_required') return 'success';
  if (status === 'pending') return 'warning';
  if (status === 'rejected') return 'danger';
  return 'default';
}

function identityVariant(status: string | undefined): 'success' | 'warning' | 'danger' | 'default' {
  if (status === 'verified') return 'success';
  if (status === 'pending') return 'warning';
  if (status === 'failed') return 'danger';
  return 'default';
}

export function MentorVerificationStatusCard() {
  const tr = useStrings();
  const navigate = useNavigate();
  const { status, isLoading, isRestricted, isPendingReview } = useMentorVerificationGate();

  if (isLoading || !status) return null;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-[var(--color-m-text)]">
          {tr.verificationPanelTitle}
        </h3>
        {isRestricted ? (
          <Badge variant={isPendingReview ? 'warning' : 'danger'}>
            {isPendingReview ? tr.verificationPendingReviewBadge : tr.verificationActionRequired}
          </Badge>
        ) : (
          <Badge variant="success">{tr.verificationFullyActive}</Badge>
        )}
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-[var(--color-m-text-secondary)]">
            {tr.verificationStepIdentity}
          </span>
          <Badge variant={identityVariant(status.identityVerificationStatus)}>
            {mentorVerificationLabel(status.identityVerificationStatus)}
          </Badge>
        </div>
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-[var(--color-m-text-secondary)]">
            {tr.verificationStepDocuments}
          </span>
          <Badge variant={academicVariant(status.studentVerificationStatus)}>
            {academicStatusLabel(status.studentVerificationStatus, tr)}
          </Badge>
        </div>
      </div>

      {isRestricted ? (
        <Button
          type="button"
          fullWidth
          className="mt-5"
          onClick={() => navigate('/mentor/verification')}
        >
          <ShieldCheck className="mr-2 size-4" aria-hidden />
          {tr.completeVerification}
        </Button>
      ) : (
        <p className="mt-4 flex items-start gap-2 text-sm text-[var(--color-m-success)]">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
          {tr.verificationFullyActiveBody}
        </p>
      )}
    </Card>
  );
}
