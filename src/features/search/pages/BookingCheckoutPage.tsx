import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { getDateFnsLocale } from '@/lib/date-locale';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageContainer } from '@/components/layouts/PageContainer';
import { BackLink } from '@/components/ui/BackLink';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { BookingSummaryCard } from '@/features/search/components/BookingSummaryCard';
import { CheckoutSummaryCard } from '@/features/search/components/CheckoutSummaryCard';
import { SponsoredCardPlacement } from '@/features/marketing/components/SponsoredCardPlacement';
import { useRoleBase } from '@/features/profile/hooks/useRoleBase';
import { useAuthStore } from '@/app/store/authStore';
import { invalidateMeetQueries } from '@/lib/invalidate-meet-queries';
import { checkoutBooking } from '@/services/bookings.service';
import { fetchParentWalletMe } from '@/services/parent-wallet.service';
import { useStrings, tr } from '@/constants/strings';
import type { BookingFlowState, BookingSlotSummary, BookingSummary } from '@/types/booking';

type LocationState = {
  booking: BookingSummary;
  flow?: BookingFlowState;
};

function formatSlot(iso: string) {
  try {
    return format(parseISO(iso), 'd MMM yyyy HH:mm', { locale: getDateFnsLocale() });
  } catch {
    return iso;
  }
}

function slotsFromFlow(flow?: BookingFlowState): BookingSlotSummary[] {
  if (!flow?.slots?.length) return [];
  return flow.slots.map((s) => ({
    slot_id: s.slot_id ?? s.start,
    start_time: s.start,
    end_time: s.end,
    status: 'reserved',
  }));
}

function resolveMentorName(booking: BookingSummary, flow?: BookingFlowState): string {
  return flow?.mentorName || booking.mentor_summary?.mentor_name || tr.findMentor;
}

function resolveMentorId(booking: BookingSummary, flow?: BookingFlowState): string {
  return flow?.mentorId || booking.mentor_summary?.mentor_id || '';
}

