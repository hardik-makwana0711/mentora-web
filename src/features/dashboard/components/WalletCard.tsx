import { Plus, Wallet } from 'lucide-react';
import { useStrings } from '@/constants/strings';
import { Button } from '@/components/ui/Button';
import { DashboardPanelCard } from '@/features/dashboard/components/DashboardPanelCard';

type WalletCardProps = {
  creditBalance: number;
  onAddCredits?: () => void;
};

/** Trusted Navy: navy icon tile, big balance, amber "Add credits". */
export function WalletCard({ creditBalance, onAddCredits }: WalletCardProps) {
  const tr = useStrings();
  return (
    <DashboardPanelCard>
      <p className="text-base font-extrabold tracking-[-0.3px] text-[var(--color-m-text)]">
        {tr.wallet}
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-[var(--radius-m-button)] bg-[var(--color-m-primary)]">
            <Wallet className="size-6 text-white" aria-hidden />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.7px] text-[var(--color-m-text-muted)]">
              {tr.walletBalance}
            </p>
            <p className="text-3xl font-extrabold tracking-[-0.5px] text-[var(--color-m-text)]">
              {creditBalance}{' '}
              <span className="text-base font-semibold text-[var(--color-m-text-muted)]">
                {tr.creditUnit}
              </span>
            </p>
          </div>
        </div>
        {onAddCredits ? (
          <Button type="button" size="sm" variant="accent" onClick={onAddCredits}>
            <Plus className="size-4" aria-hidden />
            {tr.dashboardAddCredits}
          </Button>
        ) : null}
      </div>
    </DashboardPanelCard>
  );
}
