import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { env } from '@/config/env';
import { tokenStorage } from '@/lib/token-storage';

export interface MentorProfilePhoto {
  id: string;
  url: string;
  thumbnail_url: string | null;
  is_primary: boolean;
  sort_order: number;
  status: 'pending' | 'approved' | 'rejected';
}

export interface MentorIntroVideo {
  id: string;
  url: string;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
}

export interface SetIntroVideoInput {
  url: string;
  thumbnail_url?: string;
  duration_seconds?: number;
}

export const mentorMediaService = {
  async listPhotos(): Promise<MentorProfilePhoto[]> {
    const { data } = await apiClient.get<{ photos: MentorProfilePhoto[] }>(
      endpoints.mentorProfileMedia.photos
    );
    return data.photos;
  },

  async uploadPhoto(file: File): Promise<MentorProfilePhoto> {
    const formData = new FormData();
    formData.append('photo', file, file.name);
    const base = env.apiBaseUrl.replace(/\/$/, '');
    const token = tokenStorage.getAccessToken();
    const res = await fetch(`${base}${endpoints.mentorProfileMedia.photosUpload}`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'X-Security-Tunnel': 'hardened',
      },
      body: formData,
    });
    const json = (await res.json()) as {
      success?: boolean;
      data?: { photo: MentorProfilePhoto };
      message?: string;
    };
    if (!res.ok) {
      throw new Error(json.message ?? 'Upload failed');
    }
    return (json.data as { photo: MentorProfilePhoto }).photo;
  },

  async deletePhoto(photoId: string): Promise<void> {
    await apiClient.delete(endpoints.mentorProfileMedia.photo(photoId));
  },

  async getIntroVideo(): Promise<MentorIntroVideo | null> {
    const { data } = await apiClient.get<{ intro_video: MentorIntroVideo | null }>(
      endpoints.mentorProfileMedia.introVideo
    );
    return data.intro_video;
  },

  async setIntroVideo(input: SetIntroVideoInput): Promise<MentorIntroVideo> {
    const { data } = await apiClient.put<{ intro_video: MentorIntroVideo }>(
      endpoints.mentorProfileMedia.introVideo,
      input
    );
    return data.intro_video;
  },
};
