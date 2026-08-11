const raw = import.meta.env.VITE_API_BASE_URL ?? '';

export const env = {
  apiBaseUrl: raw.replace(/\/$/, ''),
  appEnv: import.meta.env.VITE_APP_ENV ?? import.meta.env.MODE,
  appName: import.meta.env.VITE_APP_NAME ?? 'Mentora',
  socketUrl: import.meta.env.VITE_SOCKET_URL ?? '',
  sentryDsn: import.meta.env.VITE_SENTRY_DSN ?? '',
} as const;

export function assertApiBaseUrl(): void {
  if (!env.apiBaseUrl) {
    throw new Error(
      'VITE_API_BASE_URL is required. Copy apps/web/.env.example to .env and set your backend URL (e.g. http://localhost:4000).',
    );
  }
}
