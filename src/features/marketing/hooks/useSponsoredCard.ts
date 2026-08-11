import { useQuery } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';
import { qk } from '@/constants/query-keys';
import { useAppLocale } from '@/hooks/use-app-locale';
import { marketingService } from '@/services/marketing.service';
import type { SponsoredCampaignPlacement, SponsoredCardPublic } from '@/types/marketing';

type Options = {
  placement: SponsoredCampaignPlacement;
  subject?: string;
  examType?: string;
  studentId?: string;
  enabled?: boolean;
};

export function useSponsoredCard({
  placement,
  subject,
  examType,
  studentId,
  enabled = true,
}: Options) {
  const { locale } = useAppLocale();
  const impressionSent = useRef(false);

  const query = useQuery({
    queryKey: qk.sponsoredCard({ placement, subject, examType, studentId, locale }),
    queryFn: () =>
      marketingService.getSponsoredCard({
        placement,
        platform: 'web',
        language: locale,
        subject,
        exam_type: examType,
        student_id: studentId,
      }),
    enabled,
    staleTime: 5 * 60_000,
    retry: false,
    throwOnError: false,
  });

  const card: SponsoredCardPublic | null = query.data?.card ?? null;

  const trackImpression = useCallback(() => {
    if (!card || impressionSent.current) return;
    impressionSent.current = true;
    void marketingService
      .recordImpression(card.id, { placement, platform: 'web' })
      .catch(() => undefined);
  }, [card, placement]);

  return {
    card,
    isLoading: query.isLoading,
    trackImpression,
  };
}
