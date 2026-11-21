import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useStrings } from '@/constants/strings';
import { useAuthStore, roleHomePath } from '@/app/store/authStore';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';

/**
 * "Continue with Google" for the login and register pages.
 *
 * Uses Google Identity Services (official button) to get an ID token, then calls
 * POST /api/v1/auth/google. Existing parent / mentor accounts sign in straight away; a first-time
 * Google user picks Parent or Mentor and accepts the terms, as the API requires.
 *
 * Hidden unless VITE_GOOGLE_CLIENT_ID is set at build time (the same client ID must be in the
 * backend's GOOGLE_OAUTH_CLIENT_IDS).
 */

const CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '').trim();
const GSI_SRC = 'https://accounts.google.com/gsi/client';

type GoogleCredentialResponse = { credential?: string };
type GoogleIdApi = {
  initialize: (cfg: {
    client_id: string;
    callback: (r: GoogleCredentialResponse) => void;
    ux_mode?: 'popup' | 'redirect';
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
  }) => void;
  renderButton: (el: HTMLElement, opts: Record<string, unknown>) => void;
};
declare global {
  interface Window {
    google?: { accounts?: { id?: GoogleIdApi } };
  }
}

let gsiPromise: Promise<GoogleIdApi> | null = null;
function loadGoogleIdentity(): Promise<GoogleIdApi> {
  if (window.google?.accounts?.id) return Promise.resolve(window.google.accounts.id);
  if (!gsiPromise) {
    gsiPromise = new Promise<GoogleIdApi>((resolve, reject) => {
      const done = () =>
        window.google?.accounts?.id ? resolve(window.google.accounts.id) : reject(new Error('gsi'));
      const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`);
      const s = existing ?? document.createElement('script');
      s.addEventListener('load', done, { once: true });
      s.addEventListener('error', () => reject(new Error('gsi')), { once: true });
      if (!existing) {
        s.src = GSI_SRC;
        s.async = true;
        s.defer = true;
        document.head.appendChild(s);
      }
    }).catch((e: unknown) => {
      gsiPromise = null;
      throw e;
    });
  }
  return gsiPromise as Promise<GoogleIdApi>;
}

export const isGoogleSignInEnabled = CLIENT_ID.length > 0;

type NewAccountRole = 'parent' | 'mentor';

function apiMessage(e: unknown): string | undefined {
  if (isAxiosError(e)) return (e.response?.data as { message?: string } | undefined)?.message;
  return undefined;
}

export function GoogleAuthSection({ mode }: { mode: 'login' | 'register' }) {
  const tr = useStrings();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  // First-time Google user: keep the ID token while they choose a role
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [role, setRole] = useState<NewAccountRole | null>(null);
  const [terms, setTerms] = useState(false);

  const lang = (i18n.resolvedLanguage ?? i18n.language ?? 'en').startsWith('tr') ? 'tr' : 'en';

  const finish = () => {
    const u = useAuthStore.getState().user;
    navigate(roleHomePath(u?.role ?? null), { replace: true });
  };

  const handleCredential = async (idToken: string) => {
    setBusy(true);
    try {
      await loginWithGoogle({ id_token: idToken });
      finish();
    } catch (e) {
      const status = isAxiosError(e) ? e.response?.status : undefined;
      const msg = apiMessage(e) ?? '';
      // New Google user: the API needs a role and terms acceptance
      if (status === 400 && /role is required|terms_accepted/i.test(msg)) {
        setPendingToken(idToken);
        return;
      }
      if (status === 503) toast.error(tr.googleSignInUnavailable);
      else if (status === 403) toast.error(msg || tr.googleSignInNotAllowed);
      else toast.error(msg || tr.googleSignInFailed);
    } finally {
      setBusy(false);
    }
  };

  // Keep the latest handler for the Google callback (initialised once per render of the button)
  const handlerRef = useRef(handleCredential);
  handlerRef.current = handleCredential;

  useEffect(() => {
    if (!isGoogleSignInEnabled) return;
    let cancelled = false;
    loadGoogleIdentity()
      .then((gid) => {
        if (cancelled || !buttonRef.current) return;
        gid.initialize({
          client_id: CLIENT_ID,
          ux_mode: 'popup',
          auto_select: false,
          cancel_on_tap_outside: true,
          callback: (r) => {
            if (r.credential) void handlerRef.current(r.credential);
          },
        });
        const dark = document.documentElement.getAttribute('data-theme') === 'dark';
        const width = Math.min(
          400,
          Math.max(200, Math.round(buttonRef.current.clientWidth || 320))
        );
        buttonRef.current.innerHTML = '';
        gid.renderButton(buttonRef.current, {
          type: 'standard',
          theme: dark ? 'filled_black' : 'outline',
          size: 'large',
          shape: 'pill',
          text: mode === 'register' ? 'signup_with' : 'continue_with',
          logo_alignment: 'center',
          width,
          locale: lang,
        });
      })
      .catch(() => !cancelled && setLoadFailed(true));
    return () => {
      cancelled = true;
    };
  }, [mode, lang]);

  if (!isGoogleSignInEnabled) return null;

  const completeSignup = async () => {
    if (!pendingToken || !role || !terms) return;
    setBusy(true);
    try {
      await loginWithGoogle({ id_token: pendingToken, role, terms_accepted: true });
      setPendingToken(null);
      finish();
    } catch (e) {
      const status = isAxiosError(e) ? e.response?.status : undefined;
      // Google ID tokens are short-lived: ask them to press the button again
      if (status === 401) {
        setPendingToken(null);
        toast.error(tr.googleSignInExpired);
      } else {
        toast.error(apiMessage(e) || tr.googleSignInFailed);
      }
    } finally {
      setBusy(false);
    }
  };

  const roles: { id: NewAccountRole; title: string; body: string }[] = [
    { id: 'parent', title: tr.roleParent, body: tr.googleRoleParentHint },
    { id: 'mentor', title: tr.roleMentor, body: tr.googleRoleMentorHint },
  ];

  return (
    <div className="mt-6">
      <div className="mb-5 flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-[var(--color-m-card-border)]" />
        <span className="text-[13px] font-semibold text-[var(--color-m-text-muted)]">
          {tr.orDivider}
        </span>
        <span className="h-px flex-1 bg-[var(--color-m-card-border)]" />
      </div>

      <div
        className={cn(
          'flex min-h-[44px] w-full justify-center',
          busy && 'pointer-events-none opacity-60'
        )}
        aria-busy={busy}
      >
        <div ref={buttonRef} className="w-full max-w-[400px] [&>div]:mx-auto" />
      </div>
      {loadFailed ? (
        <p className="mt-2 text-center text-xs text-[var(--color-m-text-muted)]">
          {tr.googleSignInLoadFailed}
        </p>
      ) : (
        <p className="mt-3 text-center text-xs leading-relaxed text-[var(--color-m-text-muted)]">
          {tr.googleSignInRolesNote}
        </p>
      )}

      <Modal
        open={pendingToken !== null}
        title={tr.googleFinishTitle}
        onClose={() => !busy && setPendingToken(null)}
        footer={
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              disabled={busy}
              onClick={() => setPendingToken(null)}
            >
              {tr.cancel}
            </Button>
            <Button
              type="button"
              className="flex-[2]"
              isLoading={busy}
              disabled={!role || !terms}
              onClick={() => void completeSignup()}
            >
              {tr.googleFinishCta}
            </Button>
          </div>
        }
      >
        <p className="mb-4 text-[15px] text-[var(--color-m-text-secondary)]">
          {tr.googleFinishBody}
        </p>
        <div
          role="radiogroup"
          aria-label={tr.googleFinishRoleLabel}
          className="mb-4 grid gap-3 sm:grid-cols-2"
        >
          {roles.map((r) => (
            <button
              key={r.id}
              type="button"
              role="radio"
              aria-checked={role === r.id}
              onClick={() => setRole(r.id)}
              className={cn(
                'rounded-xl border-2 p-4 text-left transition-colors',
                role === r.id
                  ? 'border-[var(--color-brand-primary)] bg-[var(--color-m-primary)]/10'
                  : 'border-[var(--color-m-card-border)] bg-[var(--color-m-card)] hover:border-[var(--color-m-primary-text)]'
              )}
            >
              <span className="block text-base font-bold text-[var(--color-m-text)]">
                {r.title}
              </span>
              <span className="mt-1 block text-[13px] leading-snug text-[var(--color-m-text-secondary)]">
                {r.body}
              </span>
            </button>
          ))}
        </div>
        <label className="flex cursor-pointer items-start gap-3 text-[14px] text-[var(--color-m-text-secondary)]">
          <input
            type="checkbox"
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
            className="mt-0.5 size-5 shrink-0 accent-[var(--color-brand-primary)]"
          />
          <span>
            {tr.googleFinishTermsPrefix}{' '}
            <Link
              to="/terms-and-conditions"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-[var(--color-m-primary-text)] underline underline-offset-2"
            >
              {tr.termsAndConditions}
            </Link>{' '}
            {tr.registerLegalAgreementJoiner}{' '}
            <Link
              to="/privacy-policy"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-[var(--color-m-primary-text)] underline underline-offset-2"
            >
              {tr.privacyPolicy}
            </Link>
          </span>
        </label>
      </Modal>
    </div>
  );
}
