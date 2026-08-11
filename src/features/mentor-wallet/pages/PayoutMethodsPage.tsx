import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { useStrings } from '@/constants/strings';
import { qk } from '@/constants/query-keys';
import {
  deactivateMentorWalletPayoutMethod,
  fetchMentorWalletPayoutMethods,
  setDefaultMentorWalletPayoutMethod,
} from '@/services/mentor-wallet.service';
import { PayoutMethodsList } from '@/features/mentor-wallet/components/PayoutMethodsList';
import { WalletBackButton } from '@/features/mentor-wallet/components/WalletBackButton';
import type { MentorPayoutMethod } from '@/types/mentor-wallet';

function unwrapMethods(data: { items: MentorPayoutMethod[] } | MentorPayoutMethod[] | undefined): MentorPayoutMethod[] {
  if (!data) return [];
  return Array.isArray(data) ? data : data.items || [];
}

export default function PayoutMethodsPage() {
  const tr = useStrings();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [busyId, setBusyId] = useState<string | null>(null);

  const methodsQuery = useQuery({
    queryKey: qk.mentorWalletPayoutMethods,
    queryFn: fetchMentorWalletPayoutMethods,
  });

  const methods = useMemo(() => unwrapMethods(methodsQuery.data), [methodsQuery.data]);

  const setDefaultMutation = useMutation({
    mutationFn: async (id: string) => {
      setBusyId(id);
      await setDefaultMentorWalletPayoutMethod(id);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: qk.mentorWalletPayoutMethods });
    },
    onSettled: () => setBusyId(null),
  });

  const deactivateMutation = useMutation({
    mutationFn: async (id: string) => {
      setBusyId(id);
      await deactivateMentorWalletPayoutMethod(id);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: qk.mentorWalletPayoutMethods });
    },
    onSettled: () => setBusyId(null),
  });

  return (
    <PageContainer width="content">
      <PageHeader
        title={tr.mentorWalletPayoutMethodsTitle}
        description={tr.mentorWalletPayoutMethodsPageDescription}
        actions={<WalletBackButton to="/mentor/wallet" />}
      />

      <div className="mt-6">
        <PayoutMethodsList
          items={methods}
          loading={methodsQuery.isPending}
          error={methodsQuery.isError}
          onRetry={() => void methodsQuery.refetch()}
          onAdd={() => navigate('/mentor/wallet/payout-methods/new')}
          onEdit={(id) => navigate(`/mentor/wallet/payout-methods/${id}/edit`)}
          onSetDefault={(id) => setDefaultMutation.mutate(id)}
          onDeactivate={(id) => deactivateMutation.mutate(id)}
          busyId={busyId}
        />
      </div>
    </PageContainer>
  );
}

