import type { AxiosError } from 'axios';

export function isHttpNotFound(error: unknown): boolean {
  const ax = error as AxiosError | undefined;
  return ax?.response?.status === 404;
}
