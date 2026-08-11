import { Badge } from '@/components/ui/Badge';
import { formatWalletMoney } from '@/features/mentor/lib/format-wallet';
import { useStrings } from '@/constants/strings';
import type { MentorWalletSummary } from '@/types/mentor-wallet';

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--color-m-card-border)] bg-[var(--color-m-surface-light)] p-4">
      <p className="text-xs text-[var(--color-m-text-muted)]">{label}</p>
      <p className="mt-1 text-lg font-bold text-[var(--color-m-text)]">{value}</p>
    </div>
  );
}

export function MentorWalletSummarySection({ wallet }: { wallet: MentorWalletSummary }) {
  const tr = useStrings();
  const currency = wallet.currency || 'TRY';
  return (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--color-m-primary)]/70 to-[var(--color-m-gradient-end)]/60 p-6 text-white shadow-[var(--shadow-m-glow)] ring-1 ring-[var(--color-m-ring-subtle)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-white/80">{tr.earningsAvailablePayout}</p>
          <p className="mt-1 truncate text-4xl font-extrabold tracking-tight text-white">
            {formatWalletMoney(wallet.availableBalance, currency)}
          </p>
          <p className="mt-1 text-sm text-white/70">
            {tr.mentorWalletPendingInline}: {formatWalletMoney(wallet.pendingBalance, currency)}
          </p>
        </div>
        <Badge className="shrink-0 border-white/25 bg-white/15 text-white">{wallet.status}</Badge>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Stat label={tr.earningsTotalBalance} value={formatWalletMoney(wallet.totalBalance, currency)} />
        <Stat label={tr.earningsTotalEarned} value={formatWalletMoney(wallet.totalEarned, currency)} />
        <Stat label={tr.earningsTotalPaidOut} value={formatWalletMoney(wallet.totalPaidOut, currency)} />
        <Stat label={tr.earningsTotalReversed} value={formatWalletMoney(wallet.totalReversed, currency)} />
        <Stat label={tr.earningsTotalBonuses} value={formatWalletMoney(wallet.totalBonuses, currency)} />
        <Stat label={tr.earningsPending} value={formatWalletMoney(wallet.pendingBalance, currency)} />
      </div>
    </div>
  );
}

