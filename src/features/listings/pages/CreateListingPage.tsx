import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { toast } from 'sonner';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { ListingsBackButton } from '@/features/listings/components/ListingsBackButton';
import { ListingForm } from '@/features/listings/components/ListingForm';
import { VerificationRestrictedOverlay } from '@/features/listings/components/VerificationRestrictedOverlay';
import { listingsService } from '@/services/listings.service';
import { mentorVerificationService } from '@/services/mentor-verification.service';
import { qk } from '@/constants/query-keys';
import { useStrings } from '@/constants/strings';
import type { ListingFormPayload } from '@/types/listings';

const LISTINGS_PATH = '/mentor/listings';

function normAxios(e: unknown, fallback: string): string {
  const ax = e as AxiosError & { normalizedMessage?: string };
  return ax.normalizedMessage || ax.message || fallback;
}

export default function CreateListingPage() {
  const tr = useStrings();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const verificationQuery = useQuery({
    queryKey: qk.mentorVerification,
    queryFn: () => mentorVerificationService.getStatus(),
  });

  const isRestricted = verificationQuery.data?.mentorAccessStatus === 'restricted';

  const createMutation = useMutation({
    mutationFn: (payload: ListingFormPayload) => listingsService.createListing(payload),
    onSuccess: async () => {
      toast.success(tr.listingSubmittedForReview);
      await qc.invalidateQueries({ queryKey: qk.mentorListings });
      navigate(LISTINGS_PATH, { replace: true });
    },
    onError: (e) => toast.error(normAxios(e, tr.listingCreateError)),
  });

  if (isRestricted) {
    return (
      <PageContainer width="content">
        <PageHeader title={tr.createListingTitle} actions={<ListingsBackButton to={LISTINGS_PATH} />} />
        <VerificationRestrictedOverlay onBack={() => navigate(LISTINGS_PATH)} />
      </PageContainer>
    );
  }

  return (
    <PageContainer width="content">
      <PageHeader
        title={tr.createListingTitle}
        description={tr.createListingDescription}
        actions={<ListingsBackButton to={LISTINGS_PATH} />}
      />
      <Card className="p-6 md:p-8">
        <ListingForm
          submitLabel={tr.createListingSubmit}
          isSubmitting={createMutation.isPending}
          onCancel={() => navigate(LISTINGS_PATH)}
          onSubmit={(payload) => createMutation.mutate(payload)}
        />
      </Card>
    </PageContainer>
  );
}
