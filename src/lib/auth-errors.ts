import type { AxiosError } from 'axios';
import type { ResetPasswordErrorData } from '@/types/auth-password-reset';
import type { AccountVerificationPayload } from '@/types/auth-verification';

export class ResetPasswordFailedError extends Error {
  readonly payload: ResetPasswordErrorData;

  constructor(message: string, payload: ResetPasswordErrorData) {
    super(message);
    this.name = 'ResetPasswordFailedError';
    this.payload = payload;
  }
}

export class LoginVerificationRequiredError extends Error {
  readonly payload: AccountVerificationPayload;

  constructor(message: string, payload: AccountVerificationPayload) {
    super(message);
    this.name = 'LoginVerificationRequiredError';
    this.payload = payload;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

/** Read verification meta from login 403 — `error.response.data.data`. */
export function parseAccountVerificationPayload(
  error: AxiosError
): AccountVerificationPayload | null {
  if (error.response?.status !== 403) return null;

  const body = error.response.data;
  if (!isRecord(body)) return null;

  const data = body.data;
  if (!isRecord(data)) return null;
  if (data.code !== 'ACCOUNT_VERIFICATION_REQUIRED') return null;

  return data as unknown as AccountVerificationPayload;
}

export function isLoginVerificationRequiredError(
  error: unknown
): error is LoginVerificationRequiredError {
  return error instanceof LoginVerificationRequiredError;
}

export function parseResetPasswordErrorPayload(error: AxiosError): ResetPasswordErrorData | null {
  if (error.response?.status !== 400) return null;
  const body = error.response.data;
  if (!isRecord(body)) return null;
  const data = body.data;
  if (!isRecord(data)) return null;
  if (data.flow !== 'password_reset') return null;
  return data as unknown as ResetPasswordErrorData;
}

export function isResetPasswordFailedError(error: unknown): error is ResetPasswordFailedError {
  return error instanceof ResetPasswordFailedError;
}
