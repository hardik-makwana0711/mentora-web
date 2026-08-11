import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { toast } from 'sonner';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { ListingsBackButton } from '@/features/listings/components/ListingsBackButton';
import { ListingForm } from '@/features/listings/components/ListingForm';
import { VerificationRestrictedOverlay } from '@/features/listings/components/VerificationRestrictedOverlay';
import { listingsService } from '@/services/listings.service';
import { mentorVerificationService } from '@/services/mentor-verification.service';
import { qk } from '@/constants/query-keys';
import { useStrings } from '@/constants/strings';
import type { ListingFormPayload, ListingGradeLevel, ListingLessonFormat } from '@/types/listings';
import type { ListingFormValues } from '@/features/listings/validations/listings.schemas';

const LISTINGS_PATH = '/mentor/listings';

function normAxios(e: unknown, fallback: string): string {
  const ax = e as AxiosError & { normalizedMessage?: string };
  return ax.normalizedMessage || ax.message || fallback;
}

const ALLOWED_GRADES = new Set(['primary', 'middle_school', 'high_school']);

export default function EditListingPage() {
  const tr = useStrings();
  const { listingId } = useParams<{ listingId: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const verificationQuery = useQuery({
    queryKey: qk.mentorVerification,
    queryFn: () => mentorVerificationService.getStatus(),
  });

  const isRestricted = verificationQuery.data?.mentorAccessStatus === 'restricted';

  const listingQuery = useQuery({
    queryKey: listingId ? qk.mentorListing(listingId) : ['mentor', 'listing', 'missing'],
    queryFn: () => listingsService.fetchListingById(listingId!),
    enabled: Boolean(listingId) && !isRestricted,
    retry: false,
  });

  const initialValues = useMemo((): Partial<ListingFormValues> | undefined => {
    const listing = listingQuery.data;
    if (!listing) return undefined;
    return {
      subject: listing.subject as ListingFormValues['subject'],
      grade_levels: listing.grade_levels.filter((g) =>
        ALLOWED_GRADES.has(g)
      ) as ListingGradeLevel[],
      lesson_format: listing.lesson_format as ListingLessonFormat,
      description: listing.description,
    };
  }, [listingQuery.data]);

  const updateMutation = useMutation({
    mutationFn: (payload: ListingFormPayload) =>
      listingsService.updateListing(listingId!, payload),
    onSuccess: async (_data, payload) => {
      const original = listingQuery.data;
      const descriptionOnly =
        original &&
        payload.description !== original.description &&
        payload.subject === original.subject &&
        JSON.stringify(payload.grade_levels) === JSON.stringify(original.grade_levels) &&
        payload.lesson_format === original.lesson_format;

      toast.success(
        descriptionOnly ? tr.listingDescriptionSentForReview : tr.listingUpdatedNoReview
      );
      await qc.invalidateQueries({ queryKey: qk.mentorListings });
      if (listingId) await qc.invalidateQueries({ queryKey: qk.mentorListing(listingId) });
      navigate(LISTINGS_PATH, { replace: true });
    },
    onError: (e) => toast.error(normAxios(e, tr.listingUpdateError)),
  });

  if (!listingId) {
    return (
      <ErrorState
        title={tr.listingNotFound}
        onRetry={() => navigate(LISTINGS_PATH)}
      />
    );
  }

  if (isRestricted) {
    return (
      <PageContainer width="content">
        <PageHeader title={tr.editListingTitle} actions={<ListingsBackButton to={LISTINGS_PATH} />} />
        <VerificationRestrictedOverlay onBack={() => navigate(LISTINGS_PATH)} />
      </PageContainer>
    );
  }

  if (listingQuery.isPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-10 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />
      </div>
    );
  }

  if (listingQuery.isError || !listingQuery.data) {
    const status = (listingQuery.error as AxiosError | undefined)?.response?.status;
    return (
      <ErrorState
        title={status === 404 ? tr.listingNotFound : tr.listingsLoadError}
        description={normAxios(listingQuery.error, tr.listingUpdateError)}
        onRetry={() => (status === 404 ? navigate(LISTINGS_PATH) : void listingQuery.refetch())}
      />
    );
  }

  return (
    <PageContainer width="content">
      <PageHeader
        title={tr.editListingTitle}
        description={tr.editListingDescription}
        actions={<ListingsBackButton to={LISTINGS_PATH} />}
      />
      <Card className="p-6 md:p-8">
        <ListingForm
          key={listingQuery.data.id}
          initialValues={initialValues}
          submitLabel={tr.saveListingChanges}
          isSubmitting={updateMutation.isPending}
          onCancel={() => navigate(LISTINGS_PATH)}
          onSubmit={(payload) => updateMutation.mutate(payload)}
        />
      </Card>
    </PageContainer>
  );
}
