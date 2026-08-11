import { useCallback, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { discoveryService } from '@/services/discovery.service';
import { qk } from '@/constants/query-keys';
import type { DiscoveryFilters, DiscoveryMentorCard } from '@/types/discovery';

function hasActiveDiscoveryFilters(filters: DiscoveryFilters): boolean {
  return Boolean(
    filters.subject ||
      filters.exam_type ||
      filters.grade_level ||
      filters.teaching_format ||
      filters.min_rating ||
      filters.tags
  );
}

type FeedSource = 'feed' | 'recommended' | 'include_seen';

export function useDiscoveryFeed(filters: DiscoveryFilters) {
  const qc = useQueryClient();
  const [stack, setStack] = useState<DiscoveryMentorCard[]>([]);
  const pageRef = useRef(1);
  const loadingMoreRef = useRef(false);
  const filtersKey = JSON.stringify(filters);

  const query = useQuery({
    queryKey: qk.discoveryFeed({ ...filters, stackKey: filtersKey }),
    queryFn: async () => {
      pageRef.current = 1;
      const res = await discoveryService.getFeed({ ...filters, page: 1, limit: 10 });

      if (res.items.length === 0 && !filters.include_seen && !hasActiveDiscoveryFilters(filters)) {
        const recommended = await discoveryService.getRecommended({ ...filters, page: 1, limit: 10 });
        if (recommended.items.length > 0) {
          setStack(recommended.items);
          return { ...recommended, source: 'recommended' as const };
        }

        const withSeen = await discoveryService.getFeed({
          ...filters,
          page: 1,
          limit: 10,
          include_seen: true,
        });
        if (withSeen.items.length > 0) {
          setStack(withSeen.items);
          return { ...withSeen, source: 'include_seen' as const };
        }
      }

      setStack(res.items);
      return { ...res, source: 'feed' as const };
    },
  });

  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || !query.data?.pagination.has_more) return;
    loadingMoreRef.current = true;
    try {
      const nextPage = pageRef.current + 1;
      const source = (query.data?.source ?? 'feed') as FeedSource;
      const fetchFeed =
        source === 'recommended'
          ? () => discoveryService.getRecommended({ ...filters, page: nextPage, limit: 10 })
          : () => discoveryService.getFeed({ ...filters, page: nextPage, limit: 10 });

      const res = await fetchFeed();
      pageRef.current = nextPage;
      setStack((prev) => {
        const ids = new Set(prev.map((m) => m.mentor_id));
        return [...prev, ...res.items.filter((m) => !ids.has(m.mentor_id))];
      });
      qc.setQueryData(qk.discoveryFeed({ ...filters, stackKey: filtersKey }), (old: typeof query.data) =>
        old ? { ...old, pagination: res.pagination } : old
      );
    } finally {
      loadingMoreRef.current = false;
    }
  }, [filters, filtersKey, qc, query.data]);

  const resetFeed = useCallback(() => {
    pageRef.current = 1;
    setStack([]);
    void qc.invalidateQueries({ queryKey: qk.discoveryFeed({ ...filters, stackKey: filtersKey }) });
  }, [filters, filtersKey, qc]);

  const updateSavedState = useCallback((mentorId: string, isSaved: boolean) => {
    setStack((prev) =>
      prev.map((m) => (m.mentor_id === mentorId ? { ...m, is_saved: isSaved } : m))
    );
  }, []);

  const emptyReason =
    (query.data?.items.length ?? 0) === 0 && !query.isPending
      ? hasActiveDiscoveryFilters(filters) || filters.include_seen
        ? ('no_results' as const)
        : ('all_seen' as const)
      : null;

  return {
    mentors: stack.length > 0 ? stack : (query.data?.items ?? []),
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    loadMore,
    resetFeed,
    updateSavedState,
    emptyReason,
    hasMore: query.data?.pagination.has_more ?? false,
  };
}
