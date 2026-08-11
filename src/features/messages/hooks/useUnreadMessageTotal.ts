import { useQuery } from '@tanstack/react-query';
import { qk } from '@/constants/query-keys';
import { fetchUnreadMessageTotal } from '@/services/messages.service';

export function useUnreadMessageTotal(enabled = true) {
  return useQuery({
    queryKey: qk.messageUnreadTotal,
    queryFn: fetchUnreadMessageTotal,
    enabled,
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
}
