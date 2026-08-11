import { useState } from 'react';
import { Play } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { getJoinButtonState, openLessonMeet } from '@/lib/meeting-join';
import { normAxios } from '@/lib/norm-axios';
import { fetchTranscriptStatus, submitTranscriptConsent } from '@/services/lessons.service';
import type { JoinableSession } from '@/types/sessions';
import { cn } from '@/lib/utils';
import { RecordingConsentModal } from './RecordingConsentModal';
import { useStrings } from '@/constants/strings';

type LessonJoinButtonProps = {
  session: JoinableSession;
  size?: 'sm' | 'md';
  className?: string;
  /** Primary (dashboard hero) vs default card styling */
  variant?: 'primary' | 'default';
  onClick?: () => void;
};

export function LessonJoinButton({
  session,
  size = 'sm',
  className,
  variant = 'default',
  onClick,
}: LessonJoinButtonProps) {
  const tr = useStrings();
  const { disabled, label } = getJoinButtonState(session);
  const [consentOpen, setConsentOpen] = useState(false);
  const [checkingConsent, setCheckingConsent] = useState(false);

  const proceedToJoin = async () => {
    onClick?.();
    await openLessonMeet(session.session_id, session);
  };

  const handleClick = async () => {
    if (disabled || checkingConsent) return;

    try {
      setCheckingConsent(true);
      const status = await fetchTranscriptStatus(session.session_id);
      if (!status.transcriptConsentStatus || status.transcriptConsentStatus === 'PENDING') {
        setConsentOpen(true);
        return;
      }
    } catch {
      // Fall through to join if consent status cannot be loaded.
    } finally {
      setCheckingConsent(false);
    }

    await proceedToJoin();
  };

  const handleConsent = async (accepted: boolean) => {
    setCheckingConsent(true);
    try {
      await submitTranscriptConsent(session.session_id, accepted);
      setConsentOpen(false);
      await proceedToJoin();
    } catch (e) {
      toast.error(normAxios(e, tr.recordingConsentSaveFailed));
    } finally {
      setCheckingConsent(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        size={size}
        disabled={disabled || checkingConsent}
        isLoading={checkingConsent && !consentOpen}
        onClick={() => void handleClick()}
        className={cn(
          variant === 'primary' && !disabled && 'bg-[var(--color-m-surface-elevated)] text-[var(--color-m-primary)] hover:bg-[var(--color-m-hover-overlay)]',
          className,
        )}
      >
        <Play className="size-4" aria-hidden />
        {label}
      </Button>

      <RecordingConsentModal
        open={consentOpen}
        isLoading={checkingConsent}
        onClose={() => setConsentOpen(false)}
        onAccept={() => void handleConsent(true)}
        onDecline={() => void handleConsent(false)}
      />
    </>
  );
}
