import { useStrings } from '@/constants/strings';
import { formatWalletMoney } from '@/features/mentor/lib/format-wallet';
import { DashboardPanelCard } from '@/features/dashboard/components/DashboardPanelCard';

type EarningsCardProps = {
  today: number;
  week: number;
  month: number;
  availablePayout?: string | number | null;
  pendingBalance?: string | number | null;
  currency?: string;
};

export function EarningsCard({
  today,
  week,
  month,
  availablePayout,
  pendingBalance,
  currency = 'TRY',
}: EarningsCardProps) {
  const tr = useStrings();
  return (
    <DashboardPanelCard>
      <p className="text-sm font-semibold text-[var(--color-m-text)]">{tr.earningsPlaceholder}</p>
      <dl className="mt-4 grid grid-cols-3 gap-3">
        <div>
          <dt className="text-xs text-[var(--color-text-muted)]">{tr.dashboardEarningsToday}</dt>
          <dd className="mt-1 text-lg font-semibold text-[var(--color-m-text)]">
            {formatWalletMoney(today, currency)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-[var(--color-text-muted)]">{tr.dashboardEarningsWeek}</dt>
          <dd className="mt-1 text-lg font-semibold text-[var(--color-m-text)]">
            {formatWalletMoney(week, currency)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-[var(--color-text-muted)]">{tr.dashboardEarningsMonth}</dt>
          <dd className="mt-1 text-lg font-semibold text-[var(--color-m-text)]">
            {formatWalletMoney(month, currency)}
          </dd>
        </div>
      </dl>
      {availablePayout != null || pendingBalance != null ? (
        <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-[var(--color-m-card-border)] pt-4">
          {availablePayout != null ? (
            <div>
              <dt className="text-xs text-[var(--color-text-muted)]">{tr.dashboardEarningsAvailable}</dt>
              <dd className="mt-1 text-base font-semibold text-[var(--color-m-text)]">
                {formatWalletMoney(availablePayout, currency)}
              </dd>
            </div>
          ) : null}
          {pendingBalance != null ? (
            <div>
              <dt className="text-xs text-[var(--color-text-muted)]">{tr.dashboardEarningsPending}</dt>
              <dd className="mt-1 text-base font-semibold text-[var(--color-m-text)]">
                {formatWalletMoney(pendingBalance, currency)}
              </dd>
            </div>
          ) : null}
        </dl>
      ) : null}
    </DashboardPanelCard>
  );
}
