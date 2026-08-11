import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import type { MentorVerificationStatusPayload } from '@/types/profile';

export const mentorVerificationService = {
  async getStatus(): Promise<MentorVerificationStatusPayload | null> {
    try {
      const { data } = await apiClient.get<MentorVerificationStatusPayload>(endpoints.mentor.verificationStatus, {
        params: { t: Date.now() },
        headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache', Expires: '0' },
      });
      return data;
    } catch {
      return null;
    }
  },
};
