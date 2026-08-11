import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { toast } from 'sonner';
import { Plus, RefreshCw } from 'lucide-react';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { ListingCard } from '@/features/listings/components/ListingCard';
import { VerificationRestrictedOverlay } from '@/features/listings/components/VerificationRestrictedOverlay';
import { listingsService } from '@/services/listings.service';
import { mentorVerificationService } from '@/services/mentor-verification.service';
import { qk } from '@/constants/query-keys';
import { useStrings } from '@/constants/strings';
import type { MentorListing } from '@/types/listings';

const LISTINGS_BASE = '/mentor/listings';

function normAxios(e: unknown, fallback: string): string {
  const ax = e as AxiosError & { normalizedMessage?: string };
  return ax.normalizedMessage || ax.message || fallback;
}

export default function MentorListingsPage() {
  const tr = useStrings();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const verificationQuery = useQuery({
    queryKey: qk.mentorVerification,
    queryFn: () => mentorVerificationService.getStatus(),
  });

  const isRestricted = verificationQuery.data?.mentorAccessStatus === 'restricted';

  const listingsQuery = useQuery({
    queryKey: qk.mentorListings,
    queryFn: () => listingsService.fetchMyListings(),
    enabled: !isRestricted,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ listingId, status }: { listingId: string; status: 'active' | 'inactive' }) =>
      listingsService.toggleListingStatus(listingId, { status }),
    onMutate: async ({ listingId, status }) => {
      setTogglingId(listingId);
      await qc.cancelQueries({ queryKey: qk.mentorListings });
      const previous = qc.getQueryData<MentorListing[]>(qk.mentorListings);
      qc.setQueryData<MentorListing[]>(qk.mentorListings, (old) =>
        old?.map((l) => (l.id === listingId ? { ...l, status } : l)) ?? []
      );
      return { previous };
    },
    onError: (e, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(qk.mentorListings, ctx.previous);
      toast.error(normAxios(e, tr.listingStatusUpdateError));
    },
    onSuccess: () => {
      toast.success(tr.availabilityUpdated);
    },
    onSettled: () => {
      setTogglingId(null);
      void qc.invalidateQueries({ queryKey: qk.mentorListings });
    },
  });

  function handleToggle(listing: MentorListing) {
    if (listing.listing_moderation_status === 'hidden_by_admin') {
      toast.error(tr.cannotToggleHiddenListing);
      return;
    }
    const next = listing.status === 'active' ? 'inactive' : 'active';
    toggleMutation.mutate({ listingId: listing.id, status: next });
  }

  if (isRestricted) {
    return (
      <PageContainer>
        <PageHeader title={tr.navMyListings} />
        <VerificationRestrictedOverlay onBack={() => navigate('/mentor/dashboard')} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={tr.navMyListings}
        actions={
          <>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => void listingsQuery.refetch()}
              disabled={listingsQuery.isFetching}
              aria-label={tr.refreshListings}
            >
              <RefreshCw
                className={listingsQuery.isFetching ? 'size-4 animate-spin' : 'size-4'}
                aria-hidden
              />
              {tr.refreshList}
            </Button>
            <Button type="button" size="sm" onClick={() => navigate(`${LISTINGS_BASE}/create`)}>
              <Plus className="size-4" aria-hidden />
              {tr.createNewListing}
            </Button>
          </>
        }
      />

      {listingsQuery.isPending ? (
        <ListingsSkeleton />
      ) : listingsQuery.isError ? (
        <ErrorState title={tr.listingsLoadError} onRetry={() => void listingsQuery.refetch()} />
      ) : !listingsQuery.data?.length ? (
        <EmptyState
          title={tr.listingsEmpty}
          action={
            <Button type="button" onClick={() => navigate(`${LISTINGS_BASE}/create`)}>
              {tr.createNewListing}
            </Button>
          }
        />
      ) : (
        <div className="relative">
          <div
            className="app-scroll-area max-h-[calc(100dvh-240px)] overflow-y-auto pr-2"
            aria-label={tr.navMyListings}
          >
            <ul className="grid gap-4">
              {listingsQuery.data.map((listing) => (
                <li key={listing.id}>
                  <ListingCard
                    listing={listing}
                    listingsBase={LISTINGS_BASE}
                    onToggleStatus={handleToggle}
                    toggleLoading={togglingId === listing.id}
                  />
                </li>
              ))}
            </ul>
          </div>
          {/* subtle fade hint at bottom */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[var(--color-m-bg)] to-transparent" />
        </div>
      )}
    </PageContainer>
  );
}

function ListingsSkeleton() {
  return (
    <div className="grid gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-44 w-full rounded-2xl" />
      ))}
    </div>
  );
}
