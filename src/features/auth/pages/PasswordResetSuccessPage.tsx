import { CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStrings } from '@/constants/strings';
import { Button } from '@/components/ui/Button';
import {
  AuthCard,
  AuthLogoBlock,
  AuthScreenChrome,
} from '@/features/auth/components/AuthScreenChrome';

export default function PasswordResetSuccessPage() {
  const tr = useStrings();
  const navigate = useNavigate();

  return (
    <AuthScreenChrome
      card={
        <AuthCard>
          <div className="flex flex-col items-center text-center">
            <CheckCircle2 className="mb-4 size-14 text-[var(--color-m-primary)]" aria-hidden />
            <h2 className="mb-1 text-[24px] font-bold text-[var(--color-m-text)]">
              {tr.resetPasswordSuccessTitle}
            </h2>
            <p className="mb-8 text-[15px] text-[var(--color-m-text-secondary)]">
              {tr.resetPasswordSuccess}
            </p>
            <Button
              type="button"
              size="lg"
              fullWidth
              onClick={() => navigate('/login', { replace: true })}
            >
              {tr.backToLogin}
            </Button>
          </div>
        </AuthCard>
      }
    >
      <AuthLogoBlock appName={tr.appName} tagline={tr.tagline} />
    </AuthScreenChrome>
  );
}
