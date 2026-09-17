import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LogoutConfirmModal } from '@/features/profile/components/LogoutConfirmModal';
import { profileService } from '@/services/profile.service';
import { qk } from '@/constants/query-keys';
import { Bell, LogOut, Menu, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStrings } from '@/constants/strings';
import { useAuthStore } from '@/app/store/authStore';
import { Drawer } from '@/components/ui/Drawer';
import { AppLogo } from '@/components/layouts/AppLogo';
import { AppChromeControls } from '@/components/ui/AppChromeControls';
import { ProfileMenuDropdown } from '@/components/layouts/ProfileMenuDropdown';
import { getDateFnsLocale } from '@/lib/date-locale';
import { cn } from '@/lib/utils';
import { useUnreadMessageTotal } from '@/features/messages/hooks/useUnreadMessageTotal';
import { useMentorVerificationGate } from '@/features/mentor-verification/hooks/useMentorVerificationGate';
import type { NavItem } from '@/components/layouts/nav-config';

function formatUnreadBadge(count: number): string {
  return count > 9 ? '9+' : String(count);
}

function SidebarNavLink({
  item,
  label,
  unreadTotal,
  unreadBadgeAria,
  onNavigate,
  locked,
  lockedAria,
}: {
  item: NavItem;
  label: string;
  unreadTotal: number;
  unreadBadgeAria: (count: number) => string;
  onNavigate?: () => void;
  locked?: boolean;
  lockedAria?: string;
}) {
  const showBadge = item.labelKey === 'navMessages' && unreadTotal > 0;
  return (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      className={({ isActive }) => cn(navClass(isActive), showBadge && 'relative')}
      end={item.to.endsWith('/dashboard')}
    >
      <item.icon aria-hidden />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {locked ? (
        <Lock
          className="ml-auto size-3.5 shrink-0 text-[var(--color-m-warning)]"
          aria-label={lockedAria}
        />
      ) : showBadge ? (
        <span
          className="ml-auto flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-m-primary)] text-[10px] font-bold text-[var(--color-m-text)]"
          aria-label={unreadBadgeAria(unreadTotal)}
        >
          {formatUnreadBadge(unreadTotal)}
        </span>
      ) : null}
    </NavLink>
  );
}

function navClass(active: boolean) {
  return cn('app-sidebar-nav-link', active && 'app-sidebar-nav-link--active');
}

