import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useStrings } from '@/constants/strings';
import { useAuthStore, roleHomePath } from '@/app/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createLoginSchema, type LoginForm } from '@/validations/auth.schemas';
import { AuthCard, AuthLogoBlock, AuthScreenChrome } from '@/features/auth/components/AuthScreenChrome';
import { LoginVerificationPanel } from '@/features/auth/components/LoginVerificationPanel';
import { isLoginVerificationRequiredError } from '@/lib/auth-errors';
import type {
  AccountVerificationPayload,
  VerificationChannel,
} from '@/types/auth-verification';
import {
  isVerificationComplete,
  markChannelVerified,
  pickVerificationChannel,
} from '@/types/auth-verification';

type LoginPhase = 'credentials' | 'verify' | 'contact_support';

export default function LoginPage() {
  const tr = useStrings();
  const { i18n: i18nInstance } = useTranslation();
  const locale = i18nInstance.resolvedLanguage ?? i18nInstance.language;
  const loginSchema = useMemo(() => createLoginSchema(), [locale]);
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);

  const [phase, setPhase] = useState<LoginPhase>('credentials');
  const [pendingLogin, setPendingLogin] = useState<LoginForm | null>(null);
  const [verificationPayload, setVerificationPayload] = useState<AccountVerificationPayload | null>(
    null
  );
  const [verifyChannel, setVerifyChannel] = useState<VerificationChannel | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  if (status === 'ready' && user) {
    return <Navigate to={roleHomePath(user.role)} replace />;
  }

  const resetVerificationFlow = () => {
    setPhase('credentials');
    setPendingLogin(null);
    setVerificationPayload(null);
    setVerifyChannel(null);
  };

  const beginVerification = (payload: AccountVerificationPayload) => {
    const channel = pickVerificationChannel(payload);
    if (channel === 'contact_support') {
      setPhase('contact_support');
      return;
    }
    if (!channel) {
      toast.error(tr.verifyFlowUnknown);
      return;
    }
    setVerificationPayload(payload);
    setVerifyChannel(channel);
    setPhase('verify');
  };

  const finishLogin = async (credentials: LoginForm) => {
    await login(credentials.login_identifier, credentials.password);
    const u = useAuthStore.getState().user;
    navigate(roleHomePath(u?.role ?? null), { replace: true });
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      await finishLogin(values);
    } catch (e: unknown) {
      if (isLoginVerificationRequiredError(e)) {
        setPendingLogin(values);
        beginVerification(e.payload);
        queueMicrotask(() => toast.message(e.message));
        return;
      }
      const msg =
        e && typeof e === 'object' && 'normalizedMessage' in e
          ? String((e as { normalizedMessage?: string }).normalizedMessage)
          : tr.loginFailed;
      queueMicrotask(() => toast.error(msg));
    }
  });

  const handleChannelVerified = async () => {
    if (!verificationPayload || !verifyChannel || !pendingLogin) return;

    const updated = markChannelVerified(verificationPayload, verifyChannel);
    setVerificationPayload(updated);

    if (!isVerificationComplete(updated)) {
      const next = pickVerificationChannel(updated);
      if (next === 'contact_support') {
        setPhase('contact_support');
        setVerifyChannel(null);
        return;
      }
      if (next === 'email' || next === 'phone') {
        setVerifyChannel(next);
        return;
      }
      toast.error(tr.verifyFlowUnknown);
      return;
    }

    try {
      await finishLogin(pendingLogin);
    } catch (e: unknown) {
      if (isLoginVerificationRequiredError(e)) {
        setVerificationPayload(e.payload);
        beginVerification(e.payload);
        queueMicrotask(() => toast.message(e.message));
        return;
      }
      const msg =
        e && typeof e === 'object' && 'normalizedMessage' in e
          ? String((e as { normalizedMessage?: string }).normalizedMessage)
          : tr.loginFailed;
      queueMicrotask(() => toast.error(msg));
    }
  };

  const cardContent =
    phase === 'verify' && verificationPayload && verifyChannel ? (
      <LoginVerificationPanel
        channel={verifyChannel}
        payload={verificationPayload}
        onVerified={handleChannelVerified}
        onBack={resetVerificationFlow}
      />
    ) : phase === 'contact_support' ? (
      <div>
        <button
          type="button"
          onClick={resetVerificationFlow}
          className="mb-4 text-[15px] font-semibold text-[var(--color-m-primary)] hover:text-[var(--color-m-primary-light)]"
        >
          ← {tr.backToLogin}
        </button>
        <h2 className="mb-2 text-[24px] font-bold text-[var(--color-m-text)]">{tr.verifyContactSupportTitle}</h2>
        <p className="text-[15px] text-[var(--color-m-text-secondary)]">{tr.verifyContactSupportBody}</p>
      </div>
    ) : (
      <>
        <h2 className="mb-1 text-[24px] font-bold text-[var(--color-m-text)]">{tr.welcomeBackTitle}</h2>
        <p className="mb-8 text-[15px] text-[var(--color-m-text-secondary)]">{tr.welcomeBackSubtitle}</p>
        <form onSubmit={onSubmit} noValidate>
          <Input
            label={tr.emailOrPhone}
            autoComplete="username"
            placeholder={tr.emailPlaceholder}
            {...register('login_identifier')}
            error={errors.login_identifier?.message}
          />
          <Input
            label={tr.password}
            type="password"
            autoComplete="current-password"
            placeholder={tr.passwordPlaceholder}
            {...register('password')}
            error={errors.password?.message}
          />
          <div className="mb-6 text-right">
            <Link
              className="text-[15px] font-semibold text-[var(--color-m-primary)] hover:text-[var(--color-m-primary-light)]"
              to="/forgot-password"
            >
              {tr.forgotPassword}
            </Link>
          </div>
          <Button type="submit" size="lg" fullWidth isLoading={isSubmitting}>
            {tr.login}
          </Button>
        </form>
        <p className="mt-6 text-center text-[15px] text-[var(--color-m-text-secondary)]">
          {tr.noAccountPrompt}{' '}
          <Link className="font-bold text-[var(--color-m-primary)] hover:underline" to="/register">
            {tr.signUpLink}
          </Link>
        </p>
      </>
    );

  return (
    <AuthScreenChrome card={<AuthCard>{cardContent}</AuthCard>}>
      <AuthLogoBlock appName={tr.appName} tagline={tr.tagline} />
    </AuthScreenChrome>
  );
}