export default function BookingCheckoutPage() {
  const tr = useStrings();
  const location = useLocation();
  const navigate = useNavigate();
  const roleBase = useRoleBase();
  const role = useAuthStore((s) => s.user?.role);
  const qc = useQueryClient();
  const state = location.state as LocationState | null;
  const booking = state?.booking;
  const flow = state?.flow;

  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmed, setConfirmed] = useState<BookingSummary | null>(null);

  useEffect(() => {
    if (role && role !== 'parent') {
      toast.error(tr.parentOnlyBooking);
      navigate(`${roleBase}/search`, { replace: true });
    }
  }, [role, navigate, roleBase]);

  const walletQ = useQuery({
    queryKey: ['parent-wallet', 'me'],
    queryFn: fetchParentWalletMe,
    enabled: role === 'parent',
  });

  const walletCredits = walletQ.data?.credit_balance ?? walletQ.data?.balance ?? null;

  if (!booking?.booking_id) {
    return (
      <div className="mx-auto max-w-lg">
        <ErrorState
          title={tr.checkoutMissingBooking}
          onRetry={() => navigate(`${roleBase}/search`)}
        />
      </div>
    );
  }

  const mentorName = resolveMentorName(booking, flow);
  const mentorId = resolveMentorId(booking, flow);

  const displaySlots =
    (booking.selected_slots?.length ?? 0) > 0 ? booking.selected_slots! : slotsFromFlow(flow);

  const studentName = flow?.studentId
    ? null // would need student lookup; show nothing if no name cached
    : null;

  if (confirmed) {
    const confirmedName = resolveMentorName(confirmed, flow);
    const confirmedSlots = (confirmed.selected_slots?.length ?? 0) > 0
      ? confirmed.selected_slots!
      : slotsFromFlow(flow);
    return (
      <div className="mx-auto max-w-lg">
        <div className="text-center">
          <CheckCircle2 className="mx-auto size-16 text-[var(--color-m-success)]" aria-hidden />
          <h1 className="mt-4 text-2xl font-bold text-[var(--color-m-text)]">{tr.bookingConfirmed}</h1>
        </div>

        {/* Confirmation details */}
        <div className="mt-6 rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] p-5">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--color-m-text-muted)]">{tr.bookingSummaryMentor}</dt>
              <dd className="font-semibold text-[var(--color-m-text)]">{confirmedName}</dd>
            </div>
            {flow?.subject ? (
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--color-m-text-muted)]">{tr.bookingSummaryService}</dt>
                <dd className="font-semibold text-[var(--color-m-text)]">{flow.subject}</dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--color-m-text-muted)]">{tr.bookingCreditsUsed}</dt>
              <dd className="font-semibold text-[var(--color-brand-primary)]">
                {confirmed.used_credits} {tr.creditsUnit}
              </dd>
            </div>
            {walletCredits != null && (
              <div className="flex justify-between gap-4 border-t border-[var(--color-m-card-border)] pt-3">
                <dt className="text-[var(--color-m-text-muted)]">{tr.bookingRemainingBalance}</dt>
                <dd className="font-semibold text-[var(--color-m-text)]">
                  {Math.max(0, walletCredits - (confirmed.used_credits ?? 0))} {tr.creditsUnit}
                </dd>
              </div>
            )}
          </dl>

          {confirmedSlots.length > 0 && (
            <div className="mt-4 border-t border-[var(--color-m-card-border)] pt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-m-text-muted)]">
                {tr.selectedTimes}
              </p>
              <ul className="space-y-1.5">
                {confirmedSlots.map((s) => (
                  <li key={s.slot_id} className="flex items-center gap-2 text-sm text-[var(--color-m-text)]">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-m-success)]" />
                    {formatSlot(s.start_time)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <SponsoredCardPlacement
          placement="lessons_page"
          subject={flow?.subject}
          className="mt-6"
        />

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button type="button" onClick={() => navigate(`${roleBase}/dashboard`)}>
            {tr.goToDashboard}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(`${roleBase}/lessons`)}>
            {tr.viewLessons}
          </Button>
        </div>
      </div>
    );
  }

  const summaryForCard: BookingSummary = {
    ...booking,
    mentor_summary: {
      mentor_id: mentorId,
      mentor_name: mentorName,
    },
    selected_slots: displaySlots,
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      const result = await checkoutBooking(booking.booking_id);
      setConfirmed({
        ...booking,
        ...result,
        mentor_summary: result.mentor_summary ?? booking.mentor_summary ?? {
          mentor_id: mentorId,
          mentor_name: mentorName,
        },
        selected_slots: displaySlots,
      });
      toast.success(tr.bookingConfirmed);
      invalidateMeetQueries(qc, role);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data
          ?.message ??
        (err as Error)?.message ??
        tr.checkoutFailed;
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const backSearch = new URLSearchParams({
    listingId: flow?.listingId ?? '',
    mentorId,
    mentorName,
    subject: flow?.subject ?? '',
  });
  if (flow?.price != null) backSearch.set('price', String(flow.price));

  return (
    <PageContainer width="form">
      <BackLink to={`${roleBase}/search/booking?${backSearch.toString()}`}>{tr.back}</BackLink>

      <h1 className="text-xl font-bold text-[var(--color-m-text)]">{tr.checkoutTitle}</h1>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">{tr.checkoutSubtitle}</p>

      <div className="mt-6 space-y-4">
        <BookingSummaryCard
          mentorName={mentorName}
          subject={flow?.subject ?? ''}
          lessonCount={flow?.lessonCount ?? booking.used_credits}
          slots={displaySlots.map((s) => ({ start: s.start_time, end: s.end_time }))}
          estimatedTotal={flow?.price != null ? flow.price * (flow.lessonCount ?? 1) : null}
          studentName={studentName}
        />

        <CheckoutSummaryCard booking={summaryForCard} walletCredits={walletCredits} />

        <Card className="p-4">
          <h3 className="text-sm font-semibold text-[var(--color-m-text)]">{tr.selectedTimes}</h3>
          <ul className="mt-2 space-y-1 text-sm text-[var(--color-text-secondary)]">
            {displaySlots.map((s) => (
              <li key={s.slot_id}>{formatSlot(s.start_time)}</li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-8 flex gap-3">
        <Button type="button" variant="secondary" onClick={() => navigate(-1)} disabled={isProcessing}>
          {tr.back}
        </Button>
        <Button type="button" className="flex-1" onClick={() => void handleConfirm()} disabled={isProcessing}>
          {isProcessing ? (
            <span className="inline-flex items-center gap-2">
              <Spinner className="size-4" />
              {tr.processing}
            </span>
          ) : (
            tr.confirmBooking
          )}
        </Button>
      </div>
    </PageContainer>
  );
}
