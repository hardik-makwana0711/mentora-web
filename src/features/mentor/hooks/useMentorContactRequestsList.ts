import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { qk } from '@/constants/query-keys';
import { contactRequestsService } from '@/services/contact-requests.service';
import type { ContactRequestStatus } from '@/types/contact-requests';

const PAGE_SIZE = 20;

export function useMentorContactRequestsList(status: ContactRequestStatus | 'all') {
  const params = status === 'all' ? { limit: PAGE_SIZE } : { status, limit: PAGE_SIZE };
  return useInfiniteQuery({
    queryKey: qk.mentorContactRequests(params),
    queryFn: ({ pageParam }) =>
      contactRequestsService.listMentorIncoming({ ...params, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const { page, limit, total } = last.pagination;
      return page * limit < total ? page + 1 : undefined;
    },
  });
}

/** Lightweight count for a single status (or 'all'), used by summary cards + tab badges. */
export function useMentorContactRequestsCount(status: ContactRequestStatus | 'all') {
  const params = status === 'all' ? { limit: 1 } : { status, limit: 1 };
  return useQuery({
    queryKey: qk.mentorContactRequests(params),
    queryFn: () => contactRequestsService.listMentorIncoming(params),
    select: (data) => data.pagination.total,
    staleTime: 30_000,
  });
}
