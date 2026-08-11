import { useState, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Wallet, PlusCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';
import { useStrings } from '@/constants/strings';
import i18n from '@/i18n';
import {
  fetchParentWalletMe,
  fetchParentWalletTransactions,
  parentWalletTopup,
  type ParentWalletTransaction,
} from '@/services/parent-wallet.service';

function txLabel(type: string): string {
  const keyMap: Record<string, string> = {
    DUMMY_TOPUP: 'txDummyTopup',
    CREDIT_PURCHASE: 'txCreditPurchase',
    BONUS_CREDIT: 'txBonusCredit',
    MANUAL_ADJUSTMENT_ADD: 'txManualAdjustmentAdd',
    MANUAL_ADJUSTMENT_REMOVE: 'txManualAdjustmentRemove',
    CREDIT_HOLD: 'txCreditHold',
    CREDIT_RELEASE: 'txCreditRelease',
    CREDIT_SPENT: 'txCreditSpent',
    CREDIT_REFUND: 'txCreditRefund',
    BOOKING_REVERSAL: 'txBookingReversal',
    SYSTEM_CORRECTION: 'txSystemCorrection',
  };
  const key = keyMap[type];
  return key ? i18n.t(key) : i18n.t('txWalletActivity');
}

function txDirection(direction?: string): 'positive' | 'negative' | 'hold' {
  if (direction === 'LOCK') return 'hold';
  if (direction === 'OUT') return 'negative';
  return 'positive';
}

function formatCreditAmount(amount: number, direction?: string): string {
  const n = Math.abs(amount);
  if (direction === 'OUT') return i18n.t('creditAmountNegative', { count: n });
  if (direction === 'LOCK') return i18n.t('creditAmountHeld', { count: n });
  if (direction === 'RELEASE') return i18n.t('creditAmountReturned', { count: n });
  return i18n.t('creditAmountPositive', { count: n });
}

function formatTxDate(iso: string): string {
  try {
    const d = new Date(iso);
    return format(d, 'd MMM') + ' · ' + format(d, 'HH:mm');
  } catch {
    return iso;
  }
}

const DIR_STYLE = {
  positive: { text: '#22C55E', bg: 'rgba(34,197,94,0.094)' },
  negative: { text: '#EF4444', bg: 'rgba(239,68,68,0.094)' },
  hold: { text: '#F59E0B', bg: 'rgba(245,158,11,0.094)' },
};
const DIR_SIGNS = { positive: '+', negative: '−', hold: '⏸' } as const;

function TransactionItem({ item }: { item: ParentWalletTransaction }) {
  const dir = txDirection(item.direction);
  const style = DIR_STYLE[dir];
  const amount = formatCreditAmount(item.amountCredits, item.direction);
  const date = formatTxDate(item.createdAt);
  const label = txLabel(item.type);
  const showStatus = item.status && item.status.toUpperCase() !== 'COMPLETED';

  return (
    <div className="flex items-center gap-3 border-b border-[var(--color-m-card-border)] py-3 last:border-none">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base font-bold"
        style={{ backgroundColor: style.bg, color: style.text }}
      >
        {DIR_SIGNS[dir]}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[var(--color-m-text)]">{label}</p>
        {item.description ? (
          <p className="mt-0.5 truncate text-xs text-[var(--color-m-text-secondary)]">
            {item.description}
          </p>
        ) : null}
        <p className="mt-1 text-[11px] text-[var(--color-m-text-muted)]">{date}</p>
      </div>

      <div className="flex flex-col items-end gap-1">
        <p className="text-sm font-bold" style={{ color: style.text }}>
          {amount}
        </p>
        {showStatus ? (
          <span
            className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            style={{ backgroundColor: style.bg, color: style.text }}
          >
            {item.status.toLowerCase()}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function CreditTopUpForm({
  availableCredits,
  onSuccess,
  onCancel,
}: {
  availableCredits: number;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const tr = useStrings();
  const qc = useQueryClient();
  const [value, setValue] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: (n: number) => parentWalletTopup(n),
    onSuccess: async () => {
      toast.success(tr.parentWalletCreditsAdded);
      await qc.invalidateQueries({ queryKey: ['parent-wallet'] });
      onSuccess();
    },
    onError: () => setValidationError(tr.parentWalletCreditsAddFailed),
  });

  function handleChange(raw: string) {
    setValue(raw.replace(/\D/g, '').slice(0, 4));
    setValidationError(null);
  }

  function handleSubmit() {
    const n = parseInt(value, 10);
    if (!value || isNaN(n)) {
      setValidationError(tr.validationEnterValidAmount);
      return;
    }
    if (n <= 0) {
      setValidationError(tr.validationAmountGreaterThanZero);
      return;
    }
    mutation.mutate(n);
  }

  const creditWord = availableCredits === 1 ? tr.creditUnit : tr.creditsLabel;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-surface-bg)] p-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-m-primary)]/15">
          <Wallet className="size-6 text-[var(--color-m-primary)]" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-m-text-muted)]">
            {tr.parentWalletCurrentBalance}
          </p>
          <p className="mt-0.5 text-xl font-bold text-[var(--color-m-text)]">
            {availableCredits} {creditWord}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <p className="text-base font-bold text-[var(--color-m-text)]">{tr.parentWalletEnterAmount}</p>
        <div
          className={cn(
            'flex h-20 w-full cursor-text items-center justify-center gap-2 rounded-xl border-2 bg-[var(--color-m-card)] px-6',
            validationError
              ? 'border-[var(--color-m-error)]'
              : 'border-[var(--color-m-card-border)] focus-within:border-[var(--color-brand-primary)]',
          )}
          onClick={() => inputRef.current?.focus()}
        >
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="0"
            maxLength={4}
            autoFocus
            className="min-w-0 flex-1 bg-transparent text-center text-4xl font-bold text-[var(--color-m-text)] outline-none placeholder:text-[var(--color-m-text-muted)]"
          />
          <span className="shrink-0 text-lg font-semibold text-[var(--color-m-text-muted)]">
            {tr.creditsLabel}
          </span>
        </div>

        {validationError ? (
          <div className="flex items-center gap-1.5 text-sm text-[var(--color-m-error)]">
            <AlertCircle className="size-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        ) : null}

        <p className="text-center text-sm leading-relaxed text-[var(--color-m-text-muted)]">
          {tr.parentWalletCreditsHelper}
        </p>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={mutation.isPending}
          className="flex-1"
        >
          {tr.cancel}
        </Button>
        <Button type="button" onClick={handleSubmit} isLoading={mutation.isPending} className="flex-[2]">
          <PlusCircle className="mr-2 size-4" />
          {tr.dashboardAddCredits}
        </Button>
      </div>
    </div>
  );
}

