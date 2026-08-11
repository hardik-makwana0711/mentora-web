import { Link, useLocation } from 'react-router-dom';
import { useStrings } from '@/constants/strings';
import { AuthCard, AuthLogoBlock, AuthScreenChrome } from '@/features/auth/components/AuthScreenChrome';

type LocationState = {
  message?: string;
  deliveryChannel?: 'email' | 'sms';
};

export default function ForgotPasswordCheckDeliveryPage() {
  const tr = useStrings();
  const location = useLocation();
  const state = (location.state ?? {}) as LocationState;

  const hint =
    state.deliveryChannel === 'sms' ? tr.resetCheckDeliverySms : tr.resetCheckDeliveryEmail;

  return (
    <AuthScreenChrome
      card={
        <AuthCard>
          <h2 className="mb-1 text-[24px] font-bold text-[var(--color-m-text)]">
            {tr.resetCheckDeliveryTitle}
          </h2>
          <p className="mb-4 text-[15px] text-[var(--color-m-text-secondary)]">{hint}</p>
          {state.message ? (
            <p className="mb-8 text-[14px] text-[var(--color-m-text-muted)]">{state.message}</p>
          ) : (
            <p className="mb-8 text-[14px] text-[var(--color-m-text-muted)]">{tr.forgotCardSubtitle}</p>
          )}
          <p className="text-center text-[15px]">
            <Link className="font-semibold text-[var(--color-m-primary)] hover:underline" to="/login">
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
