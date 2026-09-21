import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/layouts/PageContainer';
import { Spinner } from '@/components/ui/Spinner';
import { VerificationRestrictedOverlay } from '@/features/listings/components/VerificationRestrictedOverlay';
import { useMentorVerificationGate } from '@/features/mentor-verification/hooks/useMentorVerificationGate';

/** Wraps a mentor-only route: blanks its content with a verification-required
 * overlay until the mentor's identity + academic verification are approved. */
export function MentorVerificationGate({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { enabled, isLoading, isRestricted } = useMentorVerificationGate();

  if (!enabled) return <>{children}</>;

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-10 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />
      </div>
    );
  }

  if (isRestricted) {
    return (
      <PageContainer>
        <VerificationRestrictedOverlay onBack={() => navigate('/mentor/profile')} />
      </PageContainer>
    );
  }

  return <>{children}</>;
}
