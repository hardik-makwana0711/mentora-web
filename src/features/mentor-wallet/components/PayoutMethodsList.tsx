import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useStrings } from '@/constants/strings';
import type { MentorPayoutMethod } from '@/types/mentor-wallet';
import { maskIban } from '@/features/mentor-wallet/lib/wallet-labels';

function MethodRow({
  item,
  onEdit,
  onSetDefault,
  onDeactivate,
  busy,
}: {
  item: MentorPayoutMethod;
  onEdit: () => void;
  onSetDefault: () => void;
  onDeactivate: () => void;
  busy: boolean;
}) {
  const tr = useStrings();
  const ibanDisplay = item.ibanMasked?.trim()
    ? item.ibanMasked
    : item.iban?.trim()
      ? maskIban(item.iban)
      : '';

  const accountLast4 =
    item.accountNumberLast4?.trim() ? item.accountNumberLast4 : item.accountNumber?.trim() ? item.accountNumber.slice(-4) : '';

  return (
    <div className="rounded-2xl border border-[var(--color-m-card-border)] bg-[var(--color-m-surface-light)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-[var(--color-m-text)]">{tr.mentorWalletBankTransfer}</p>
            {item.isDefault ? (
              <Badge className="border-[var(--color-m-card-border)] bg-[var(--color-m-hover-overlay)] text-[var(--color-m-text)]">{tr.mentorWalletDefaultBadge}</Badge>
            ) : null}
            <Badge className="border-[var(--color-m-card-border)] bg-[var(--color-m-hover-overlay)] text-[var(--color-m-text)]">{item.status}</Badge>
          </div>
          <p className="mt-2 text-sm text-[var(--color-m-text-muted)]">
            {item.bankName}
            {ibanDisplay ? ` • ${ibanDisplay}` : ''}
            {accountLast4 ? ` • **** ${accountLast4}` : ''}
          </p>
          <p className="mt-1 text-sm text-[var(--color-m-text-muted)]">{item.accountHolderName}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="secondary" onClick={onEdit} disabled={busy}>
            {tr.edit}
          </Button>
          {!item.isDefault && item.status === 'ACTIVE' ? (
            <Button type="button" size="sm" variant="secondary" onClick={onSetDefault} disabled={busy}>
              {tr.mentorWalletSetDefault}
            </Button>
          ) : null}
          {item.status === 'ACTIVE' ? (
            <Button type="button" size="sm" variant="secondary" onClick={onDeactivate} disabled={busy}>
              {tr.mentorWalletDeactivate}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
    </div>
  );
}

export function PayoutMethodsList({
  items,
  loading,
  error,
  onRetry,
  onAdd,
  onEdit,
  onSetDefault,
  onDeactivate,
  busyId,
}: {
  items: MentorPayoutMethod[];
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  onAdd: () => void;
  onEdit: (id: string) => void;
  onSetDefault: (id: string) => void;
  onDeactivate: (id: string) => void;
  busyId: string | null;
}) {
  const tr = useStrings();
  return (
    <div className="rounded-2xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] p-5 shadow-[var(--shadow-m-card)] ring-1 ring-[var(--color-m-ring-subtle)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[var(--color-m-text)]">{tr.mentorWalletPayoutMethodsTitle}</h2>
          <p className="mt-1 text-sm text-[var(--color-m-text-muted)]">{tr.mentorWalletPayoutMethodsHint}</p>
        </div>
        <Button type="button" size="sm" onClick={onAdd}>
          {tr.mentorWalletAddPayoutMethod}
        </Button>
      </div>

      <div className="mt-4">
        {loading ? (
          <ListSkeleton />
        ) : error ? (
          <ErrorState title={tr.mentorWalletPayoutMethodsLoadError} onRetry={onRetry} />
        ) : items.length === 0 ? (
          <EmptyState
            title={tr.mentorWalletNoPayoutMethodsTitle}
            description={tr.mentorWalletNoPayoutMethodsBody}
            action={
              <Button type="button" variant="primary" size="sm" onClick={onAdd}>
                {tr.mentorWalletAddPayoutMethod}
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {items.map((m) => (
              <MethodRow
                key={m.id}
                item={m}
                busy={busyId === m.id}
                onEdit={() => onEdit(m.id)}
                onSetDefault={() => onSetDefault(m.id)}
                onDeactivate={() => onDeactivate(m.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

