import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { toast } from 'sonner';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BackLink } from '@/components/ui/BackLink';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { CampaignForm } from '@/features/admin/components/CampaignForm';
import { campaignToFormValues } from '@/features/admin/validations/campaign.schemas';
import { adminMarketingService } from '@/services/admin-marketing.service';
import { qk } from '@/constants/query-keys';
import { useStrings } from '@/constants/strings';
import type { CreateSponsoredCampaignPayload } from '@/types/marketing';

function normAxios(e: unknown, fallback: string): string {
  const ax = e as AxiosError & { normalizedMessage?: string };
  return ax.normalizedMessage || ax.message || fallback;
}

export default function AdminMarketingCampaignEditPage() {
  const { id = '' } = useParams();
  const tr = useStrings();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: qk.adminMarketingCampaign(id),
    queryFn: () => adminMarketingService.getCampaign(id),
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: (payload: CreateSponsoredCampaignPayload) =>
      adminMarketingService.updateCampaign(id, payload),
    onSuccess: () => {
      toast.success(tr.marketingCampaignUpdated);
      void qc.invalidateQueries({ queryKey: qk.adminMarketingCampaign(id) });
      void qc.invalidateQueries({ queryKey: ['admin', 'marketing'] });
      navigate(`/admin/marketing/${id}`);
    },
    onError: (e) => toast.error(normAxios(e, tr.actionFailed)),
  });

  if (query.isPending) {
    return (
      <PageContainer width="full">
        <Skeleton className="h-96 w-full rounded-2xl" />
      </PageContainer>
    );
  }

  if (query.isError || !query.data) {
    return (
      <PageContainer width="full">
        <ErrorState title={tr.marketingCampaignLoadError} onRetry={() => void query.refetch()} />
      </PageContainer>
    );
  }

  const campaign = query.data;

  return (
    <PageContainer width="full">
      <BackLink to={`/admin/marketing/${id}`}>{tr.marketingCampaignDetail}</BackLink>
      <PageHeader
        title={tr.marketingEditCampaign}
        description={campaign.internalName}
        actions={
          campaign.status === 'active' ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                void adminMarketingService
                  .updateCampaign(id, { status: 'paused' })
                  .then(() => {
                    toast.success(tr.marketingCampaignPaused);
                    void query.refetch();
                  })
                  .catch((e) => toast.error(normAxios(e, tr.actionFailed)));
              }}
            >
              {tr.marketingPauseBeforeEdit}
            </Button>
          ) : null
        }
      />
      <Card className="p-6 md:p-8">
        <CampaignForm
          initialValues={campaignToFormValues(campaign)}
          submitLabel={tr.saveChanges}
          isSubmitting={mutation.isPending}
          onCancel={() => navigate(`/admin/marketing/${id}`)}
          onSubmit={(payload) => mutation.mutate(payload)}
        />
      </Card>
    </PageContainer>
  );
}
