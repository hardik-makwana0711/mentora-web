import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Info, Lock, ShieldCheck, Clock as ClockIcon, User } from 'lucide-react';
import { PageContainer } from '@/components/layouts/PageContainer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { useStrings } from '@/constants/strings';
import i18n from '@/i18n';
import { useAuthStore } from '@/app/store/authStore';
import { useRoleBase } from '@/features/profile/hooks/useRoleBase';
import { useMentorVerificationGate } from '@/features/mentor-verification/hooks/useMentorVerificationGate';
import { cn } from '@/lib/utils';

type StepTone = 'success' | 'warning' | 'locked' | 'todo';

function StepIcon({ tone, icon: Icon }: { tone: StepTone; icon: typeof User }) {
  const toneClass =
    tone === 'success'
      ? 'bg-[var(--color-m-success)] text-white'
      : tone === 'warning'
        ? 'bg-[var(--color-m-warning)]/20 text-[var(--color-m-warning)] ring-1 ring-[var(--color-m-warning)]/40'
        : tone === 'locked'
          ? 'bg-[var(--color-m-surface-light)] text-[var(--color-m-text-muted)] opacity-50 ring-1 ring-[var(--color-m-card-border)]'
          : 'bg-[var(--color-m-surface-light)] text-[var(--color-m-text-secondary)] ring-1 ring-[var(--color-m-card-border)]';
  return (
    <span
      className={cn('flex size-9 shrink-0 items-center justify-center rounded-full', toneClass)}
    >
      <Icon className="size-[18px]" aria-hidden />
    </span>
  );
}

function StepRow({
  tone,
  icon,
  title,
  description,
  muted,
}: {
  tone: StepTone;
  icon: typeof User;
  title: string;
  description: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <StepIcon tone={tone} icon={icon} />
      <div className="min-w-0 flex-1 pt-0.5">
        <p
          className={cn(
            'font-semibold',
            muted ? 'text-[var(--color-m-text-muted)]' : 'text-[var(--color-m-text)]'
          )}
        >
          {title}
        </p>
        <p className="mt-0.5 text-sm text-[var(--color-m-text-muted)]">{description}</p>
      </div>
    </div>
  );
}

export default function VerificationOnboardingPage() {
  const tr = useStrings();
  const navigate = useNavigate();
  const roleBase = useRoleBase();
  const user = useAuthStore((s) => s.user);
  const { status, isLoading, isRestricted, needsIdentityVerification, isPendingReview } =
    useMentorVerificationGate();

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-10 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />
      </div>
    );
  }

  if (!status) {
    return (
      <ErrorState
        title={tr.verificationStatusLoadFailed}
        onRetry={() => window.location.reload()}
      />
    );
  }

  const isStudentEmailType = status.studentVerificationType === 'student_email';

  const identityTone: StepTone =
    status.identityVerificationStatus === 'verified'
      ? 'success'
      : status.identityVerificationStatus === 'pending'
        ? 'warning'
        : 'todo';
  const identityDescription =
    status.identityVerificationStatus === 'verified'
      ? tr.verificationIdentityVerifiedMsg
      : status.identityVerificationStatus === 'pending'
        ? tr.verificationIdentityInProgress
        : status.identityVerificationStatus === 'failed'
          ? tr.verificationIdentityFailedMsg
          : tr.verificationIdentityPrompt;

  const academicTone: StepTone = needsIdentityVerification
    ? 'locked'
    : status.studentVerificationStatus === 'approved'
      ? 'success'
      : status.studentVerificationStatus === 'pending'
        ? 'warning'
        : 'todo';
  const academicDescription = needsIdentityVerification
    ? tr.verificationAcademicLocked
    : isStudentEmailType
      ? tr.verificationStudentEmailAutoApproved
      : status.studentVerificationStatus === 'approved'
        ? tr.verificationAcademicApproved
        : status.studentVerificationStatus === 'pending'
          ? tr.verificationAcademicUnderReview
          : status.studentVerificationStatus === 'rejected'
            ? status.manualVerificationNotes
              ? i18n.t('verificationAcademicRejectedWithNotes', {
                  notes: status.manualVerificationNotes,
                })
              : tr.verificationAcademicRejected
            : tr.verificationAcademicUploadPrompt;

  const infoMessage = needsIdentityVerification
    ? tr.verificationInfoRestrictedIdentity
    : isPendingReview
      ? tr.verificationInfoPendingReview
      : tr.verificationInfoRestrictedOther;

  return (
    <PageContainer width="form">
      <div className="flex flex-col items-center text-center">
        <span className="mb-3 flex size-16 items-center justify-center rounded-2xl bg-[var(--color-m-primary)]/15 text-[var(--color-m-primary-light)] ring-1 ring-[var(--color-m-ring-subtle)]">
          <ShieldCheck className="size-8" aria-hidden />
        </span>
        <h1 className="text-2xl font-bold text-[var(--color-m-text)]">
          {tr.verificationOnboardingTitle}
        </h1>
        <p className="mt-1 text-sm text-[var(--color-m-text-secondary)]">
          {tr.verificationOnboardingSubtitle}
        </p>
      </div>

      <Card className="mt-6 space-y-5 p-5">
        <StepRow
          tone="success"
          icon={CheckCircle2}
          title={tr.verificationStepEmail}
          description={i18n.t('verificationEmailConfirmed', { email: user?.email ?? '' })}
        />
        <StepRow
          tone={identityTone}
          icon={identityTone === 'warning' ? ClockIcon : User}
          title={tr.verificationStepIdentity}
          description={identityDescription}
        />
        <StepRow
          tone={academicTone}
          icon={academicTone === 'locked' ? Lock : academicTone === 'warning' ? ClockIcon : User}
          title={tr.verificationStepDocuments}
          description={academicDescription}
          muted={academicTone === 'locked'}
        />
      </Card>

      {isRestricted ? (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-[var(--color-m-primary)]/30 bg-[var(--color-m-primary)]/10 p-4 text-sm text-[var(--color-m-text-secondary)]">
          <Info
            className="mt-0.5 size-4 shrink-0 text-[var(--color-m-primary-light)]"
            aria-hidden
          />
          {infoMessage}
        </div>
      ) : null}

      <div className="mt-6">
        {needsIdentityVerification ? (
          <Button
            type="button"
            fullWidth
            size="lg"
            onClick={() => navigate(`${roleBase}/verification/identity`)}
          >
            {status.identityVerificationStatus === 'pending'
              ? tr.verificationCheckStatus
              : tr.verificationVerifyIdentityButton}
          </Button>
        ) : isRestricted ? (
          <>
            <Button
              type="button"
              fullWidth
              size="lg"
              onClick={() => navigate(`${roleBase}/verification/documents`)}
            >
              {tr.completeVerification}
            </Button>
            <button
              type="button"
              onClick={() => navigate(`${roleBase}/dashboard`)}
              className="mt-3 w-full text-center text-sm font-medium text-[var(--color-m-text-muted)] hover:text-[var(--color-m-text)]"
            >
              {tr.verificationIllDoLater}
            </button>
          </>
        ) : (
          <Button
            type="button"
            fullWidth
            size="lg"
            onClick={() => navigate(`${roleBase}/dashboard`)}
          >
            {tr.goToDashboard}
          </Button>
        )}
      </div>
    </PageContainer>
  );
}
