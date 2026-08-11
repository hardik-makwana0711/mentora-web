import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import {
  isMentorProfilesListFailure,
  listMentorProfilesViaUsers,
  type MentorProfileListParams,
} from '@/services/admin-mentor-profiles-fallback';
import type {
  AdminDashboardStats,
  AdminListingDetail,
  AdminListingListItem,
  AdminMentorProfileDetail,
  AdminMentorVerificationDetail,
  AdminMentorVerificationListItem,
  AdminUserDetail,
  AdminUserListItem,
  ListingModerationStatus,
  PaginatedResponse,
} from '@/types/admin';

function cleanParams(params: Record<string, string | number | undefined>): Record<string, string | number> {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  ) as Record<string, string | number>;
}

export const adminService = {
  async getDashboard(): Promise<AdminDashboardStats> {
    const { data } = await apiClient.get<AdminDashboardStats>(endpoints.admin.dashboard);
    return data;
  },

  async listMentorVerifications(): Promise<{ pending: AdminMentorVerificationListItem[] }> {
    const { data } = await apiClient.get<{ pending: AdminMentorVerificationListItem[] }>(
      endpoints.admin.mentorVerifications.pending
    );
    return data;
  },

  async getMentorVerification(mentorId: string): Promise<AdminMentorVerificationDetail> {
    const { data } = await apiClient.get<AdminMentorVerificationDetail>(
      endpoints.admin.mentorVerifications.detail(mentorId)
    );
    return data;
  },

  async approveMentorVerification(mentorId: string, review_notes?: string): Promise<unknown> {
    const { data } = await apiClient.post(endpoints.admin.mentorVerifications.approve(mentorId), {
      review_notes,
    });
    return data;
  },

  async rejectMentorVerification(mentorId: string, review_notes: string): Promise<unknown> {
    const { data } = await apiClient.post(endpoints.admin.mentorVerifications.reject(mentorId), {
      review_notes,
    });
    return data;
  },

  async listMentorProfiles(params: MentorProfileListParams): Promise<PaginatedResponse<AdminMentorProfileDetail>> {
    try {
      const { data } = await apiClient.get<PaginatedResponse<AdminMentorProfileDetail>>(
        endpoints.admin.mentorProfiles.list,
        { params: cleanParams(params) }
      );
      return data;
    } catch (error) {
      // Backend list uses Promise.all on details; one mentor without a profile row fails the whole list.
      if (isMentorProfilesListFailure(error)) {
        return listMentorProfilesViaUsers(params, {
          listUsers: (p) => this.listUsers(p),
          getMentorProfile: (mentorId) => this.getMentorProfile(mentorId),
        });
      }
      throw error;
    }
  },

  async getMentorProfile(mentorId: string): Promise<AdminMentorProfileDetail> {
    const { data } = await apiClient.get<AdminMentorProfileDetail>(
      endpoints.admin.mentorProfiles.detail(mentorId)
    );
    return data;
  },

  async approveMentorProfile(mentorId: string, reviewNotes?: string): Promise<unknown> {
    const { data } = await apiClient.post(endpoints.admin.mentorProfiles.approve(mentorId), {
      reviewNotes,
    });
    return data;
  },

  async requestMentorProfileChanges(mentorId: string, reason: string): Promise<unknown> {
    const { data } = await apiClient.post(endpoints.admin.mentorProfiles.requestChanges(mentorId), {
      reason,
    });
    return data;
  },

  async rejectMentorProfile(mentorId: string, reason: string): Promise<unknown> {
    const { data } = await apiClient.post(endpoints.admin.mentorProfiles.reject(mentorId), { reason });
    return data;
  },

  async hideMentorProfile(mentorId: string, reason: string): Promise<unknown> {
    const { data } = await apiClient.post(endpoints.admin.mentorProfiles.hide(mentorId), { reason });
    return data;
  },

  async restoreMentorProfile(mentorId: string, reason?: string): Promise<unknown> {
    const { data } = await apiClient.post(endpoints.admin.mentorProfiles.restore(mentorId), { reason });
    return data;
  },

  async listListings(params: {
    page?: number;
    limit?: number;
    moderationStatus?: ListingModerationStatus;
    search?: string;
  }): Promise<PaginatedResponse<AdminListingListItem>> {
    const { data } = await apiClient.get<PaginatedResponse<AdminListingListItem>>(
      endpoints.admin.listings.list,
      { params: cleanParams(params) }
    );
    return data;
  },

  async getListing(listingId: string): Promise<AdminListingDetail> {
    const { data } = await apiClient.get<AdminListingDetail>(endpoints.admin.listings.detail(listingId));
    return data;
  },

  async approveListing(listingId: string, reviewNotes?: string): Promise<unknown> {
    const { data } = await apiClient.post(endpoints.admin.listings.approve(listingId), { reviewNotes });
    return data;
  },

  async requestListingChanges(listingId: string, reason: string): Promise<unknown> {
    const { data } = await apiClient.post(endpoints.admin.listings.requestChanges(listingId), { reason });
    return data;
  },

  async rejectListing(listingId: string, reason: string): Promise<unknown> {
    const { data } = await apiClient.post(endpoints.admin.listings.reject(listingId), { reason });
    return data;
  },

  async hideListing(listingId: string, reason: string): Promise<unknown> {
    const { data } = await apiClient.post(endpoints.admin.listings.hide(listingId), { reason });
    return data;
  },

  async restoreListing(listingId: string): Promise<unknown> {
    const { data } = await apiClient.post(endpoints.admin.listings.restore(listingId));
    return data;
  },

  async listUsers(params: {
    page?: number;
    limit?: number;
    accountStatus?: string;
    role?: string;
  }): Promise<PaginatedResponse<AdminUserListItem>> {
    const { data } = await apiClient.get<PaginatedResponse<AdminUserListItem>>(endpoints.admin.users.list, {
      params: cleanParams(params),
    });
    return data;
  },

  async getUser(userId: string): Promise<AdminUserDetail> {
    const { data } = await apiClient.get<AdminUserDetail>(endpoints.admin.users.detail(userId));
    return data;
  },

  async suspendUser(userId: string, reason: string): Promise<unknown> {
    const { data } = await apiClient.post(endpoints.admin.users.suspend(userId), { reason });
    return data;
  },

  async reactivateUser(userId: string): Promise<unknown> {
    const { data } = await apiClient.post(endpoints.admin.users.reactivate(userId));
    return data;
  },
};
