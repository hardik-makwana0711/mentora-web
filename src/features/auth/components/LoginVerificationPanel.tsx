import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useStrings } from '@/constants/strings';
import i18n from '@/i18n';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { AccountVerificationPayload, VerificationChannel } from '@/types/auth-verification';
import { verificationTargetFor } from '@/types/auth-verification';

const DEV_FIXED_OTP = '456789';
const RESEND_SECONDS = 60;

type Props = {
  channel: VerificationChannel;
  payload: AccountVerificationPayload;
  onVerified: () => void | Promise<void>;
  onBack: () => void;
};

export function LoginVerificationPanel({ channel, payload, onVerified, onBack }: Props) {
  const tr = useStrings();
  const target = verificationTargetFor(payload, channel);
  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(RESEND_SECONDS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = window.setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [timeLeft]);

  const subtitle =
    channel === 'email' ? tr.verifyEmailSubtitle : tr.verifyPhoneSubtitle;

  const handleVerify = async () => {
    const code = otp.trim();
    if (code.length < 6) {
      toast.error(tr.verifyCodeIncomplete);
      return;
    }
    if (!target) {
      toast.error(tr.verifyTargetMissing);
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.verifyAccount({
        verification_method: channel,
        verification_target: target,
        otp_code: code,
      });
      toast.success(tr.verifySuccess);
      await onVerified();
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'normalizedMessage' in e
          ? String((e as { normalizedMessage?: string }).normalizedMessage)
          : tr.verifyFailed;
      toast.error(msg);
      setOtp('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (timeLeft > 0 || !target) return;
    setIsResending(true);
    try {
      await authService.resendVerification({
        verification_method: channel,
        verification_target: target,
      });
      setTimeLeft(RESEND_SECONDS);
      toast.success(tr.verifyResent);
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'normalizedMessage' in e
          ? String((e as { normalizedMessage?: string }).normalizedMessage)
          : tr.verifyResendFailed;
      toast.error(msg);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-4 text-[15px] font-semibold text-[var(--color-m-primary)] hover:text-[var(--color-m-primary-light)]"
      >
        ← {tr.backToLogin}
      </button>
      <h2 className="mb-1 text-[24px] font-bold text-[var(--color-m-text)]">{tr.verifyTitle}</h2>
      <p className="mb-2 text-[15px] text-[var(--color-m-text-secondary)]">{subtitle}</p>
      <p className="mb-6 text-[15px] font-semibold text-[var(--color-m-primary-light)]">{target}</p>

      {payload.dev_fixed_otp_enabled ? (
        <p className="mb-4 rounded-lg border border-[var(--color-m-card-border)] bg-[var(--color-m-surface-light)] px-3 py-2 text-[13px] text-[var(--color-m-text-secondary)]">
          {i18n.t('devOtpHint', { code: DEV_FIXED_OTP })}
        </p>
      ) : null}

      <Input
        label={tr.verificationCode}
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        placeholder={tr.otpPlaceholder}
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
      />

      <Button type="button" size="lg" fullWidth isLoading={isSubmitting} onClick={handleVerify}>
        {tr.verifyAndContinue}
      </Button>

      <p className="mt-6 text-center text-[15px] text-[var(--color-m-text-secondary)]">
        {tr.verifyResendPrompt}{' '}
        <button
          type="button"
          disabled={timeLeft > 0 || isResending}
          onClick={handleResend}
          className="font-bold text-[var(--color-m-primary)] disabled:text-[var(--color-m-text-muted)]"
        >
          {timeLeft > 0 ? i18n.t('verifyResendIn', { seconds: timeLeft }) : tr.verifyResendNow}
        </button>
      </p>
    </div>
  );
}
