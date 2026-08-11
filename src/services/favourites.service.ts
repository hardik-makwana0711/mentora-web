import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import type { FavouriteListingSummary, FavouriteMentorSummary } from '@/types/search';

export const favouritesService = {
  async addMentor(mentorId: string): Promise<void> {
    await apiClient.post(endpoints.favourites.mentor(mentorId));
  },

  async removeMentor(mentorId: string): Promise<void> {
    await apiClient.delete(endpoints.favourites.mentor(mentorId));
  },

  async listMentors(): Promise<FavouriteMentorSummary[]> {
    const { data } = await apiClient.get<FavouriteMentorSummary[]>(endpoints.favourites.mentors, {
      params: { t: Date.now() },
      headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
    });
    const rows = Array.isArray(data) ? data : [];
    return rows.map((row) => ({ ...row, is_favourited: row.is_favourited ?? true }));
  },

  async addListing(listingId: string): Promise<void> {
    await apiClient.post(endpoints.favourites.listing(listingId));
  },

  async removeListing(listingId: string): Promise<void> {
    await apiClient.delete(endpoints.favourites.listing(listingId));
  },

  async listListings(): Promise<FavouriteListingSummary[]> {
    const { data } = await apiClient.get<FavouriteListingSummary[]>(endpoints.favourites.listings, {
      params: { t: Date.now() },
      headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
    });
    return Array.isArray(data) ? data : [];
  },

  async listStudentMentors(studentId: string): Promise<{
    student?: { id: string; name: string };
    favourites: FavouriteMentorSummary[];
  }> {
    const { data } = await apiClient.get<{
      student?: { id: string; name: string };
      favourites?: FavouriteMentorSummary[];
    }>(endpoints.favourites.parentStudentMentors(studentId));
    return {
      student: data.student,
      favourites: data.favourites ?? [],
    };
  },
};
