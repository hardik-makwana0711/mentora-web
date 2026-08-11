import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';
import { env } from '@/config/env';
import { endpoints } from '@/api/endpoints';
import { tokenStorage } from '@/lib/token-storage';

type RetriableRequest = InternalAxiosRequestConfig & { _retry?: boolean; __retryCount?: number };

let isRefreshing = false;
type QueueItem = { resolve: (t: string | null) => void; reject: (e: unknown) => void };
let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token);
  });
  failedQueue = [];
};

function normalizeApiError(error: AxiosError): void {
  const data = error.response?.data as { message?: string; error?: string } | undefined;
  const msg = data?.message || data?.error || error.message || 'İstek başarısız oldu.';
  (error as AxiosError & { normalizedMessage?: string }).normalizedMessage = msg;
}

export function applyInterceptors(client: AxiosInstance): void {
  client.interceptors.request.use((config) => {
    const token = tokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => {
      const body = response.data;
      if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
        const wrapped = body as { success: boolean; data: unknown };
        if (wrapped.success) response.data = wrapped.data;
      }
      return response;
    },
    async (error: AxiosError) => {
      normalizeApiError(error);
      const originalRequest = error.config as RetriableRequest | undefined;
      if (!originalRequest) return Promise.reject(error);

      if (!error.response) {
        const count = originalRequest.__retryCount ?? 0;
        if (count < 3) {
          originalRequest.__retryCount = count + 1;
          await new Promise((r) => setTimeout(r, 1000 * (count + 1)));
          return client(originalRequest);
        }
        return Promise.reject(error);
      }

      const isLogin = originalRequest.url?.includes(endpoints.auth.login);
      if (
        error.response.status === 401 &&
        !originalRequest._retry &&
        !isLogin &&
        !originalRequest.url?.includes(endpoints.auth.refresh)
      ) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (token) originalRequest.headers.Authorization = `Bearer ${token}`;
              return client(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;
        try {
          const refreshToken = tokenStorage.getRefreshToken();
          if (!refreshToken) throw new Error('No refresh token');

          const refreshUrl = `${env.apiBaseUrl}${endpoints.auth.refresh}`;
          const response = await axios.post(refreshUrl, { refresh_token: refreshToken });
          const raw = response.data as Record<string, unknown>;
          const inner =
            raw &&
            typeof raw === 'object' &&
            'success' in raw &&
            (raw as { success: boolean }).success &&
            'data' in raw
              ? (raw as { data: unknown }).data
              : raw;
          const tokens = (inner as { tokens?: { access_token: string; refresh_token?: string } })?.tokens;
          if (!tokens?.access_token) throw new Error('Refresh failed');

          tokenStorage.setTokens(tokens.access_token, tokens.refresh_token ?? refreshToken);
          processQueue(null, tokens.access_token);
          originalRequest.headers.Authorization = `Bearer ${tokens.access_token}`;
          return client(originalRequest);
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          tokenStorage.clear();
          delete client.defaults.headers.common.Authorization;
          window.dispatchEvent(new CustomEvent('mentora:auth-expired'));
          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
}
