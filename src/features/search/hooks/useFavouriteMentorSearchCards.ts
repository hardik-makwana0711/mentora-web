import { useMemo } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { favouritesService } from '@/services/favourites.service';
import { searchService } from '@/services/search.service';
import {
  mapFavouriteToLegacySearchCard,
  mapPublicProfileToSearchCard,
} from '@/features/search/lib/map-mentor-card';
import { qk } from '@/constants/query-keys';
import { isHttpNotFound } from '@/lib/http-errors';
import type { MentorSearchCard } from '@/types/search';

export type FavouriteCardEntry = {
  card: MentorSearchCard;
  unavailable: boolean;
};

export function useFavouriteMentorSearchCards() {
  const favouritesQuery = useQuery({
    queryKey: qk.favouriteMentors,
    queryFn: () => favouritesService.listMentors(),
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const mentorIds = favouritesQuery.data?.map((f) => f.mentor_id) ?? [];

  const profileQueries = useQueries({
    queries: mentorIds.map((mentorId) => ({
      queryKey: qk.mentorPublicProfile(mentorId),
      queryFn: () => searchService.getMentorPublicProfile(mentorId),
      enabled: favouritesQuery.isSuccess,
      staleTime: 60_000,
    })),
  });

  const entries = useMemo((): FavouriteCardEntry[] => {
    const favourites = favouritesQuery.data ?? [];
    return favourites.map((fav, index) => {
      const profileQuery = profileQueries[index];
      const profile = profileQuery?.data;
      const unavailable =
        fav.is_available === false ||
        Boolean(profileQuery?.isError && isHttpNotFound(profileQuery.error));
      if (profile) {
        return { card: mapPublicProfileToSearchCard(profile, fav), unavailable: false };
      }
      return { card: mapFavouriteToLegacySearchCard(fav), unavailable };
    });
  }, [favouritesQuery.data, profileQueries]);

  const cards = entries.map((e) => e.card);

  const profilesLoading =
    favouritesQuery.isSuccess && profileQueries.some((q) => q.isLoading || q.isFetching);

  return {
    entries,
    cards,
    isPending: favouritesQuery.isPending || profilesLoading,
    isError: favouritesQuery.isError,
    refetch: favouritesQuery.refetch,
  };
}
