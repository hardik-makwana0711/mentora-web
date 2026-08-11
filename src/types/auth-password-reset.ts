export type PasswordResetFlow = 'password_reset';

export type ForgotPasswordNextStep = 'enter_new_password' | 'check_delivery';

export type ForgotPasswordResponseData = {
  flow?: PasswordResetFlow;
  next_step?: ForgotPasswordNextStep;
  reset_token_in_response?: boolean;
  reset_token?: string;
  expires_in_minutes?: number;
  delivery_channel?: 'none' | 'email' | 'sms';
  recovery_identifier_type?: 'email' | 'phone';
  message: string;
};

/** Dev / legacy APIs may return only `reset_token` without `reset_token_in_response`. */
export function shouldOpenResetPasswordForm(data: ForgotPasswordResponseData): boolean {
  const token = data.reset_token?.trim();
  if (!token) return false;
  if (data.reset_token_in_response === true) return true;
  if (data.next_step === 'enter_new_password') return true;
  if (data.next_step === 'check_delivery') return false;
  if (data.reset_token_in_response === false) return false;
  return true;
}

export function shouldShowCheckDelivery(data: ForgotPasswordResponseData): boolean {
  if (data.next_step === 'check_delivery') return true;
  if (data.reset_token_in_response === false && !data.reset_token?.trim()) return true;
  return false;
}

export type ResetPasswordNextStep = 'login' | 'forgot_password_again';

export type ResetPasswordSuccessData = {
  flow?: PasswordResetFlow;
  next_step?: 'login';
  password_updated?: boolean;
  message?: string;
};

/** Any successful reset-password response should send the user to login. */
export function shouldNavigateToLoginAfterReset(data: ResetPasswordSuccessData): boolean {
  if (data.next_step === 'login') return true;
  if (data.password_updated === true) return true;
  if (data.message?.trim()) return true;
  return true;
}

export type ResetPasswordErrorData = {
  code: 'INVALID_RESET_TOKEN' | string;
  flow: PasswordResetFlow;
  next_step: 'forgot_password_again';
};
