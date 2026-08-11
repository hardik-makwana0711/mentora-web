import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useStrings } from '@/constants/strings';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createForgotSchema, type ForgotForm } from '@/validations/auth.schemas';
import {
  shouldOpenResetPasswordForm,
  shouldShowCheckDelivery,
} from '@/types/auth-password-reset';
import { AuthCard, AuthLogoBlock, AuthScreenChrome } from '@/features/auth/components/AuthScreenChrome';

export default function ForgotPasswordPage() {
  const tr = useStrings();
  const { i18n: i18nInstance } = useTranslation();
  const locale = i18nInstance.resolvedLanguage ?? i18nInstance.language;
  const forgotSchema = useMemo(() => createForgotSchema(), [locale]);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotForm>({ resolver: zodResolver(forgotSchema) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const data = await authService.forgotPassword(values.recovery_identifier);

      if (shouldOpenResetPasswordForm(data)) {
        navigate('/reset-password', {
          replace: true,
          state: { reset_token: data.reset_token!.trim() },
        });
        return;
      }

      if (shouldShowCheckDelivery(data)) {
        const deliveryChannel =
          data.delivery_channel === 'sms'
            ? 'sms'
            : data.delivery_channel === 'email'
              ? 'email'
              : undefined;
        navigate('/forgot-password/sent', {
          replace: true,
          state: { message: data.message, deliveryChannel },
        });
        return;
      }

      queueMicrotask(() => toast.message(data.message));
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'normalizedMessage' in e
          ? String((e as { normalizedMessage?: string }).normalizedMessage)
          : tr.forgotPasswordFailed;
      queueMicrotask(() => toast.error(msg));
    }
  });

  return (
    <AuthScreenChrome
      card={
        <AuthCard>
          <h2 className="mb-1 text-[24px] font-bold text-[var(--color-m-text)]">{tr.forgotPassword}</h2>
          <p className="mb-8 text-[15px] text-[var(--color-m-text-secondary)]">{tr.forgotCardSubtitle}</p>
          <form onSubmit={onSubmit} noValidate>
            <Input
              label={tr.emailOrPhone}
              autoComplete="username"
              {...register('recovery_identifier')}
              error={errors.recovery_identifier?.message}
            />
            <Button type="submit" size="lg" fullWidth isLoading={isSubmitting}>
              {tr.submit}
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
