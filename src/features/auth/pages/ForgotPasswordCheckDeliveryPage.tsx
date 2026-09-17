import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useStrings } from '@/constants/strings';
import i18n from '@/i18n';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  AuthCard,
  AuthLogoBlock,
  AuthScreenChrome,
} from '@/features/auth/components/AuthScreenChrome';

const RESEND_SECONDS = 60;

type LocationState = {
  recoveryIdentifier?: string;
};

export default function ForgotPasswordCheckDeliveryPage() {
  const tr = useStrings();
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state ?? {}) as LocationState;

  const [timeLeft, setTimeLeft] = useState(RESEND_SECONDS);
  const [isResending, setIsResending] = useState(false);
  const [code, setCode] = useState('');

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = window.setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [timeLeft]);

  const handleVerify = () => {
    const trimmed = code.trim();
    if (!trimmed) {
      toast.error(tr.resetCodeRequired);
      return;
    }
    navigate('/reset-password', { state: { reset_token: trimmed } });
  };

  const handleResend = async () => {
    if (timeLeft > 0 || !state.recoveryIdentifier) return;
    setIsResending(true);
    try {
      await authService.forgotPassword(state.recoveryIdentifier);
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
    <AuthScreenChrome
      card={
        <AuthCard>
          <h2 className="mb-1 text-[24px] font-bold text-[var(--color-m-text)]">
            {tr.resetVerifyTitle}
          </h2>
          <p className="mb-2 text-[15px] text-[var(--color-m-text-secondary)]">
            {tr.resetVerifySubtitle}
          </p>
          {state.recoveryIdentifier ? (
            <p className="mb-6 text-[15px] font-semibold text-[var(--color-m-primary-light)]">
              {state.recoveryIdentifier}
            </p>
          ) : null}

          <Input
            label={tr.verificationCode}
            placeholder={tr.otpPlaceholder}
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

          <Button type="button" size="lg" fullWidth onClick={handleVerify}>
            {tr.verifyAndContinue}
          </Button>

          {state.recoveryIdentifier ? (
            <p className="mt-6 text-center text-[15px] text-[var(--color-m-text-secondary)]">
              {tr.verifyResendPrompt}{' '}
              <button
                type="button"
                disabled={timeLeft > 0 || isResending}
                onClick={() => void handleResend()}
                className="font-bold text-[var(--color-m-primary)] disabled:text-[var(--color-m-text-muted)]"
              >
                {timeLeft > 0
                  ? i18n.t('verifyResendIn', { seconds: timeLeft })
                  : tr.verifyResendNow}
              </button>
            </p>
          ) : null}

          <p className="mt-6 text-center text-[15px]">
            <Link
              className="font-semibold text-[var(--color-m-primary)] hover:underline"
              to="/login"
            >
              {tr.backToLogin}
            </Link>
          </p>
        </AuthCard>
      }
    >
      <AuthLogoBlock appName={tr.appName} tagline={tr.tagline} />
    </AuthScreenChrome>
  );
}
