import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { qk } from '@/constants/query-keys';
import { searchService } from '@/services/search.service';

function defaultDateRange() {
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + 30);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

export function useAvailableSlots(listingId: string, enabled = true) {
  const { startDate, endDate } = useMemo(() => defaultDateRange(), []);

  return useQuery({
    queryKey: qk.listingSlots(listingId, startDate, endDate),
    queryFn: () => searchService.getAvailableSlots(listingId, startDate, endDate),
    enabled: Boolean(listingId) && enabled,
    staleTime: 0,
  });
}
