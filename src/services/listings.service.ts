import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import type {
  ListingFormPayload,
  MentorListing,
  ToggleListingStatusPayload,
} from '@/types/listings';

export const listingsService = {
  async fetchMyListings(): Promise<MentorListing[]> {
    const { data } = await apiClient.get<MentorListing[]>(endpoints.mentor.listings);
    return Array.isArray(data) ? data : [];
  },

  async fetchListingById(listingId: string): Promise<MentorListing> {
    const { data } = await apiClient.get<MentorListing>(endpoints.mentor.listing(listingId));
    return data;
  },

  async createListing(payload: ListingFormPayload): Promise<MentorListing> {
    const { data } = await apiClient.post<MentorListing>(endpoints.mentor.listings, payload);
    return data;
  },

  async updateListing(listingId: string, payload: ListingFormPayload): Promise<MentorListing> {
    const { data } = await apiClient.patch<MentorListing>(endpoints.mentor.listing(listingId), payload);
    return data;
  },

  async toggleListingStatus(
    listingId: string,
    payload: ToggleListingStatusPayload
  ): Promise<{ id: string; status: ToggleListingStatusPayload['status'] }> {
    const { data } = await apiClient.patch<{ id: string; status: ToggleListingStatusPayload['status'] }>(
      endpoints.mentor.listingStatus(listingId),
      payload
    );
    return data;
  },
};
