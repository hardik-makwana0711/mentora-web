import { useQuery } from '@tanstack/react-query';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { MentorWalletSummaryCard } from '@/features/mentor/components/MentorWalletSummaryCard';
import { useStrings } from '@/constants/strings';
import { qk } from '@/constants/query-keys';
import { fetchMentorWalletMe } from '@/services/mentor-wallet.service';

export default function MentorEarningsPage() {
  const tr = useStrings();
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: qk.mentorWalletMe,
    queryFn: fetchMentorWalletMe,
  });

  if (isPending) {
    return (
      <PageContainer width="content">
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner className="size-10 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />
        </div>
      </PageContainer>
    );
  }

  if (isError || !data?.wallet) {
    return (
      <PageContainer width="content">
        <PageHeader title={tr.navEarnings} description={tr.earningsPageDescription} />
        <ErrorState title={tr.earningsLoadError} onRetry={() => void refetch()} />
      </PageContainer>
    );
  }

  return (
    <PageContainer width="content">
      <PageHeader title={tr.navEarnings} description={tr.earningsPageDescription} />
      <MentorWalletSummaryCard wallet={data.wallet} />
    </PageContainer>
  );
}
