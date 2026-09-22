import { useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useStrings } from '@/constants/strings';
import { useAuthStore, roleHomePath } from '@/app/store/authStore';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { DropdownSelect } from '@/components/ui/DropdownSelect';
import { Checkbox } from '@/components/ui/Checkbox';
import { createRegisterSchema, type RegisterForm } from '@/validations/auth.schemas';
import {
  AuthCard,
  AuthLogoBlock,
  AuthScreenChrome,
} from '@/features/auth/components/AuthScreenChrome';
import { LoginVerificationPanel } from '@/features/auth/components/LoginVerificationPanel';
import { isLoginVerificationRequiredError } from '@/lib/auth-errors';
import type { AccountVerificationPayload, VerificationChannel } from '@/types/auth-verification';
import {
  isVerificationComplete,
  markChannelVerified,
  pickVerificationChannel,
} from '@/types/auth-verification';

type RegisterPhase = 'form' | 'verify';

export default function RegisterPage() {
  const tr = useStrings();
  const { i18n: i18nInstance } = useTranslation();
  const locale = i18nInstance.resolvedLanguage ?? i18nInstance.language;
  // `locale` drives i18n.t() inside createRegisterSchema, invisible to static analysis — must stay to refresh messages on language change.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const registerSchema = useMemo(() => createRegisterSchema(), [locale]);
  const roleOptions = useMemo(
    () => [
      { value: 'parent' as const, label: tr.roleParent },
      { value: 'mentor' as const, label: tr.roleMentor },
    ],
    [tr.roleParent, tr.roleMentor]
  );
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);

  const [phase, setPhase] = useState<RegisterPhase>('form');
  const [verificationPayload, setVerificationPayload] = useState<AccountVerificationPayload | null>(
    null
  );
  const [verifyChannel, setVerifyChannel] = useState<VerificationChannel | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'parent',
      terms_accepted: false,
    },
  });

  if (status === 'ready' && user) {
    return <Navigate to={roleHomePath(user.role)} replace />;
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      await authService.signup({
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        phone_number: values.phone_number,
        password: values.password,
        confirm_password: values.confirm_password,
        role: values.role,
        terms_accepted: values.terms_accepted,
      });
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'normalizedMessage' in e
          ? String((e as { normalizedMessage?: string }).normalizedMessage)
          : tr.registerFailed;
      queueMicrotask(() => toast.error(msg));
      return;
    }

    // Signup doesn't report which channels still need verification, so probe via
    // login: it fails with ACCOUNT_VERIFICATION_REQUIRED and the real, backend-known
    // requirements (never assume both email and phone are needed — the backend may
    // only require one).
    try {
      await authService.login({ login_identifier: values.email, password: values.password });
      navigate('/login', { replace: true });
      queueMicrotask(() => toast.success(tr.registerSuccess));
      return;
    } catch (e: unknown) {
      if (isLoginVerificationRequiredError(e)) {
        const channel = pickVerificationChannel(e.payload);
        if (channel === 'email' || channel === 'phone') {
          setVerificationPayload(e.payload);
          setVerifyChannel(channel);
          setPhase('verify');
          return;
        }
      }
      // Account is created either way; send the user to log in and let that
      // flow surface whatever verification step is actually required.
      navigate('/login', { replace: true });
      queueMicrotask(() => toast.success(tr.registerSuccess));
    }
  });

  const handleChannelVerified = async () => {
    if (!verificationPayload || !verifyChannel) return;
    const updated = markChannelVerified(verificationPayload, verifyChannel);
    setVerificationPayload(updated);

    if (!isVerificationComplete(updated)) {
      const next = pickVerificationChannel(updated);
      if (next === 'email' || next === 'phone') {
        setVerifyChannel(next);
        return;
      }
    }

    navigate('/login', { replace: true });
    queueMicrotask(() => toast.success(tr.registerSuccess));
  };

  if (phase === 'verify' && verificationPayload && verifyChannel) {
    return (
      <AuthScreenChrome
        card={
          <AuthCard>
            <LoginVerificationPanel
              channel={verifyChannel}
              payload={verificationPayload}
              onVerified={handleChannelVerified}
              onBack={() => navigate('/login', { replace: true })}
            />
          </AuthCard>
        }
      >
        <AuthLogoBlock appName={tr.appName} tagline={tr.tagline} />
      </AuthScreenChrome>
    );
  }

  return (
    <AuthScreenChrome
      card={
        <AuthCard>
          <h2 className="mb-1 text-[24px] font-bold text-[var(--color-m-text)]">
            {tr.registerCardTitle}
          </h2>
          <p className="mb-8 text-[15px] text-[var(--color-m-text-secondary)]">
            {tr.registerCardSubtitle}
          </p>
          <form onSubmit={onSubmit} noValidate>
            <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 sm:gap-4">
              <Input
                label={tr.firstName}
                {...register('first_name')}
                error={errors.first_name?.message}
              />
              <Input
                label={tr.lastName}
                {...register('last_name')}
                error={errors.last_name?.message}
              />
            </div>
            <Input
              label={tr.email}
              type="email"
              autoComplete="email"
              {...register('email')}
              error={errors.email?.message}
            />
            <Input
              label={tr.phone}
              autoComplete="tel"
              {...register('phone_number')}
              error={errors.phone_number?.message}
            />
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <DropdownSelect
                  label={tr.role}
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  options={roleOptions}
                  error={errors.role?.message}
                />
              )}
            />
            <PasswordInput
              label={tr.password}
              autoComplete="new-password"
              {...register('password')}
              error={errors.password?.message}
            />
            <PasswordInput
              label={tr.confirmPassword}
              autoComplete="new-password"
              {...register('confirm_password')}
              error={errors.confirm_password?.message}
            />
            <p className="mb-2 text-[13px] text-[var(--color-m-text-muted)]">
              {tr.registerLegalAgreementPrefix}{' '}
              <Link
                to="/privacy-policy"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2 hover:text-[var(--color-m-primary)]"
              >
                {tr.privacyPolicy}
              </Link>{' '}
              {tr.registerLegalAgreementJoiner}{' '}
              <Link
                to="/terms-and-conditions"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2 hover:text-[var(--color-m-primary)]"
              >
                {tr.termsAndConditions}
              </Link>
            </p>
            <Checkbox
              label={tr.termsAccepted}
              {...register('terms_accepted', { setValueAs: (v) => v === true })}
            />
            {errors.terms_accepted?.message ? (
              <span className="mb-4 block text-[11px] text-[var(--color-m-error)]">
                {errors.terms_accepted.message}
              </span>
            ) : null}
            <Button type="submit" size="lg" fullWidth isLoading={isSubmitting} className="mt-2">
              {tr.register}
            </Button>
          </form>
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
