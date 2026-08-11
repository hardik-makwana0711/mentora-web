import type { AxiosError } from 'axios';

export function normAxios(e: unknown, fallback = 'Something went wrong'): string {
  const ax = e as AxiosError<{ message?: string }> & { normalizedMessage?: string };
  return ax.normalizedMessage || ax.response?.data?.message || ax.message || fallback;
}
