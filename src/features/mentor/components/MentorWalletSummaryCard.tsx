import { Badge } from '@/components/ui/Badge';
import { formatWalletMoney } from '@/features/mentor/lib/format-wallet';
import { useStrings } from '@/constants/strings';
import type { MentorWalletSummary } from '@/types/mentor-wallet';

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-1 flex-col items-center px-2 text-center">
      <p className="text-xs text-white/75">{label}</p>
      <p className="mt-1 text-sm font-bold text-white">{value}</p>
    </div>
  );
}

export function MentorWalletSummaryCard({ wallet }: { wallet: MentorWalletSummary }) {
  const tr = useStrings();
  const currency = wallet.currency || 'TRY';

  return (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--color-m-primary)] to-[var(--color-m-gradient-end)] p-6 text-white shadow-[var(--shadow-m-glow)] ring-1 ring-[var(--color-m-ring-subtle)]">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div className="text-center sm:text-left">
          <p className="text-sm text-white/80">{tr.earningsAvailablePayout}</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-white">
            {formatWalletMoney(wallet.availableBalance, currency)}
          </p>
        </div>
        <Badge className="shrink-0 border-white/25 bg-white/15 text-white">{wallet.status}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-5 sm:grid-cols-4">
        <StatCell label={tr.earningsPending} value={formatWalletMoney(wallet.pendingBalance, currency)} />
        <StatCell label={tr.earningsTotalEarned} value={formatWalletMoney(wallet.totalEarned, currency)} />
        <StatCell label={tr.earningsTotalPaidOut} value={formatWalletMoney(wallet.totalPaidOut, currency)} />
        <StatCell label={tr.earningsTotalBalance} value={formatWalletMoney(wallet.totalBalance, currency)} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 border-t border-white/20 pt-4">
        <StatCell label={tr.earningsTotalBonuses} value={formatWalletMoney(wallet.totalBonuses, currency)} />
        <StatCell label={tr.earningsTotalReversed} value={formatWalletMoney(wallet.totalReversed, currency)} />
      </div>
    </div>
  );
}
