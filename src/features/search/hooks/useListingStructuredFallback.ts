import { useQuery } from '@tanstack/react-query';
import { searchService } from '@/services/search.service';
import { qk } from '@/constants/query-keys';
import type { ListingStructuredInfo } from '@/types/education';

export function useListingStructuredFallback(
  listingId: string,
  mentorId: string,
  structuredFromState?: ListingStructuredInfo | null
) {
  const needsFallback = Boolean(listingId && mentorId && !structuredFromState);

  const profileQuery = useQuery({
    queryKey: qk.mentorPublicProfile(mentorId),
    queryFn: () => searchService.getMentorPublicProfile(mentorId),
    enabled: needsFallback,
    staleTime: 60_000,
  });

  const structured =
    structuredFromState ??
    profileQuery.data?.listings.find((l) => l.id === listingId)?.structured ??
    null;

  return {
    structured,
    isResolvingStructured: needsFallback && profileQuery.isPending,
    profileMentor: profileQuery.data?.mentor,
  };
}
