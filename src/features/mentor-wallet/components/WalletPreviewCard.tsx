import { Wallet, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatWalletMoney } from '@/features/mentor/lib/format-wallet';
import { useStrings } from '@/constants/strings';

export function WalletPreviewCard({
  availableBalance,
  pendingBalance,
  currency,
  loading,
  error,
  onPress,
  title,
  hint,
}: {
  availableBalance?: string | number;
  pendingBalance?: string | number;
  currency?: string;
  loading?: boolean;
  error?: boolean;
  onPress: () => void;
  title?: string;
  hint?: string;
}) {
  const tr = useStrings();
  const cur = currency || 'TRY';
  const cardTitle = title ?? tr.earningsAndPayouts;
  const cardHint = hint ?? tr.mentorWalletPreviewHint;

  return (
    <button
      type="button"
      onClick={onPress}
      className="group w-full rounded-2xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] p-5 text-left shadow-[var(--shadow-m-card)] ring-1 ring-[var(--color-m-ring-subtle)] transition hover:bg-[var(--color-m-hover-overlay)] active:scale-[0.995]"
      aria-label={cardTitle}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-m-primary)]/15 text-[var(--color-m-primary-light)] ring-1 ring-[var(--color-m-ring-subtle)]">
            <Wallet className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-base font-semibold text-[var(--color-m-text)]">{cardTitle}</p>
            <p className="mt-0.5 text-sm text-[var(--color-m-text-muted)]">
              {error ? tr.mentorWalletPreviewError : cardHint}
            </p>
          </div>
        </div>
        <ChevronRight className="mt-1 size-5 shrink-0 text-[var(--color-m-text-muted)] transition group-hover:text-[var(--color-m-text)]" aria-hidden />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl border border-[var(--color-m-card-border)] bg-[var(--color-m-surface-light)] p-4">
        {loading ? (
          <>
            <div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-2 h-6 w-32" />
            </div>
            <div className="text-right">
              <Skeleton className="ml-auto h-4 w-20" />
              <Skeleton className="ml-auto mt-2 h-6 w-24" />
            </div>
          </>
        ) : (
          <>
            <div className="min-w-0">
              <p className="text-xs text-[var(--color-m-text-muted)]">{tr.earningsAvailablePayout}</p>
              <p className="mt-1 truncate text-lg font-bold text-[var(--color-m-text)]">
                {formatWalletMoney(availableBalance, cur)}
              </p>
            </div>
            <div className="min-w-0 text-right">
              <p className="text-xs text-[var(--color-m-text-muted)]">{tr.earningsPending}</p>
              <p className="mt-1 truncate text-lg font-bold text-[var(--color-m-text)]">
                {formatWalletMoney(pendingBalance, cur)}
              </p>
            </div>
          </>
        )}
      </div>
    </button>
  );
}

