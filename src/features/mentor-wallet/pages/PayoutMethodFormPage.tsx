import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { useStrings } from '@/constants/strings';
import { qk } from '@/constants/query-keys';
import {
  createMentorWalletPayoutMethod,
  fetchMentorWalletPayoutMethods,
  updateMentorWalletPayoutMethod,
} from '@/services/mentor-wallet.service';
import { PayoutMethodForm } from '@/features/mentor-wallet/components/PayoutMethodForm';
import { WalletBackButton } from '@/features/mentor-wallet/components/WalletBackButton';
import type { MentorPayoutMethod } from '@/types/mentor-wallet';

function unwrapMethods(data: { items: MentorPayoutMethod[] } | MentorPayoutMethod[] | undefined): MentorPayoutMethod[] {
  if (!data) return [];
  return Array.isArray(data) ? data : data.items || [];
}

export default function PayoutMethodFormPage() {
  const tr = useStrings();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const params = useParams();
  const payoutMethodId = params.payoutMethodId;
  const isEdit = Boolean(payoutMethodId);
  const [apiError, setApiError] = useState<string | null>(null);

  const methodsQuery = useQuery({
    queryKey: qk.mentorWalletPayoutMethods,
    queryFn: fetchMentorWalletPayoutMethods,
    enabled: isEdit,
  });

  const initial = useMemo(() => {
    if (!isEdit) return undefined;
    const items = unwrapMethods(methodsQuery.data);
    return items.find((m) => m.id === payoutMethodId);
  }, [isEdit, methodsQuery.data, payoutMethodId]);

  const mutation = useMutation({
    mutationFn: async (values: {
      accountHolderName: string;
      iban: string;
      bankName: string;
      branchName?: string;
      accountNumber?: string;
    }) => {
      setApiError(null);
      if (isEdit && payoutMethodId) {
        return updateMentorWalletPayoutMethod(payoutMethodId, values);
      }
      return createMentorWalletPayoutMethod({ methodType: 'BANK_TRANSFER', ...values });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: qk.mentorWalletPayoutMethods });
      navigate('/mentor/wallet/payout-methods', { replace: true });
    },
    onError: (e: unknown) => {
      const anyErr = e as { normalizedMessage?: string; message?: string };
      setApiError(anyErr.normalizedMessage || anyErr.message || tr.errorTitle);
    },
  });

  return (
    <PageContainer width="content">
      <PageHeader
        title={isEdit ? tr.mentorWalletEditPayoutMethodTitle : tr.mentorWalletAddPayoutMethodTitle}
        description={tr.mentorWalletPayoutMethodFormDescription}
        actions={<WalletBackButton to="/mentor/wallet/payout-methods" />}
      />

      <div className="mt-6 rounded-2xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] p-5 shadow-[var(--shadow-m-card)] ring-1 ring-[var(--color-m-ring-subtle)]">
        <PayoutMethodForm
          initial={initial}
          busy={mutation.isPending}
          apiError={apiError}
          onSubmit={(v) => mutation.mutate(v)}
        />
      </div>
    </PageContainer>
  );
}

