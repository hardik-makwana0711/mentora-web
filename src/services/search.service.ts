import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import type {
  AvailabilityWindow,
  ListingAvailableSlotsResponse,
  MentorAvailabilitySlot,
  MentorPublicProfileResponse,
  MentorSearchResult,
  PublicListingDetailResponse,
  SearchFilters,
} from '@/types/search';

function flattenListingAvailableSlots(payload: ListingAvailableSlotsResponse | AvailabilityWindow[]): AvailabilityWindow[] {
  if (Array.isArray(payload)) return payload;
  return (payload.availableSlots ?? []).flatMap((day) =>
    day.slots.map((slot) => ({
      start: slot.start,
      end: slot.end,
      slot_id: slot.start,
    }))
  );
}

/** Mirrors mobile `searchApi.cleanSearchParams` — maps discovery names to backend query keys. */
function cleanParams(filters: SearchFilters): Record<string, string | number> {
  const search_query = filters.q ?? filters.search_query;
  const grade = filters.grade_level ?? filters.grade;

  return Object.fromEntries(
    Object.entries({
      search_query,
      subject: filters.subject,
      grade,
      lesson_format: filters.lesson_format,
      page: filters.page,
      limit: filters.limit,
      university_id: filters.university_id,
      subject_id: filters.subject_id,
      exam_track_subject_id: filters.exam_track_subject_id,
      rating: filters.rating,
    }).filter(([, v]) => v !== undefined && v !== null && v !== '')
  ) as Record<string, string | number>;
}

export const searchService = {
  async searchMentors(filters: SearchFilters = {}): Promise<MentorSearchResult> {
    const { data } = await apiClient.get<MentorSearchResult>(endpoints.mentors.search, {
      params: cleanParams(filters),
    });
    return data;
  },

  async getMentorPublicProfile(mentorId: string): Promise<MentorPublicProfileResponse> {
    const { data } = await apiClient.get<MentorPublicProfileResponse>(
      endpoints.mentors.publicProfile(mentorId)
    );
    return data;
  },

  async getPublicListing(listingId: string): Promise<PublicListingDetailResponse> {
    const { data } = await apiClient.get<PublicListingDetailResponse>(endpoints.listings.public(listingId));
    return data;
  },

  async getMentorAvailability(
    mentorId: string,
    startDate: string,
    endDate: string
  ): Promise<MentorAvailabilitySlot[]> {
    const { data } = await apiClient.get<MentorAvailabilitySlot[]>(endpoints.mentors.availability(mentorId), {
      params: { start_date: startDate, end_date: endDate },
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
    });
    return Array.isArray(data) ? data : [];
  },

  async getAvailableSlots(
    listingId: string,
    startDate: string,
    endDate: string
  ): Promise<AvailabilityWindow[]> {
    const { data } = await apiClient.get<ListingAvailableSlotsResponse | AvailabilityWindow[]>(
      endpoints.listings.availableSlots(listingId),
      {
        params: { startDate, endDate },
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
      }
    );
    return flattenListingAvailableSlots(data);
  },

  async trackListingView(listingId: string): Promise<void> {
    await apiClient.post(endpoints.listings.view(listingId));
  },
};
