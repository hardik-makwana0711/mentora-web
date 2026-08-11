import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';

export type PresignGetResponse = {
  view_url: string;
  key: string;
  expires_in_seconds: number;
  usage_hint?: string;
};

export const uploadsService = {
  async presignGet(body: { key?: string; object_url?: string }): Promise<PresignGetResponse> {
    const { data } = await apiClient.post<PresignGetResponse>(endpoints.uploads.presignGet, body);
    return data;
  },
};
