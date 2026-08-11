import { useEffect, useMemo, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { qk } from '@/constants/query-keys';
import { searchService } from '@/services/search.service';
import type { SearchFilters, StructuredFilterLabels } from '@/types/search';

export function useMentorSearch() {
  const [query, setQuery] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [filterLabels, setFilterLabels] = useState<StructuredFilterLabels>({});

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(query.trim()), 400);
    return () => clearTimeout(t);
  }, [query]);

  const queryFilters = useMemo(
    () => ({ ...filters, q: debouncedQ || undefined, limit: 20 }),
    [filters, debouncedQ]
  );

  const searchQuery = useInfiniteQuery({
    queryKey: qk.mentorSearch(queryFilters),
    queryFn: ({ pageParam }) =>
      searchService.searchMentors({ ...queryFilters, page: pageParam as number }),
    initialPageParam: 1,
    staleTime: 0,
    refetchOnMount: 'always',
    getNextPageParam: (last) => {
      const { page, limit, total } = last.pagination;
      return page * limit < total ? page + 1 : undefined;
    },
  });

  const items = searchQuery.data?.pages.flatMap((p) => p.items) ?? [];
  const total = searchQuery.data?.pages[0]?.pagination.total;

  function clearAllFilters() {
    setFilters({});
    setFilterLabels({});
  }

  return {
    query,
    setQuery,
    filters,
    setFilters,
    filterLabels,
    setFilterLabels,
    clearAllFilters,
    items,
    total,
    ...searchQuery,
  };
}
