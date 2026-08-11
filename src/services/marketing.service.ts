import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import type {
  SponsoredCardQuery,
  SponsoredCardSelection,
  SponsoredCampaignPlacement,
  SponsoredCampaignPlatform,
  TrackingPayload,
} from '@/types/marketing';

function cleanParams(params: Record<string, string | undefined>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
  ) as Record<string, string>;
}

export const marketingService = {
  async getSponsoredCard(query: SponsoredCardQuery): Promise<SponsoredCardSelection> {
    const { data } = await apiClient.get<SponsoredCardSelection>(endpoints.marketing.sponsoredCards, {
      params: cleanParams({
        placement: query.placement,
        platform: query.platform ?? 'web',
        language: query.language,
        student_id: query.student_id,
        subject: query.subject,
        exam_type: query.exam_type,
      }),
    });
    return data;
  },

  async recordImpression(
    campaignId: string,
    payload: TrackingPayload
  ): Promise<void> {
    await apiClient.post(endpoints.marketing.impression(campaignId), {
      placement: payload.placement,
      platform: payload.platform ?? 'web',
    });
  },

  async recordClick(campaignId: string, payload: TrackingPayload): Promise<void> {
    await apiClient.post(endpoints.marketing.click(campaignId), {
      placement: payload.placement,
      platform: payload.platform ?? 'web',
    });
  },
};

export type { SponsoredCampaignPlacement, SponsoredCampaignPlatform };
