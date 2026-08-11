import { useMemo, useState } from 'react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { useStrings } from '@/constants/strings';
import { qk } from '@/constants/query-keys';
import {
  createMentorWalletPayoutRequest,
  fetchMentorWalletMe,
  fetchMentorWalletPayoutMethods,
  fetchMentorWalletPayoutRequests,
  fetchMentorWalletTransactions,
} from '@/services/mentor-wallet.service';
import { MentorWalletSummarySection } from '@/features/mentor-wallet/components/MentorWalletSummarySection';
import { PayoutActionSection } from '@/features/mentor-wallet/components/PayoutActionSection';
import { PayoutRequestsList } from '@/features/mentor-wallet/components/PayoutRequestsList';
import { WalletTransactionsList } from '@/features/mentor-wallet/components/WalletTransactionsList';
import { PayoutRequestModal } from '@/features/mentor-wallet/components/PayoutRequestModal';
import { WalletBackButton } from '@/features/mentor-wallet/components/WalletBackButton';
import type { MentorPayoutMethod, MentorPayoutRequest, MentorWalletTransaction } from '@/types/mentor-wallet';

function unwrapMethods(data: { items: MentorPayoutMethod[] } | MentorPayoutMethod[] | undefined): MentorPayoutMethod[] {
  if (!data) return [];
  return Array.isArray(data) ? data : data.items || [];
}

export default function MentorWalletPage() {
  const tr = useStrings();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  const walletQuery = useQuery({
    queryKey: qk.mentorWalletMe,
    queryFn: fetchMentorWalletMe,
  });

  const payoutMethodsQuery = useQuery({
    queryKey: qk.mentorWalletPayoutMethods,
    queryFn: fetchMentorWalletPayoutMethods,
  });

  const payoutRequestsQuery = useInfiniteQuery({
    queryKey: qk.mentorWalletPayoutRequests({ limit: 10 }),
    queryFn: ({ pageParam }) => fetchMentorWalletPayoutRequests({ page: pageParam as number, limit: 10 }),
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const { page, limit, total } = last.pagination;
      return page * limit < total ? page + 1 : undefined;
    },
  });

  const transactionsQuery = useInfiniteQuery({
    queryKey: qk.mentorWalletTransactions({ limit: 10 }),
    queryFn: ({ pageParam }) => fetchMentorWalletTransactions({ page: pageParam as number, limit: 10 }),
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const { page, limit, total } = last.pagination;
      return page * limit < total ? page + 1 : undefined;
    },
  });

  const payoutRequestMutation = useMutation({
    mutationFn: async (values: { amount: number; payoutMethodId?: string }) => {
      setRequestError(null);
      const data = await createMentorWalletPayoutRequest({
        amount: values.amount,
        payoutMethodId: values.payoutMethodId,
        idempotencyKey: `web:${crypto.randomUUID?.() ?? String(Date.now())}`,
      });
      const item = (data as { item?: MentorPayoutRequest }).item;
      return item ?? (data as MentorPayoutRequest);
    },
    onSuccess: async () => {
      setRequestOpen(false);
      await Promise.all([
        qc.invalidateQueries({ queryKey: qk.mentorWalletMe }),
        qc.invalidateQueries({ queryKey: qk.mentorWalletPayoutRequests({ limit: 10 }) }),
        qc.invalidateQueries({ queryKey: qk.mentorWalletTransactions({ limit: 10 }) }),
      ]);
    },
    onError: (e: unknown) => {
      const anyErr = e as { normalizedMessage?: string; message?: string };
      setRequestError(anyErr.normalizedMessage || anyErr.message || tr.errorTitle);
    },
  });

  const wallet = walletQuery.data?.wallet;
  const payoutMethods = unwrapMethods(payoutMethodsQuery.data);
  const activeMethods = useMemo(() => payoutMethods.filter((m) => m.status === 'ACTIVE'), [payoutMethods]);

  const payoutRequests: MentorPayoutRequest[] =
    payoutRequestsQuery.data?.pages.flatMap((p) => p.items) ?? [];
  const transactions: MentorWalletTransaction[] =
    transactionsQuery.data?.pages.flatMap((p) => p.items) ?? [];

  const canRequestPayout = Boolean(activeMethods.length > 0);
  const requestDisabledReason = !canRequestPayout ? tr.mentorWalletNoPayoutMethodBlocker : undefined;

  return (
    <PageContainer width="content">
      <PageHeader
        title={tr.wallet}
        description={tr.mentorWalletPageDescription}
        actions={<WalletBackButton to="/mentor/profile" />}
      />

      {wallet ? (
        <div className="mt-6 space-y-6">
          <MentorWalletSummarySection wallet={wallet} />

          <PayoutActionSection
            onRequestPayout={() => {
              if (!canRequestPayout) {
                navigate('/mentor/wallet/payout-methods');
                return;
              }
              setRequestOpen(true);
            }}
            onManageMethods={() => navigate('/mentor/wallet/payout-methods')}
            requestDisabled={!canRequestPayout}
            requestDisabledReason={requestDisabledReason}
          />

          <PayoutRequestsList
            title={tr.mentorWalletPayoutRequestsTitle}
            items={payoutRequests}
            loading={payoutRequestsQuery.isPending}
            error={payoutRequestsQuery.isError}
            onRetry={() => void payoutRequestsQuery.refetch()}
            onLoadMore={() => void payoutRequestsQuery.fetchNextPage()}
            hasMore={Boolean(payoutRequestsQuery.hasNextPage)}
            loadingMore={payoutRequestsQuery.isFetchingNextPage}
          />

          <WalletTransactionsList
            title={tr.mentorWalletTransactionsTitle}
            items={transactions}
            loading={transactionsQuery.isPending}
            error={transactionsQuery.isError}
            onRetry={() => void transactionsQuery.refetch()}
            onLoadMore={() => void transactionsQuery.fetchNextPage()}
            hasMore={Boolean(transactionsQuery.hasNextPage)}
            loadingMore={transactionsQuery.isFetchingNextPage}
          />
        </div>
      ) : walletQuery.isError ? (
        <div className="mt-6">
          {/* Reuse global error component */}
          <div className="rounded-2xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] p-5">
            <p className="text-base font-semibold text-[var(--color-m-text)]">{tr.mentorWalletLoadErrorTitle}</p>
            <p className="mt-1 text-sm text-[var(--color-m-text-muted)]">{tr.mentorWalletLoadErrorBody}</p>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => void walletQuery.refetch()}
                className="rounded-xl bg-[var(--color-m-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-m-text)]"
              >
                {tr.retry}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <div className="rounded-2xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] p-5">
            <p className="text-sm text-[var(--color-m-text-muted)]">{tr.loading}</p>
          </div>
        </div>
      )}

      {wallet ? (
        <PayoutRequestModal
          open={requestOpen}
          onClose={() => setRequestOpen(false)}
          wallet={wallet}
          payoutMethods={activeMethods}
          busy={payoutRequestMutation.isPending}
          apiError={requestError}
          onSubmit={(v) => payoutRequestMutation.mutate(v)}
        />
      ) : null}
    </PageContainer>
  );
}

