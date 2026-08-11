const ACCESS = 'mentora_access_token';
const REFRESH = 'mentora_refresh_token';

export const tokenStorage = {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS);
  },
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH);
  },
  setTokens(access: string, refresh: string | null): void {
    localStorage.setItem(ACCESS, access);
    if (refresh) localStorage.setItem(REFRESH, refresh);
  },
  clear(): void {
    localStorage.removeItem(ACCESS);
    localStorage.removeItem(REFRESH);
  },
};
