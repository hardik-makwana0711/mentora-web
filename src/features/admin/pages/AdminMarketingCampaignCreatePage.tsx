import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { toast } from 'sonner';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { BackLink } from '@/components/ui/BackLink';
import { CampaignForm } from '@/features/admin/components/CampaignForm';
import { adminMarketingService } from '@/services/admin-marketing.service';
import { useStrings } from '@/constants/strings';
import type { CreateSponsoredCampaignPayload } from '@/types/marketing';

function normAxios(e: unknown, fallback: string): string {
  const ax = e as AxiosError & { normalizedMessage?: string };
  return ax.normalizedMessage || ax.message || fallback;
}

export default function AdminMarketingCampaignCreatePage() {
  const tr = useStrings();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: CreateSponsoredCampaignPayload) => adminMarketingService.createCampaign(payload),
    onSuccess: (campaign) => {
      toast.success(tr.marketingCampaignCreated);
      void qc.invalidateQueries({ queryKey: ['admin', 'marketing'] });
      navigate(`/admin/marketing/${campaign.id}`, { replace: true });
    },
    onError: (e) => toast.error(normAxios(e, tr.actionFailed)),
  });

  return (
    <PageContainer width="full">
      <BackLink to="/admin/marketing">{tr.adminNavMarketing}</BackLink>
      <PageHeader title={tr.marketingCreateCampaign} description={tr.marketingCreateSubtitle} />
      <Card className="p-6 md:p-8">
        <CampaignForm
          submitLabel={tr.marketingCreateCampaign}
          isSubmitting={mutation.isPending}
          onCancel={() => navigate('/admin/marketing')}
          onSubmit={(payload) => mutation.mutate(payload)}
        />
      </Card>
    </PageContainer>
  );
}
