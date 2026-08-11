import { Plus, Wallet } from 'lucide-react';
import { useStrings } from '@/constants/strings';
import { Button } from '@/components/ui/Button';
import { DashboardPanelCard } from '@/features/dashboard/components/DashboardPanelCard';

type WalletCardProps = {
  creditBalance: number;
  onAddCredits?: () => void;
};

export function WalletCard({ creditBalance, onAddCredits }: WalletCardProps) {
  const tr = useStrings();
  return (
    <DashboardPanelCard>
      <p className="text-sm text-[var(--color-text-muted)]">{tr.wallet}</p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-xl border border-[var(--color-brand-primary)]/30 bg-[var(--color-brand-primary)]/10">
            <Wallet className="size-6 text-[var(--color-brand-primary)]" aria-hidden />
          </div>
          <div>
            <p className="text-sm text-[var(--color-text-muted)]">{tr.walletBalance}</p>
            <p className="text-3xl font-bold text-[var(--color-m-text)]">
              {creditBalance}{' '}
              <span className="text-base font-medium text-[var(--color-text-muted)]">{tr.creditUnit}</span>
            </p>
          </div>
        </div>
        {onAddCredits ? (
          <Button type="button" size="sm" variant="primary" onClick={onAddCredits}>
            <Plus className="size-4" aria-hidden />
            {tr.dashboardAddCredits}
          </Button>
        ) : null}
      </div>
    </DashboardPanelCard>
  );
}
