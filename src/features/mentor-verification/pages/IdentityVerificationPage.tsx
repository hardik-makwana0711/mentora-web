import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ShieldCheck } from 'lucide-react';
import { PageContainer } from '@/components/layouts/PageContainer';
import { BackLink } from '@/components/ui/BackLink';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { useStrings } from '@/constants/strings';
import { qk } from '@/constants/query-keys';
import { useRoleBase } from '@/features/profile/hooks/useRoleBase';
import { mentorVerificationService } from '@/services/mentor-verification.service';
import type { IdentityVerificationStatus } from '@/types/profile';

function statusVariant(
  status: IdentityVerificationStatus
): 'success' | 'warning' | 'danger' | 'default' {
  if (status === 'verified') return 'success';
  if (status === 'pending') return 'warning';
  if (status === 'failed') return 'danger';
  return 'default';
}

export default function IdentityVerificationPage() {
  const tr = useStrings();
  const navigate = useNavigate();
  const roleBase = useRoleBase();
  const qc = useQueryClient();
  const [opened, setOpened] = useState(false);

  const query = useQuery({
    queryKey: qk.mentorVerification,
    queryFn: () => mentorVerificationService.getStatus(),
    refetchInterval: (q) => (q.state.data?.mentorAccessStatus === 'active' ? false : 10_000),
  });

  const startMutation = useMutation({
    mutationFn: () => mentorVerificationService.startIdentity(),
    onSuccess: (data) => {
      window.open(data.verification_url, '_blank', 'noopener,noreferrer');
      setOpened(true);
    },
    onError: () => toast.error(tr.identityStartFailed),
  });

  const statusLabel = (status: IdentityVerificationStatus) =>
    status === 'not_started'
      ? tr.verificationStatusNotStarted
      : status === 'pending'
        ? tr.verificationStatusPending
        : status === 'verified'
          ? tr.verificationStatusVerified
          : tr.verificationStatusFailed;

  if (query.isPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-10 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />
      </div>
    );
  }

  const status = query.data;
  if (query.isError || !status) {
    return (
      <ErrorState title={tr.verificationStatusLoadFailed} onRetry={() => void query.refetch()} />
    );
  }

  const canRestart =
    status.identityVerificationStatus === 'not_started' ||
    status.identityVerificationStatus === 'failed';
  const canRefresh = status.identityVerificationStatus === 'pending' || opened;

  return (
    <PageContainer width="form">
      <BackLink to={`${roleBase}/verification`}>{tr.back}</BackLink>

      <Card className="p-6">
        <div className="flex flex-col items-center text-center">
          <ShieldCheck className="mb-3 size-12 text-[var(--color-m-primary)]" aria-hidden />
          <h1 className="text-xl font-bold text-[var(--color-m-text)]">
            {tr.identityVerificationTitle}
          </h1>
          <p className="mt-2 text-sm text-[var(--color-m-text-secondary)]">
            {tr.identityVerificationBody}
          </p>

          <div className="mt-4">
            <Badge variant={statusVariant(status.identityVerificationStatus)}>
              {statusLabel(status.identityVerificationStatus)}
            </Badge>
          </div>

          {opened ? (
            <p className="mt-3 text-xs text-[var(--color-m-text-muted)]">{tr.identityOpenedHint}</p>
          ) : null}

          <div className="mt-6 flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            {canRestart ? (
              <Button
                type="button"
                isLoading={startMutation.isPending}
                onClick={() => startMutation.mutate()}
              >
                {status.identityVerificationStatus === 'failed'
                  ? tr.identityRestartButton
                  : tr.identityStartButton}
              </Button>
            ) : null}
            {canRefresh ? (
              <Button
                type="button"
                variant="secondary"
                isLoading={query.isFetching}
                onClick={() => void qc.invalidateQueries({ queryKey: qk.mentorVerification })}
              >
                {tr.identityRefreshStatus}
              </Button>
            ) : null}
          </div>

          {status.identityVerificationStatus === 'verified' ? (
            <Button
              type="button"
              variant="ghost"
              className="mt-4"
              onClick={() => navigate(`${roleBase}/verification`)}
            >
              {tr.verificationContinue}
            </Button>
          ) : null}
        </div>
      </Card>
    </PageContainer>
  );
}
