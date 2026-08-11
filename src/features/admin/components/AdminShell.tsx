import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { LogOut, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { AppLogo } from '@/components/layouts/AppLogo';
import { Drawer } from '@/components/ui/Drawer';
import { AppChromeControls } from '@/components/ui/AppChromeControls';
import { LogoutConfirmModal } from '@/features/profile/components/LogoutConfirmModal';
import { enabledAdminNav } from '@/features/admin/lib/admin-nav';
import { useAuthStore } from '@/app/store/authStore';
import { useStrings } from '@/constants/strings';
import { cn } from '@/lib/utils';

function navClass(active: boolean) {
  return cn('app-sidebar-nav-link', active && 'app-sidebar-nav-link--active');
}

export default function AdminShell() {
  const tr = useStrings();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [logoutBusy, setLogoutBusy] = useState(false);

  const navItems = enabledAdminNav();
  const displayName = user?.email ?? tr.userDisplayFallback;

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

  const sidebar = (
    <>
      <AppLogo className="mb-10 px-1" />
      <nav className="flex flex-1 flex-col gap-2" aria-label={tr.adminMenuAria}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => navClass(isActive)}
            end={item.to === '/admin'}
            onClick={() => setMenuOpen(false)}
          >
            <item.icon aria-hidden />
            {tr[item.labelKey as keyof typeof tr] as string}
          </NavLink>
        ))}
      </nav>
      <button
        type="button"
        onClick={() => setLogoutOpen(true)}
        className="mt-6 flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-medium text-[var(--color-m-error)] hover:bg-[var(--color-m-hover-overlay)]"
      >
        <LogOut className="size-5" aria-hidden />
        {tr.logout}
      </button>
    </>
  );

  return (
    <div className="min-h-dvh bg-[var(--color-m-bg)]">
      <div className="flex min-h-dvh w-full">
        <aside className="app-sidebar sticky top-0 hidden h-dvh w-[272px] shrink-0 flex-col border-r px-5 py-7 md:flex">
          {sidebar}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
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
            <p className="hidden text-sm font-medium text-[var(--color-m-text)] md:block">{tr.adminPanelTitle}</p>
            <div className="ml-auto flex items-center gap-3">
              <AppChromeControls />
              <span className="max-w-[200px] truncate text-[13px] text-[var(--color-m-text-secondary)]">
                {displayName}
              </span>
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

      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} title={tr.adminPanelTitle}>
        <div className="flex flex-col px-2 py-4">{sidebar}</div>
      </Drawer>

      <LogoutConfirmModal
        open={logoutOpen}
        isLoading={logoutBusy}
        onClose={() => setLogoutOpen(false)}
        onConfirm={() => void confirmLogout()}
      />
    </div>
  );
}
