import axios from 'axios';
import { env, assertApiBaseUrl } from '@/config/env';
import { applyInterceptors } from '@/api/interceptors';

assertApiBaseUrl();

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
    'X-Security-Tunnel': 'hardened',
  },
});

applyInterceptors(apiClient);

export function setAuthHeader(token: string | null): void {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
}
