import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useStrings } from '@/constants/strings';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { isResetPasswordFailedError } from '@/lib/auth-errors';
import { createResetPasswordSchema, type ResetPasswordForm } from '@/validations/auth.schemas';
import { shouldNavigateToLoginAfterReset } from '@/types/auth-password-reset';
import { AuthCard, AuthLogoBlock, AuthScreenChrome } from '@/features/auth/components/AuthScreenChrome';

type LocationState = {
  reset_token?: string;
};

export default function ResetPasswordPage() {
  const tr = useStrings();
  const { i18n: i18nInstance } = useTranslation();
  const locale = i18nInstance.resolvedLanguage ?? i18nInstance.language;
  const resetPasswordSchema = useMemo(() => createResetPasswordSchema(), [locale]);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const resetToken = useMemo(() => {
    const fromQuery = searchParams.get('token')?.trim();
    const fromState = (location.state as LocationState | null)?.reset_token?.trim();
    return fromQuery || fromState || '';
  }, [location.state, searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordForm>({ resolver: zodResolver(resetPasswordSchema) });

  if (!resetToken) {
    return <Navigate to="/forgot-password" replace />;
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      const result = await authService.resetPassword({
        reset_token: resetToken,
        new_password: values.new_password,
        confirm_new_password: values.confirm_new_password,
      });

      if (shouldNavigateToLoginAfterReset(result)) {
        queueMicrotask(() => toast.success(result.message || tr.resetPasswordSuccess));
        navigate('/login', { replace: true });
        return;
      }

      queueMicrotask(() => toast.message(result.message || tr.resetPasswordSuccess));
    } catch (e: unknown) {
      if (isResetPasswordFailedError(e) && e.payload.next_step === 'forgot_password_again') {
        queueMicrotask(() => toast.error(e.message));
        navigate('/forgot-password', { replace: true });
        return;
      }
      const msg =
        e && typeof e === 'object' && 'normalizedMessage' in e
          ? String((e as { normalizedMessage?: string }).normalizedMessage)
          : tr.resetPasswordFailed;
      queueMicrotask(() => toast.error(msg));
    }
  });

  return (
    <AuthScreenChrome
      card={
        <AuthCard>
          <h2 className="mb-1 text-[24px] font-bold text-[var(--color-m-text)]">{tr.resetPasswordTitle}</h2>
          <p className="mb-8 text-[15px] text-[var(--color-m-text-secondary)]">{tr.resetPasswordSubtitle}</p>
          <form onSubmit={onSubmit} noValidate>
            <Input
              label={tr.newPassword}
              type="password"
              autoComplete="new-password"
              placeholder={tr.passwordPlaceholder}
              {...register('new_password')}
              error={errors.new_password?.message}
            />
            <Input
              label={tr.confirmNewPassword}
              type="password"
              autoComplete="new-password"
              placeholder={tr.passwordPlaceholder}
              {...register('confirm_new_password')}
              error={errors.confirm_new_password?.message}
            />
            <Button type="submit" size="lg" fullWidth isLoading={isSubmitting}>
              {tr.resetPasswordSubmit}
            </Button>
          </form>
          <p className="mt-6 text-center text-[15px]">
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
