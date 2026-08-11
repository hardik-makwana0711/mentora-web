import { env } from '@/config/env';

/** Runtime configuration (mirrors mobile `Config` usage). */
export const appConfig = {
  ...env,
} as const;