export default function ParentWalletPage() {
  const tr = useStrings();
  const [topupOpen, setTopupOpen] = useState(false);
  const [page, setPage] = useState(1);

  const walletQ = useQuery({
    queryKey: ['parent-wallet', 'me'],
    queryFn: fetchParentWalletMe,
  });

  const txQ = useQuery({
    queryKey: ['parent-wallet', 'transactions', page],
    queryFn: () => fetchParentWalletTransactions(page, 20),
  });

  const summary = walletQ.data;
  const availableCredits =
    summary?.availableCredits ?? summary?.credit_balance ?? summary?.balance ?? 0;
  const heldCredits = summary?.heldCredits ?? 0;
  const totalCredits = summary?.totalCredits ?? 0;
  const purchased = summary?.totalPurchasedCredits ?? 0;
  const used = summary?.totalUsedCredits ?? 0;
  const refunded = summary?.totalRefundedCredits ?? 0;
  const bonus = summary?.totalBonusCredits ?? 0;

  const transactions = txQ.data?.items ?? [];
  const totalPages = txQ.data?.pagination
    ? Math.ceil(txQ.data.pagination.total / txQ.data.pagination.limit)
    : 1;

  const summaryStats = [
    { label: tr.parentWalletPurchased, value: purchased },
    { label: tr.parentWalletUsed, value: used },
    { label: tr.parentWalletRefunded, value: refunded },
    { label: tr.parentWalletBonus, value: bonus },
  ];

  return (
    <div>
      <PageHeader title={tr.wallet} description={tr.parentWalletPageDescription} />

      {walletQ.isPending ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Spinner className="size-10 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />
        </div>
      ) : walletQ.isError ? (
        <ErrorState title={tr.parentWalletLoadError} onRetry={() => void walletQ.refetch()} />
      ) : (
        <>
          <Card className="mb-6 p-6">
            <div className="mb-6 border-b border-[var(--color-m-card-border)] pb-6 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-m-text-muted)]">
                {tr.parentWalletAvailableCredits}
              </p>
              <p className="mt-2 text-[56px] font-extrabold leading-tight text-[var(--color-m-primary)]">
                {availableCredits}
              </p>
              <p className="mt-1 text-xs text-[var(--color-m-text-muted)]">
                {tr.parentWalletCreditsReadyToBook}
              </p>
            </div>

            <div className="mb-6 flex">
              <div className="flex flex-1 flex-col items-center gap-0.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-m-text-muted)]">
                  {tr.parentWalletHeld}
                </p>
                <p className="text-2xl font-bold text-yellow-400">{heldCredits}</p>
                <p className="text-[10px] text-[var(--color-m-text-muted)]">{tr.parentWalletForBookings}</p>
              </div>
              <div className="w-px bg-[var(--color-m-card-border)]" />
              <div className="flex flex-1 flex-col items-center gap-0.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-m-text-muted)]">
                  {tr.parentWalletTotal}
                </p>
                <p className="text-2xl font-bold text-[var(--color-m-text)]">{totalCredits}</p>
                <p className="text-[10px] text-[var(--color-m-text-muted)]">
                  {tr.parentWalletAvailablePlusHeld}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-surface-bg)] py-3">
              {summaryStats.map(({ label, value }) => (
                <div key={label} className="flex flex-col items-center gap-1">
                  <p className="text-center text-[10px] font-bold uppercase tracking-[0.04em] text-[var(--color-m-text-muted)]">
                    {label}
                  </p>
                  <p className="text-sm font-bold text-[var(--color-m-text)]">{value}</p>
                </div>
              ))}
            </div>
          </Card>

          <div className="mb-6 flex items-center gap-4 rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] p-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-[var(--color-m-text)]">{tr.dashboardAddCredits}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-[var(--color-m-text-secondary)]">
                {tr.parentWalletAddCreditsCta}
              </p>
            </div>
            <Button type="button" size="sm" onClick={() => setTopupOpen(true)}>
              <PlusCircle className="mr-1.5 size-4" />
              {tr.dashboardAddCredits}
            </Button>
          </div>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-m-text-muted)]">
                {tr.parentWalletCreditActivity}
              </h2>
              <button
                type="button"
                onClick={() => void txQ.refetch()}
                className="text-xs text-[var(--color-brand-primary)] hover:underline"
              >
                {tr.refreshList}
              </button>
            </div>

            <Card className="p-4">
              {txQ.isPending ? (
                <div className="flex justify-center py-8">
                  <Spinner className="size-8 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />
                </div>
              ) : txQ.isError ? (
                <ErrorState title={tr.parentWalletTxLoadError} onRetry={() => void txQ.refetch()} />
              ) : transactions.length === 0 ? (
                <EmptyState
                  title={tr.parentWalletEmptyTitle}
                  description={tr.parentWalletEmptyDescription}
                />
              ) : (
                <>
                  {transactions.map((tx) => (
                    <TransactionItem key={tx.id} item={tx} />
                  ))}

                  {totalPages > 1 && (
                    <div className="mt-4 flex items-center justify-center gap-3 border-t border-[var(--color-m-card-border)] pt-4">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                      >
                        {tr.paginationPrevious}
                      </Button>
                      <span className="text-sm text-[var(--color-m-text-muted)]">
                        {page} / {totalPages}
                      </span>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={page >= totalPages}
                        onClick={() => setPage((p) => p + 1)}
                      >
                        {tr.paginationNext}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </Card>
          </section>
        </>
      )}

      <Modal open={topupOpen} title={tr.dashboardAddCredits} onClose={() => setTopupOpen(false)}>
        <CreditTopUpForm
          availableCredits={availableCredits}
          onSuccess={() => setTopupOpen(false)}
          onCancel={() => setTopupOpen(false)}
        />
      </Modal>
    </div>
  );
}
