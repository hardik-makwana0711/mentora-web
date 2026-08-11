import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import type {
  ContactRequest,
  ContactRequestListResponse,
  ContactRequestStatus,
  CreateContactRequestInput,
} from '@/types/contact-requests';

export const contactRequestsService = {
  async createForMentor(mentorId: string, input: CreateContactRequestInput): Promise<ContactRequest> {
    const { data } = await apiClient.post<{ request: ContactRequest }>(
      endpoints.mentors.contactRequest(mentorId),
      input
    );
    return data.request;
  },

  async listMine(params?: {
    page?: number;
    limit?: number;
    status?: ContactRequestStatus;
  }): Promise<ContactRequestListResponse> {
    const { data } = await apiClient.get<ContactRequestListResponse>(
      endpoints.mentorContactRequests.list,
      { params }
    );
    return data;
  },

  async cancel(requestId: string): Promise<ContactRequest> {
    const { data } = await apiClient.post<{ request: ContactRequest }>(
      endpoints.mentorContactRequests.cancel(requestId)
    );
    return data.request;
  },

  async listMentorIncoming(params?: {
    page?: number;
    limit?: number;
    status?: ContactRequestStatus;
  }): Promise<ContactRequestListResponse> {
    const { data } = await apiClient.get<ContactRequestListResponse>(
      endpoints.mentorContactRequests.mentorList,
      { params }
    );
    return data;
  },

  async accept(requestId: string, responseMessage?: string): Promise<ContactRequest> {
    const { data } = await apiClient.post<{ request: ContactRequest }>(
      endpoints.mentorContactRequests.mentorAccept(requestId),
      responseMessage ? { response_message: responseMessage } : {}
    );
    return data.request;
  },

  async reject(requestId: string, responseMessage: string): Promise<ContactRequest> {
    const { data } = await apiClient.post<{ request: ContactRequest }>(
      endpoints.mentorContactRequests.mentorReject(requestId),
      { response_message: responseMessage }
    );
    return data.request;
  },

  async adminList(params?: {
    page?: number;
    limit?: number;
    status?: ContactRequestStatus;
    mentor_id?: string;
  }): Promise<ContactRequestListResponse> {
    const { data } = await apiClient.get<ContactRequestListResponse>(
      endpoints.mentorContactRequests.adminList,
      { params }
    );
    return data;
  },

  async adminGetDetail(requestId: string): Promise<ContactRequest> {
    const { data } = await apiClient.get<{ request: ContactRequest }>(
      endpoints.mentorContactRequests.adminDetail(requestId)
    );
    return data.request;
  },

  async adminUpdateStatus(
    requestId: string,
    status: ContactRequestStatus,
    adminNotes?: string
  ): Promise<ContactRequest> {
    const { data } = await apiClient.patch<{ request: ContactRequest }>(
      endpoints.mentorContactRequests.adminStatus(requestId),
      { status, admin_notes: adminNotes }
    );
    return data.request;
  },
};
