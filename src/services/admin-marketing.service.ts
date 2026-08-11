import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import type { PaginatedResponse } from '@/types/admin';
import type {
  CreateSponsoredCampaignPayload,
  SponsoredCampaign,
  SponsoredCampaignListParams,
  SponsoredCampaignMetrics,
  UpdateSponsoredCampaignPayload,
} from '@/types/marketing';

function cleanParams(
  params: Record<string, string | number | undefined>
): Record<string, string | number> {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  ) as Record<string, string | number>;
}

export const adminMarketingService = {
  async listCampaigns(
    params: SponsoredCampaignListParams = {}
  ): Promise<PaginatedResponse<SponsoredCampaign>> {
    const { data } = await apiClient.get<PaginatedResponse<SponsoredCampaign>>(
      endpoints.admin.marketing.campaigns,
      { params: cleanParams(params as Record<string, string | number | undefined>) }
    );
    return data;
  },

  async getCampaign(id: string): Promise<SponsoredCampaign> {
    const { data } = await apiClient.get<SponsoredCampaign>(endpoints.admin.marketing.campaign(id));
    return data;
  },

  async createCampaign(payload: CreateSponsoredCampaignPayload): Promise<SponsoredCampaign> {
    const { data } = await apiClient.post<SponsoredCampaign>(
      endpoints.admin.marketing.campaigns,
      payload
    );
    return data;
  },

  async updateCampaign(id: string, payload: UpdateSponsoredCampaignPayload): Promise<SponsoredCampaign> {
    const { data } = await apiClient.patch<SponsoredCampaign>(
      endpoints.admin.marketing.campaign(id),
      payload
    );
    return data;
  },

  async deleteCampaign(id: string): Promise<SponsoredCampaign> {
    const { data } = await apiClient.delete<SponsoredCampaign>(endpoints.admin.marketing.campaign(id));
    return data;
  },

  async getCampaignMetrics(
    id: string,
    params?: { startDate?: string; endDate?: string }
  ): Promise<SponsoredCampaignMetrics> {
    const { data } = await apiClient.get<SponsoredCampaignMetrics>(
      endpoints.admin.marketing.campaignMetrics(id),
      { params: cleanParams(params ?? {}) }
    );
    return data;
  },
};
