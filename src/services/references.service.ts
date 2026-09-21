import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import type {
  MentorReferenceRow,
  MyReferenceRow,
  ReferenceStatus,
  SubmitReferenceInput,
} from '@/types/references';

export const referencesService = {
  async submit(input: SubmitReferenceInput): Promise<MyReferenceRow> {
    const { data } = await apiClient.post<{ reference: MyReferenceRow }>(
      endpoints.references.submit,
      input
    );
    return data.reference;
  },

  async listMine(): Promise<MyReferenceRow[]> {
    const { data } = await apiClient.get<{ references: MyReferenceRow[] }>(
      endpoints.references.mine
    );
    return data.references;
  },

  async listMentorInbox(): Promise<MentorReferenceRow[]> {
    const { data } = await apiClient.get<{ references: MentorReferenceRow[] }>(
      endpoints.references.mentorInbox
    );
    return data.references;
  },

  async updateStatus(
    referenceId: string,
    status: Extract<ReferenceStatus, 'approved' | 'hidden'>
  ): Promise<MentorReferenceRow> {
    const { data } = await apiClient.patch<{ reference: MentorReferenceRow }>(
      endpoints.references.mentorUpdateStatus(referenceId),
      { status }
    );
    return data.reference;
  },
};
