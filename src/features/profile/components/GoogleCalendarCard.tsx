import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { CalendarCheck2, CalendarPlus, TriangleAlert } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useStrings } from '@/constants/strings';
import {
  disconnectGoogleCalendar,
  fetchGoogleCalendarStatus,
  startGoogleCalendarConnect,
} from '@/services/google-calendar.service';

const QK = ['google-calendar', 'status'] as const;

/**
 * Mentor: connect their own Google Calendar so lessons go on their calendar and they host the Meet.
 * Hidden until the server has Google Calendar sign-in set up.
 */
export function GoogleCalendarCard() {
  const tr = useStrings();
  const qc = useQueryClient();
  const [params, setParams] = useSearchParams();
  const [redirecting, setRedirecting] = useState(false);

  const status = useQuery({ queryKey: QK, queryFn: fetchGoogleCalendarStatus, staleTime: 60_000 });

  // Result of Google's redirect back to /mentor/profile?google_calendar=connected|error
  useEffect(() => {
    const result = params.get('google_calendar');
    if (!result) return;
    if (result === 'connected')
      toast.success(tr.googleCalendarConnectedToast, { id: 'google-calendar-result' });
    else
      toast.error(params.get('reason') || tr.googleCalendarFailedToast, {
        id: 'google-calendar-result',
      });
    const next = new URLSearchParams(params);
    next.delete('google_calendar');
    next.delete('reason');
    setParams(next, { replace: true });
    void qc.invalidateQueries({ queryKey: QK });
  }, [params, setParams, qc, tr]);

  const connect = useMutation({
    mutationFn: startGoogleCalendarConnect,
    onSuccess: (url) => {
      setRedirecting(true);
      window.location.assign(url);
    },
    onError: () => toast.error(tr.googleCalendarFailedToast),
  });

  const disconnect = useMutation({
    mutationFn: disconnectGoogleCalendar,
    onSuccess: (data) => {
      qc.setQueryData(QK, data);
      toast.success(tr.googleCalendarDisconnectedToast);
    },
  });

  const s = status.data;
  if (!s?.available) return null;

  const connected = s.connected;
  const Icon = connected ? CalendarCheck2 : s.needs_reconnect ? TriangleAlert : CalendarPlus;

  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <span
          className={
            connected
              ? 'flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-m-success)]/12 text-[var(--color-m-success)]'
              : 'flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-m-primary)]/10 text-[var(--color-m-primary-text)]'
          }
          aria-hidden
        >
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-[var(--color-m-text)]">
            {tr.googleCalendarTitle}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-[var(--color-m-text-secondary)] break-words">
            {connected
              ? tr.googleCalendarConnectedAs.replace('{{email}}', s.google_email ?? '')
              : s.needs_reconnect
                ? tr.googleCalendarNeedsReconnect
                : tr.googleCalendarNotConnected}
          </p>
          {!connected && s.lessons_use === 'platform' ? (
            <p className="mt-1 text-xs text-[var(--color-m-text-muted)]">
              {tr.googleCalendarUsingPlatform}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {connected ? (
          <Button
            type="button"
            variant="secondary"
            isLoading={disconnect.isPending}
            onClick={() => disconnect.mutate()}
          >
            {tr.googleCalendarDisconnect}
          </Button>
        ) : (
          <Button
            type="button"
            isLoading={connect.isPending || redirecting}
            onClick={() => connect.mutate()}
          >
            {s.needs_reconnect ? tr.googleCalendarReconnect : tr.googleCalendarConnect}
          </Button>
        )}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-[var(--color-m-text-muted)]">
        {tr.googleCalendarPrivacyNote}
      </p>
    </Card>
  );
}
