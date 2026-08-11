import { useQuery } from '@tanstack/react-query';
import { qk } from '@/constants/query-keys';
import { searchService } from '@/services/search.service';

export function useMentorPublicProfile(mentorId: string) {
  return useQuery({
    queryKey: qk.mentorPublicProfile(mentorId),
    queryFn: () => searchService.getMentorPublicProfile(mentorId),
    enabled: Boolean(mentorId),
    staleTime: 0,
    refetchOnMount: 'always',
  });
}
