import { Button } from '@/components/ui/Button';
import { useStrings } from '@/constants/strings';

export function PayoutActionSection({
  onRequestPayout,
  onManageMethods,
  requestDisabled,
  requestDisabledReason,
}: {
  onRequestPayout: () => void;
  onManageMethods: () => void;
  requestDisabled?: boolean;
  requestDisabledReason?: string;
}) {
  const tr = useStrings();
  return (
    <div className="rounded-2xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] p-5 shadow-[var(--shadow-m-card)] ring-1 ring-[var(--color-m-ring-subtle)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-base font-semibold text-[var(--color-m-text)]">{tr.mentorWalletPayoutActionsTitle}</p>
          <p className="mt-1 text-sm text-[var(--color-m-text-muted)]">{tr.mentorWalletPayoutActionsHint}</p>
          {requestDisabled && requestDisabledReason ? (
            <p className="mt-2 text-sm text-[var(--color-m-error)]">{requestDisabledReason}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="button" onClick={onRequestPayout} disabled={Boolean(requestDisabled)}>
            {tr.mentorWalletRequestPayout}
          </Button>
          <Button type="button" variant="secondary" onClick={onManageMethods}>
            {tr.mentorWalletManagePayoutMethods}
          </Button>
        </div>
      </div>
    </div>
  );
}

