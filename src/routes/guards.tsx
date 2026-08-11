import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore, roleHomePath } from '@/app/store/authStore';
import type { UserRole } from '@/types/user';
import { Spinner } from '@/components/ui/Spinner';
import { useStrings } from '@/constants/strings';
import { Button } from '@/components/ui/Button';

export function RequireAuth() {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (status === 'bootstrapping') {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[var(--color-surface-bg)]">
        <Spinner className="size-10 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export function GuardRole({ role }: { role: Exclude<UserRole, 'unknown'> }) {
  const user = useAuthStore((s) => s.user);
  if (user?.role !== role) {
    return <Navigate to={roleHomePath(user?.role ?? null)} replace />;
  }
  return <Outlet />;
}

export function RequireAdmin() {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  const tr = useStrings();

  if (status === 'bootstrapping') {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[var(--color-surface-bg)]">
        <Spinner className="size-10 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user.role !== 'admin') {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[var(--color-surface-bg)] px-6 text-center">
        <h1 className="text-xl font-semibold text-[var(--color-m-text)]">{tr.adminForbiddenTitle}</h1>
        <p className="max-w-md text-sm text-[var(--color-text-muted)]">{tr.adminForbiddenBody}</p>
        <Button type="button" variant="secondary" onClick={() => window.location.assign(roleHomePath(user.role))}>
          {tr.adminGoHome}
        </Button>
      </div>
    );
  }

  return <Outlet />;
}

export function SuspendedGate() {
  const tr = useStrings();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  if (!user) return <Outlet />;

  if (user.account_status && user.account_status !== 'active' && user.role !== 'student') {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[var(--color-surface-bg)] px-6 text-center">
        <h1 className="text-xl font-semibold text-[var(--color-m-text)]">{tr.suspendedTitle}</h1>
        <p className="max-w-md text-sm text-[var(--color-text-muted)]">
          {tr.suspendedBody}{' '}
          <span className="font-medium text-[var(--color-m-text)]">({user.account_status})</span>
        </p>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            void logout().then(() => {
              window.location.assign('/login');
            });
          }}
        >
          {tr.backToLogin}
        </Button>
      </div>
    );
  }

  return <Outlet />;
}

export function HomeRedirect() {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);

  if (status === 'bootstrapping') {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[var(--color-surface-bg)]">
        <Spinner className="size-10 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={roleHomePath(user.role)} replace />;
}
