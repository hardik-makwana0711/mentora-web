import type { AxiosError } from 'axios';
import { apiClient, setAuthHeader } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import {
  LoginVerificationRequiredError,
  ResetPasswordFailedError,
  parseAccountVerificationPayload,
  parseResetPasswordErrorPayload,
} from '@/lib/auth-errors';
import type {
  ForgotPasswordResponseData,
  ResetPasswordSuccessData,
} from '@/types/auth-password-reset';
import { tokenStorage } from '@/lib/token-storage';
import type { VerificationChannel } from '@/types/auth-verification';
import type { SessionTokens, User } from '@/types/user';

export interface LoginInput {
  login_identifier: string;
  password: string;
}

export interface SignupInput {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password: string;
  confirm_password: string;
  role: 'parent' | 'mentor' | 'student';
  terms_accepted: boolean;
}

export interface VerifyAccountInput {
  verification_method: VerificationChannel;
  verification_target: string;
  otp_code: string;
}

export interface ResendVerificationInput {
  verification_method: VerificationChannel;
  verification_target: string;
}

export const authService = {
  async login(input: LoginInput): Promise<{ tokens: SessionTokens; user: User }> {
    try {
      const { data } = await apiClient.post<{ tokens: SessionTokens; user: User }>(
        endpoints.auth.login,
        input
      );
      return data;
    } catch (error) {
      const axiosError = error as AxiosError;
      const payload = parseAccountVerificationPayload(axiosError);
      if (payload) {
        const message =
          (axiosError.response?.data as { message?: string } | undefined)?.message ??
          'Hesap doğrulanmadı. Giriş yapmadan önce e-posta ve telefon doğrulamasını tamamlayın.';
        throw new LoginVerificationRequiredError(message, payload);
      }
      throw error;
    }
  },

  async verifyAccount(input: VerifyAccountInput): Promise<{ user?: User; message?: string }> {
    const { data } = await apiClient.post<{ user?: User; message?: string }>(
      endpoints.auth.verify,
      input
    );
    return data;
  },

  async resendVerification(input: ResendVerificationInput): Promise<{ message: string }> {
    const { data } = await apiClient.post<{ message: string }>(
      endpoints.auth.resendVerification,
      input
    );
    return data;
  },

  async me(): Promise<{ user: User; verification?: { email_verified: boolean; phone_verified: boolean } }> {
    const { data } = await apiClient.get<{
      user: User;
      verification?: { email_verified: boolean; phone_verified: boolean };
    }>(endpoints.auth.me, {
      params: { t: Date.now() },
      headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache', Expires: '0' },
    });
    return data;
  },

  async logout(): Promise<void> {
    const refresh = tokenStorage.getRefreshToken();
    if (refresh) {
      try {
        await apiClient.post(endpoints.auth.logout, { refresh_token: refresh });
      } catch {
        /* still clear local session */
      }
    }
    tokenStorage.clear();
    setAuthHeader(null);
  },

  async forgotPassword(recovery_identifier: string): Promise<ForgotPasswordResponseData> {
    const { data } = await apiClient.post<ForgotPasswordResponseData>(endpoints.auth.forgotPassword, {
      recovery_identifier,
    });
    return data;
  },

  async resetPassword(input: {
    reset_token: string;
    new_password: string;
    confirm_new_password: string;
  }): Promise<ResetPasswordSuccessData> {
    try {
      const { data } = await apiClient.post<ResetPasswordSuccessData>(
        endpoints.auth.resetPassword,
        input
      );
      return data;
    } catch (error) {
      const axiosError = error as AxiosError;
      const payload = parseResetPasswordErrorPayload(axiosError);
      if (payload) {
        const message =
          (axiosError.response?.data as { message?: string } | undefined)?.message ??
          'Invalid or expired reset token';
        throw new ResetPasswordFailedError(message, payload);
      }
      throw error;
    }
  },

  async signup(input: SignupInput): Promise<{ user: User }> {
    const { data } = await apiClient.post<{ user: User }>(endpoints.auth.signup, input);
    return data;
  },
};
