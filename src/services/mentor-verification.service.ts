import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { env } from '@/config/env';
import { tokenStorage } from '@/lib/token-storage';
import type {
  MentorVerificationStatusPayload,
  VerificationDocument,
  VerificationDocumentType,
} from '@/types/profile';

export interface StartIdentityResponse {
  provider: string;
  session_id: string;
  verification_url: string;
}

async function uploadMultipart(url: string, formData: FormData): Promise<unknown> {
  const base = env.apiBaseUrl.replace(/\/$/, '');
  const token = tokenStorage.getAccessToken();
  const res = await fetch(`${base}${url}`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'X-Security-Tunnel': 'hardened',
    },
    body: formData,
  });
  const json = (await res.json()) as { success?: boolean; data?: unknown; message?: string };
  if (!res.ok) {
    throw new Error(json.message ?? 'Upload failed');
  }
  return json.success && json.data !== undefined ? json.data : json;
}

export const mentorVerificationService = {
  async getStatus(): Promise<MentorVerificationStatusPayload | null> {
    try {
      const { data } = await apiClient.get<MentorVerificationStatusPayload>(
        endpoints.mentor.verificationStatus,
        {
          params: { t: Date.now() },
          headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache', Expires: '0' },
        }
      );
      return data;
    } catch {
      return null;
    }
  },

  async startIdentity(): Promise<StartIdentityResponse> {
    const { data } = await apiClient.post<StartIdentityResponse>(
      endpoints.mentor.identityStart,
      {}
    );
    return data;
  },

  async uploadDocument(file: File, type: VerificationDocumentType): Promise<VerificationDocument> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('type', type);
    const data = (await uploadMultipart(endpoints.mentor.studentVerificationUpload, formData)) as {
      document: VerificationDocument;
    };
    return data.document;
  },

  async getFiles(): Promise<VerificationDocument[]> {
    const { data } = await apiClient.get<{ documents: VerificationDocument[] }>(
      endpoints.mentor.studentVerificationFiles
    );
    return data.documents;
  },
};
