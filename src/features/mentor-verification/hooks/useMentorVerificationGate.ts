import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/app/store/authStore';
import { qk } from '@/constants/query-keys';
import { mentorVerificationService } from '@/services/mentor-verification.service';

/**
 * Mirrors mobile's `VerificationContext` — polls every 10s while the mentor
 * is restricted so gated pages unlock live once approval lands, no refresh needed.
 */
export function useMentorVerificationGate() {
  const role = useAuthStore((s) => s.user?.role);
  const enabled = role === 'mentor';

  const query = useQuery({
    queryKey: qk.mentorVerification,
    queryFn: () => mentorVerificationService.getStatus(),
    enabled,
    refetchInterval: (q) => (q.state.data?.mentorAccessStatus === 'active' ? false : 10_000),
  });

  const status = query.data ?? null;
  const isIdentityVerified = status?.identityVerificationStatus === 'verified';
  const isStudentVerified =
    status?.studentVerificationStatus === 'approved' ||
    status?.studentVerificationStatus === 'not_required';

  const isRestricted = !status
    ? true
    : isIdentityVerified && isStudentVerified
      ? false
      : status.mentorAccessStatus === 'restricted';

  return {
    enabled,
    status,
    isLoading: enabled && query.isPending,
    isRestricted: enabled && isRestricted,
    needsIdentityVerification:
      status?.identityVerificationStatus === 'not_started' ||
      status?.identityVerificationStatus === 'pending' ||
      status?.identityVerificationStatus === 'failed',
    needsDocumentUpload:
      status?.studentVerificationType === 'recent_graduate' &&
      status?.studentVerificationStatus !== 'approved' &&
      (status?.studentVerificationStatus === 'rejected' || (status?.documents?.length ?? 0) === 0),
    isPendingReview: status?.studentVerificationStatus === 'pending',
  };
}
