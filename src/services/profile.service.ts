import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { env } from '@/config/env';
import { tokenStorage } from '@/lib/token-storage';
import type { ProfilePatchPayload, ProfileResponse } from '@/types/profile';

async function postMultipartProfilePhoto(file: File): Promise<{ profile_photo_url: string; key: string }> {
  const formData = new FormData();
  formData.append('file', file, file.name);
  const base = env.apiBaseUrl.replace(/\/$/, '');
  const path = endpoints.profile.mePhoto.startsWith('/') ? endpoints.profile.mePhoto : `/${endpoints.profile.mePhoto}`;
  const url = base ? `${base}${path}` : path;
  const token = tokenStorage.getAccessToken();
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'X-Security-Tunnel': 'hardened',
    },
    body: formData,
  });
  const json = (await res.json()) as {
    success?: boolean;
    data?: { profile_photo_url: string; key: string };
    message?: string;
  };
  if (!res.ok) {
    const err = new Error(json.message || 'Upload failed') as Error & { response?: { status: number; data: unknown } };
    err.response = { status: res.status, data: json };
    throw err;
  }
  if (json.success && json.data) return json.data;
  return json as unknown as { profile_photo_url: string; key: string };
}

export const profileService = {
  async getMe(): Promise<ProfileResponse> {
    const { data } = await apiClient.get<ProfileResponse>(endpoints.profile.me, {
      params: { t: Date.now() },
      headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache', Expires: '0' },
    });
    return data;
  },

  /**
   * PATCH body must match backend `updateProfileSchema` (flat keys only — no nested blobs).
   */
  async patchMe(payload: ProfilePatchPayload): Promise<ProfileResponse> {
    const nullableKeys = new Set(['primary_university_id', 'university_attendance_status']);
    const arrayKeys = new Set(['subject_proficiencies', 'exam_proficiencies']);
    const body: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(payload)) {
      if (v === undefined) continue;
      if (nullableKeys.has(k)) {
        body[k] = v;
        continue;
      }
      if (arrayKeys.has(k) && Array.isArray(v)) {
        body[k] = v;
        continue;
      }
      if (v === null) continue;
      if (typeof v === 'string' && v.trim() === '') continue;
      body[k] = v;
    }
    const { data } = await apiClient.patch<ProfileResponse>(endpoints.profile.me, body);
    return data;
  },

  /** Multipart field name must be `file` — matches mobile `profileApi.uploadPhoto` and backend multer. */
  async uploadPhoto(file: File): Promise<{ profile_photo_url: string; key: string }> {
    return postMultipartProfilePhoto(file);
  },
};
