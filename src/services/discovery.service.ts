import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import type {
  DiscoveryFeedResponse,
  DiscoveryFilters,
  DiscoveryFullProfile,
  DiscoveryMentorCard,
} from '@/types/discovery';

function cleanDiscoveryParams(filters: DiscoveryFilters): Record<string, string | number | boolean> {
  return Object.fromEntries(
    Object.entries({
      subject: filters.subject,
      exam_type: filters.exam_type,
      grade_level: filters.grade_level,
      teaching_format: filters.teaching_format,
      min_rating: filters.min_rating,
      tags: filters.tags,
      page: filters.page,
      limit: filters.limit,
      include_seen: filters.include_seen,
      student_id: filters.student_id,
    }).filter(([, v]) => v !== undefined && v !== null && v !== '')
  ) as Record<string, string | number | boolean>;
}

export const discoveryService = {
  async getFeed(filters: DiscoveryFilters = {}): Promise<DiscoveryFeedResponse> {
    const { data } = await apiClient.get<DiscoveryFeedResponse>(endpoints.mentorDiscovery.feed, {
      params: cleanDiscoveryParams({ limit: 10, ...filters }),
    });
    return data;
  },

  async getRecommended(filters: DiscoveryFilters = {}): Promise<DiscoveryFeedResponse> {
    const { data } = await apiClient.get<DiscoveryFeedResponse>(endpoints.mentorDiscovery.recommended, {
      params: cleanDiscoveryParams({ limit: 10, ...filters }),
    });
    return data;
  },

  async getSaved(filters: DiscoveryFilters = {}): Promise<DiscoveryFeedResponse> {
    const { data } = await apiClient.get<DiscoveryFeedResponse>(endpoints.mentorDiscovery.saved, {
      params: cleanDiscoveryParams(filters),
    });
    return data;
  },

  async likeMentor(mentorId: string): Promise<void> {
    await apiClient.post(endpoints.mentorDiscovery.like(mentorId), { source: 'swipe_discovery' });
  },

  async dislikeMentor(mentorId: string): Promise<void> {
    await apiClient.post(endpoints.mentorDiscovery.dislike(mentorId), { source: 'swipe_discovery' });
  },

  async saveMentor(mentorId: string): Promise<void> {
    await apiClient.post(endpoints.mentorDiscovery.save(mentorId), { source: 'swipe_discovery' });
  },

  async unsaveMentor(mentorId: string): Promise<void> {
    await apiClient.delete(endpoints.mentorDiscovery.save(mentorId));
  },

  async getFullProfile(mentorId: string): Promise<DiscoveryFullProfile> {
    const { data } = await apiClient.get<DiscoveryFullProfile>(
      endpoints.mentors.discoveryProfile(mentorId)
    );
    return data;
  },
};

export type { DiscoveryMentorCard };
