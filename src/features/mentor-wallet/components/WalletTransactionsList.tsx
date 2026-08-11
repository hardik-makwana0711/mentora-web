import { format } from 'date-fns';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useStrings } from '@/constants/strings';
import { formatWalletMoney } from '@/features/mentor/lib/format-wallet';
import type { MentorWalletTransaction } from '@/types/mentor-wallet';
import { transactionTypeLabel } from '@/features/mentor-wallet/lib/wallet-labels';

function fmtDate(iso?: string): string {
  if (!iso) return '—';
  try {
    return format(new Date(iso), 'PP');
  } catch {
    return '—';
  }
}

function Row({ item }: { item: MentorWalletTransaction }) {
  const label = transactionTypeLabel(item.type);
  const sign = item.direction === 'IN' ? '+' : item.direction === 'OUT' ? '-' : '';
  const amount = formatWalletMoney(item.amount, item.currency);
  return (
    <div className="rounded-2xl border border-[var(--color-m-card-border)] bg-[var(--color-m-surface-light)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--color-m-text)]">
            {label}
            {item.description?.trim() ? (
              <span className="ml-2 text-xs font-normal text-[var(--color-m-text-muted)]">{item.description}</span>
            ) : null}
          </p>
          <p className="mt-1 text-xs text-[var(--color-m-text-muted)]">{fmtDate(item.createdAt)}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-semibold text-[var(--color-m-text)]">
            {sign}
            {amount}
          </p>
          <Badge className="mt-2 border-[var(--color-m-card-border)] bg-[var(--color-m-hover-overlay)] text-[var(--color-m-text)]">{item.status}</Badge>
        </div>
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-20 w-full rounded-2xl" />
      <Skeleton className="h-20 w-full rounded-2xl" />
      <Skeleton className="h-20 w-full rounded-2xl" />
    </div>
  );
}

export function WalletTransactionsList({
  title,
  items,
  loading,
  error,
  onRetry,
  onLoadMore,
  hasMore,
  loadingMore,
}: {
  title: string;
  items: MentorWalletTransaction[];
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  onLoadMore: () => void;
  hasMore: boolean;
  loadingMore: boolean;
}) {
  const tr = useStrings();
  return (
    <section className="rounded-2xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] p-5 shadow-[var(--shadow-m-card)] ring-1 ring-[var(--color-m-ring-subtle)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-[var(--color-m-text)]">{title}</h2>
      </div>

      <div className="mt-4">
        {loading ? (
          <ListSkeleton />
        ) : error ? (
          <ErrorState title={tr.mentorWalletTransactionsLoadError} onRetry={onRetry} />
        ) : items.length === 0 ? (
          <EmptyState title={tr.mentorWalletNoTransactionsTitle} description={tr.mentorWalletNoTransactionsBody} />
        ) : (
          <>
            <div className="relative">
              <div className="app-scroll-area max-h-[360px] overflow-y-auto pr-2">
                <div className="space-y-3">
                  {items.map((it) => (
                    <Row key={it.id} item={it} />
                  ))}
                </div>
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[var(--color-m-card)] to-transparent" />
            </div>
            {hasMore ? (
              <div className="flex justify-center pt-5">
                <Button type="button" variant="secondary" size="sm" isLoading={loadingMore} onClick={onLoadMore}>
                  {tr.loadMore}
                </Button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}

