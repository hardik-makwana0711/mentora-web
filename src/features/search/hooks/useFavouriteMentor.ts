import { useCallback, useEffect, useState } from 'react';
import type { InfiniteData } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { qk } from '@/constants/query-keys';
import { favouritesService } from '@/services/favourites.service';
import type {
  FavouriteMentorSummary,
  MentorPublicProfileResponse,
  MentorSearchResult,
} from '@/types/search';

function patchMentorSearchFavourite(
  data: InfiniteData<MentorSearchResult> | MentorSearchResult | undefined,
  mentorId: string,
  isFavourited: boolean
): typeof data {
  if (!data) return data;

  if ('pages' in data) {
    return {
      ...data,
      pages: data.pages.map((page) => ({
        ...page,
        items: page.items.map((item) =>
          item.mentor_id === mentorId ? { ...item, is_favourited: isFavourited } : item
        ),
      })),
    };
  }

  return {
    ...data,
    items: data.items.map((item) =>
      item.mentor_id === mentorId ? { ...item, is_favourited: isFavourited } : item
    ),
  };
}

function patchMentorProfileFavourite(
  data: MentorPublicProfileResponse | undefined,
  isFavourited: boolean
): typeof data {
  if (!data?.mentor) return data;
  return {
    ...data,
    mentor: { ...data.mentor, is_favourited: isFavourited },
  };
}

export function useFavouriteMentor(mentorId: string, isFavouritedFromApi: boolean) {
  const queryClient = useQueryClient();
  const [optimistic, setOptimistic] = useState<boolean | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setOptimistic(null);
  }, [isFavouritedFromApi, mentorId]);

  const isFavourited = optimistic ?? isFavouritedFromApi;

  const syncCaches = useCallback(
    (next: boolean) => {
      queryClient.setQueriesData<InfiniteData<MentorSearchResult> | MentorSearchResult>(
        { queryKey: ['search', 'mentors'] },
        (old) => patchMentorSearchFavourite(old, mentorId, next)
      );
      queryClient.setQueryData<MentorPublicProfileResponse>(
        qk.mentorPublicProfile(mentorId),
        (old) => patchMentorProfileFavourite(old, next)
      );
      queryClient.setQueryData<FavouriteMentorSummary[]>(qk.favouriteMentors, (old) => {
        if (!old) return old;
        if (next) {
          const exists = old.some((m) => m.mentor_id === mentorId);
          return exists ? old.map((m) => (m.mentor_id === mentorId ? { ...m, is_favourited: true } : m)) : old;
        }
        return old.filter((m) => m.mentor_id !== mentorId);
      });
    },
    [queryClient, mentorId]
  );

  const invalidateFavouriteQueries = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: qk.favouriteMentors }),
      queryClient.invalidateQueries({ queryKey: ['search', 'mentors'] }),
      queryClient.invalidateQueries({ queryKey: qk.mentorPublicProfile(mentorId) }),
      queryClient.invalidateQueries({ queryKey: ['search', 'listing'] }),
    ]);
  }, [queryClient, mentorId]);

  const toggleFavourite = useCallback(async () => {
    if (isUpdating) return;
    const previous = isFavourited;
    const next = !previous;
    setOptimistic(next);
    setIsUpdating(true);
    setError(null);
    try {
      if (previous) {
        await favouritesService.removeMentor(mentorId);
      } else {
        await favouritesService.addMentor(mentorId);
      }
      syncCaches(next);
      await invalidateFavouriteQueries();
      setOptimistic(null);
    } catch {
      setOptimistic(null);
      setError('failed');
      throw new Error('favourite');
    } finally {
      setIsUpdating(false);
    }
  }, [isFavourited, isUpdating, mentorId, syncCaches, invalidateFavouriteQueries]);

  return { isFavourited, isUpdating, error, toggleFavourite };
}