export function RoleShell({
  roleBase,
  navItems,
  mobileNavItems,
}: {
  roleBase: string;
  navItems: NavItem[];
  mobileNavItems: NavItem[];
}) {
  const navigate = useNavigate();
  const tr = useStrings();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [logoutBusy, setLogoutBusy] = useState(false);
  const hasMessagesNav = navItems.some((item) => item.labelKey === 'navMessages');
  const unreadQuery = useUnreadMessageTotal(hasMessagesNav);
  const unreadTotal = unreadQuery.data ?? 0;
  const { isRestricted: mentorRestricted } = useMentorVerificationGate();

  const unreadBadgeAria = (count: number) =>
    tr.messagesUnreadBadge.replace('{{count}}', String(count));

  /** Same source as profile page: `GET /api/v1/profile/me` (auth `/me` has no photo URL). */
  const profileQuery = useQuery({
    queryKey: user?.id ? qk.profile(user.id) : [...qk.profileScope, 'none'],
    queryFn: () => profileService.getMe(),
    enabled: Boolean(user?.id),
  });

  const displayName =
    profileQuery.data?.common_profile.full_name ||
    user?.name ||
    [user?.first_name, user?.last_name].filter(Boolean).join(' ') ||
    user?.email ||
    tr.userDisplayFallback;

  const headerPhotoUrl =
    profileQuery.data?.common_profile.profile_photo_url ?? user?.avatar_url ?? null;

  async function confirmLogout() {
    setLogoutBusy(true);
    try {
      await logout();
      navigate('/login', { replace: true });
    } finally {
      setLogoutBusy(false);
      setLogoutOpen(false);
    }
  }

  return (
    <div className="min-h-dvh bg-[var(--color-m-bg)]">
      <div className="flex min-h-dvh w-full">
        <aside className="app-sidebar sticky top-0 hidden h-dvh w-[272px] shrink-0 flex-col border-r md:flex">
          <div className="flex shrink-0 items-center border-b border-[var(--color-m-card-border)] px-5 py-3">
            <AppLogo />
          </div>
          <nav
            className="min-h-0 flex-1 overflow-y-auto app-scroll-area flex flex-col gap-2 px-5 py-6"
            aria-label={tr.mainMenuAria}
          >
            {navItems.map((item) => (
              <SidebarNavLink
                key={item.to}
                item={item}
                label={tr[item.labelKey]}
                unreadTotal={unreadTotal}
                unreadBadgeAria={unreadBadgeAria}
                locked={item.gated && mentorRestricted}
                lockedAria={tr.navLockedAria}
              />
            ))}
          </nav>
          <button
            type="button"
            onClick={() => setLogoutOpen(true)}
            className="mx-5 mb-6 flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-medium text-[var(--color-m-error)] hover:bg-[var(--color-m-hover-overlay)]"
          >
            <LogOut className="size-5" aria-hidden />
            {tr.logout}
          </button>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col pb-28 md:pb-0">
          <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-[var(--color-m-card-border)] bg-[var(--color-m-bg)]/95 px-4 py-3 backdrop-blur md:px-8">
            <div className="flex items-center gap-3 md:hidden">
              <button
                type="button"
                className="rounded-lg p-2 text-[var(--color-m-text)] hover:bg-[var(--color-m-hover-overlay)]"
                aria-label={tr.menuTitle}
                onClick={() => setMenuOpen(true)}
              >
                <Menu className="size-6" />
              </button>
              <AppLogo compact />
            </div>
            <div className="hidden text-[13px] text-[var(--color-m-text-muted)] md:block">
              {new Intl.DateTimeFormat(getDateFnsLocale().code ?? 'en', {
                dateStyle: 'full',
              }).format(new Date())}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <AppChromeControls />
              <button
                type="button"
                className="relative rounded-full p-2 text-[var(--color-m-text-muted)] hover:bg-[var(--color-m-hover-overlay)] hover:text-[var(--color-m-text)]"
                aria-label={tr.notifications}
                onClick={() => navigate(`${roleBase}/notifications`)}
              >
                <Bell className="size-5" />
                {/* TODO: Show unread notification badge when notifications unread API is available. */}
              </button>
              <ProfileMenuDropdown
                roleBase={roleBase}
                displayName={displayName}
                photoUrl={headerPhotoUrl}
                isMentor={roleBase === '/mentor'}
                onLogout={() => setLogoutOpen(true)}
              />
            </div>
          </header>

          <motion.main
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="app-surface-gradient flex-1 px-5 py-6 md:px-10 md:py-8 lg:px-12"
          >
            <Outlet />
          </motion.main>
        </div>
      </div>

      <nav
        className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 flex justify-center px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 md:hidden"
        aria-label={tr.mobileTabMenuAria}
      >
        <div
          className="pointer-events-auto flex w-full max-w-md flex-row items-end justify-around border border-[var(--color-m-card-border)] bg-[var(--color-m-surface-light)] px-3 py-2 shadow-[var(--shadow-m-tab)]"
          style={{ borderRadius: 28 }}
        >
          {mobileNavItems.slice(0, 5).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="relative flex min-h-[58px] min-w-0 flex-1 flex-col items-center justify-end pt-2"
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'relative flex size-[46px] shrink-0 items-center justify-center rounded-full transition-shadow',
                      isActive && 'bg-[var(--color-m-primary)] shadow-[var(--shadow-m-glow)]'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'size-[22px] shrink-0',
                        isActive ? 'text-[var(--color-m-text)]' : 'text-[var(--color-m-text-muted)]'
                      )}
                      aria-hidden
                    />
                    {item.labelKey === 'navMessages' && unreadTotal > 0 ? (
                      <span
                        className="absolute -right-0.5 -top-0.5 flex min-w-[18px] items-center justify-center rounded-full bg-[var(--color-m-error)] px-1 text-[9px] font-bold text-[var(--color-m-text)]"
                        aria-label={unreadBadgeAria(unreadTotal)}
                      >
                        {formatUnreadBadge(unreadTotal)}
                      </span>
                    ) : null}
                  </span>
                  <span
                    className={cn(
                      'mt-1 line-clamp-1 max-w-full px-0.5 text-center text-[10px] tracking-[0.3px]',
                      isActive
                        ? 'font-bold text-[var(--color-m-primary-light)]'
                        : 'font-medium text-[var(--color-m-text-muted)]'
                    )}
                  >
                    {tr[item.labelKey]}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} title={tr.menuTitle}>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <SidebarNavLink
              key={item.to}
              item={item}
              label={tr[item.labelKey]}
              unreadTotal={unreadTotal}
              unreadBadgeAria={unreadBadgeAria}
              onNavigate={() => setMenuOpen(false)}
              locked={item.gated && mentorRestricted}
              lockedAria={tr.navLockedAria}
            />
          ))}
          <button
            type="button"
            onClick={() => setLogoutOpen(true)}
            className="mt-6 flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-medium text-[var(--color-m-error)] hover:bg-[var(--color-m-hover-overlay)]"
          >
            <LogOut className="size-5" aria-hidden />
            {tr.logout}
          </button>
        </nav>
      </Drawer>

      <LogoutConfirmModal
        open={logoutOpen}
        onClose={() => !logoutBusy && setLogoutOpen(false)}
        onConfirm={() => void confirmLogout()}
        isLoading={logoutBusy}
      />
    </div>
  );
}
