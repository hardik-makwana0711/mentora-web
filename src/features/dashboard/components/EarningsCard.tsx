import { TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStrings } from '@/constants/strings';
import { formatWalletMoney } from '@/features/mentor/lib/format-wallet';
import { dashboardCardVariants } from '@/features/dashboard/lib/dashboard-motion';
import { cn } from '@/lib/utils';

type EarningsCardProps = {
  today: number;
  week: number;
  month: number;
  availablePayout?: string | number | null;
  pendingBalance?: string | number | null;
  currency?: string;
};

/** Trusted Navy earnings hero: this month large on navy, the rest as glass tiles. */
export function EarningsCard({
  today,
  week,
  month,
  availablePayout,
  pendingBalance,
  currency = 'TRY',
}: EarningsCardProps) {
  const tr = useStrings();
  const tiles: { label: string; value: string | number }[] = [
    { label: tr.dashboardEarningsToday, value: today },
    { label: tr.dashboardEarningsWeek, value: week },
  ];
  if (availablePayout != null)
    tiles.push({ label: tr.dashboardEarningsAvailable, value: availablePayout });
  if (pendingBalance != null)
    tiles.push({ label: tr.dashboardEarningsPending, value: pendingBalance });

  return (
    <motion.div
      variants={dashboardCardVariants}
      className={cn(
        'relative h-full overflow-hidden rounded-[24px] p-6 text-white',
        'bg-[linear-gradient(135deg,var(--color-m-primary),var(--color-m-primary-dark))]',
        '[[data-theme=dark]_&]:bg-[linear-gradient(135deg,var(--color-m-primary-dark),var(--color-m-primary-soft))]',
        'shadow-[0_18px_40px_-18px_var(--color-m-primary)]'
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-white/10"
      />
      <div className="relative flex items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-[0.8px] text-white/75">
          {tr.earningsPlaceholder}
        </p>
        <span className="flex size-8 items-center justify-center rounded-full bg-[var(--color-m-accent)]">
          <TrendingUp className="size-4 text-[var(--color-m-on-accent)]" aria-hidden />
        </span>
      </div>
      <p className="relative mt-1 text-xs font-semibold text-white/70">
        {tr.dashboardEarningsMonth}
      </p>
      <p className="relative text-[34px] font-extrabold leading-tight tracking-[-1px]">
        {formatWalletMoney(month, currency)}
      </p>
      <dl className={'relative mt-4 grid grid-cols-2 gap-2'}>
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-[14px] bg-white/12 px-3 py-2.5">
            <dt className="text-xs font-semibold text-white/80">{tile.label}</dt>
            <dd className="mt-0.5 text-lg font-extrabold">
              {formatWalletMoney(tile.value, currency)}
            </dd>
          </div>
        ))}
      </dl>
    </motion.div>
  );
}
