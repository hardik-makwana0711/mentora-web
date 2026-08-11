import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Video } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/app/store/authStore';
import i18n from '@/i18n';
import { useStrings } from '@/constants/strings';
import { invalidateMeetQueries } from '@/lib/invalidate-meet-queries';
import { getJoinButtonState } from '@/lib/meeting-join';
import { generateMeetingLink } from '@/services/sessions.service';
import type { JoinableSession } from '@/types/sessions';

type MeetingStatusSectionProps = {
  session: JoinableSession;
  showProvider?: boolean;
  className?: string;
  /** Show retry when `meeting_status` is FAILED (mentor/parent per API). */
  allowRetry?: boolean;
};

export function MeetingStatusSection({
  session,
  showProvider = true,
  className,
  allowRetry = false,
}: MeetingStatusSectionProps) {
  const tr = useStrings();
  const qc = useQueryClient();
  const role = useAuthStore((s) => s.user?.role);
  const { hint } = getJoinButtonState(session);
  const provider =
    session.meeting_provider === 'GOOGLE_MEET'
      ? i18n.t('meetProviderGoogle', { lng: 'tr' })
      : null;
  const showRetry =
    allowRetry &&
    session.meeting_status === 'FAILED' &&
    (role === 'mentor' || role === 'parent');

  const retry = useMutation({
    mutationFn: () => generateMeetingLink(session.session_id),
    onSuccess: (data) => {
      if (data.meeting_status === 'READY' && data.meeting_url) {
        toast.success(tr.meetRetrySuccess);
      } else {
        toast.info(tr.meetRetryPending);
      }
      invalidateMeetQueries(qc, role);
      void qc.invalidateQueries({ queryKey: ['sessions', session.session_id] });
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        tr.meetRetryFailed;
      toast.error(msg);
    },
  });

  return (
    <div className={className}>
      {showProvider && provider ? (
        <p className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
          <Video className="size-3.5" aria-hidden />
          {provider}
        </p>
      ) : null}
      {hint ? <p className="mt-1 text-xs text-[var(--color-text-muted)]">{hint}</p> : null}
      {showRetry ? (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="mt-2"
          disabled={retry.isPending}
          onClick={() => retry.mutate()}
        >
          {retry.isPending ? tr.loading : tr.meetRetryLink}
        </Button>
      ) : null}
    </div>
  );
}
