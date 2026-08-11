import type { BookingSummary } from '@/types/booking';
import { useStrings } from '@/constants/strings';

type Props = {
  booking: BookingSummary;
  walletCredits?: number | null;
};

export function CheckoutSummaryCard({ booking, walletCredits }: Props) {
  const tr = useStrings();
  const plan = booking.plan_type ?? booking.selected_plan ?? 'single_lesson';
  const isPackage = plan !== 'use_remaining_credits';
  const initialBalance =
    (booking.total_credits ?? 0) + (booking.used_credits ?? 0) - (booking.purchased_credits ?? 0);

  return (
    <section className="rounded-2xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
        {tr.checkoutCreditsTitle}
      </h2>

      {walletCredits != null ? (
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          {tr.walletBalance}: <span className="font-semibold text-[var(--color-m-text)]">{walletCredits}</span> {tr.creditsUnit}
        </p>
      ) : null}

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-[var(--color-text-muted)]">{tr.checkoutInitialBalance}</dt>
          <dd className="font-medium text-[var(--color-m-text)]">{initialBalance}</dd>
        </div>
        {isPackage ? (
          <>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--color-text-muted)]">{tr.checkoutPackage}</dt>
              <dd className="font-medium text-[var(--color-m-success)]">+{booking.purchased_credits}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--color-text-muted)]">{tr.checkoutConsume}</dt>
              <dd className="font-medium text-[var(--color-m-error)]">−{booking.used_credits}</dd>
            </div>
          </>
        ) : (
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--color-text-muted)]">{tr.checkoutConsume}</dt>
            <dd className="font-medium text-[var(--color-m-error)]">−{booking.used_credits}</dd>
          </div>
        )}
        <div className="flex justify-between gap-4 border-t border-[var(--color-m-card-border)] pt-3">
          <dt className="font-semibold text-[var(--color-m-text)]">{tr.checkoutFinalBalance}</dt>
          <dd className="font-semibold text-[var(--color-m-primary)]">{booking.total_credits}</dd>
        </div>
      </dl>

      <p className="mt-4 rounded-xl bg-[var(--color-m-bg)] p-3 text-xs text-[var(--color-text-muted)]">
        {tr.checkoutDummyNotice}
      </p>
    </section>
  );
}
