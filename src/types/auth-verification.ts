export type VerificationNextStep =
  | 'verify_email'
  | 'verify_phone'
  | 'verify_email_and_phone'
  | 'contact_support';

export type AccountVerificationPayload = {
  code: 'ACCOUNT_VERIFICATION_REQUIRED' | string;
  account_status?: string;
  role?: string;
  dev_fixed_otp_enabled?: boolean;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  requires_email_verification: boolean;
  requires_phone_verification: boolean;
  next_step: VerificationNextStep;
  verification_targets: {
    email?: string;
    phone_number?: string;
  };
};

export type VerificationChannel = 'email' | 'phone';

export function pickVerificationChannel(
  payload: AccountVerificationPayload
): VerificationChannel | 'contact_support' | null {
  if (payload.next_step === 'contact_support') return 'contact_support';

  if (payload.next_step === 'verify_email') return 'email';
  if (payload.next_step === 'verify_phone') return 'phone';

  if (payload.next_step === 'verify_email_and_phone') {
    if (payload.requires_email_verification && !payload.is_email_verified) return 'email';
    if (payload.requires_phone_verification && !payload.is_phone_verified) return 'phone';
    return null;
  }

  if (payload.requires_email_verification && !payload.is_email_verified) return 'email';
  if (payload.requires_phone_verification && !payload.is_phone_verified) return 'phone';
  return null;
}

export function verificationTargetFor(
  payload: AccountVerificationPayload,
  channel: VerificationChannel
): string {
  if (channel === 'email') {
    return payload.verification_targets.email ?? '';
  }
  return payload.verification_targets.phone_number ?? '';
}

/** After one channel succeeds, advance local state for combined flows. */
export function markChannelVerified(
  payload: AccountVerificationPayload,
  channel: VerificationChannel
): AccountVerificationPayload {
  return {
    ...payload,
    is_email_verified: channel === 'email' ? true : payload.is_email_verified,
    is_phone_verified: channel === 'phone' ? true : payload.is_phone_verified,
  };
}

export function isVerificationComplete(payload: AccountVerificationPayload): boolean {
  const emailOk = !payload.requires_email_verification || payload.is_email_verified;
  const phoneOk = !payload.requires_phone_verification || payload.is_phone_verified;
  return emailOk && phoneOk;
}
