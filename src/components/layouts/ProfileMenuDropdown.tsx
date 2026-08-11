import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Calendar,
  Coins,
  LayoutList,
  LogOut,
  UserRound,
  Users,
  Wallet,
} from 'lucide-react';
import { PresignedAvatar } from '@/features/profile/components/PresignedAvatar';
import { useStrings } from '@/constants/strings';
import { cn } from '@/lib/utils';

type ProfileMenuDropdownProps = {
  roleBase: string;
  displayName: string;
  photoUrl: string | null;
  isMentor: boolean;
  onLogout: () => void;
};

export function ProfileMenuDropdown({
  roleBase,
  displayName,
  photoUrl,
  isMentor,
  onLogout,
}: ProfileMenuDropdownProps) {
  const tr = useStrings();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const isParent = roleBase === '/parent';

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const items = [
    {
      id: 'profile',
      label: tr.profileMenuProfile,
      icon: UserRound,
      onSelect: () => go(`${roleBase}/profile`),
    },
    ...(isMentor
      ? [
          {
            id: 'listings',
            label: tr.profileMenuListings,
            icon: LayoutList,
            onSelect: () => go(`${roleBase}/listings`),
          },
          {
            id: 'availability',
            label: tr.profileMenuAvailability,
            icon: Calendar,
            onSelect: () => go(`${roleBase}/availability`),
          },
          {
            id: 'earnings',
            label: tr.profileMenuEarnings,
            icon: Coins,
            onSelect: () => go(`${roleBase}/earnings`),
          },
        ]
      : []),
    ...(isParent
      ? [
          {
            id: 'students',
            label: tr.profileMenuMyStudents,
            icon: Users,
            onSelect: () => go(`${roleBase}/students`),
          },
          {
            id: 'wallet',
            label: tr.profileMenuWallet,
            icon: Wallet,
            onSelect: () => go(`${roleBase}/wallet`),
          },
        ]
      : []),
    {
      id: 'notifications',
      label: tr.profileMenuNotifications,
      icon: Bell,
      onSelect: () => go(`${roleBase}/notifications`),
    },
    {
      id: 'logout',
      label: tr.profileMenuLogout,
      icon: LogOut,
      onSelect: () => {
        setOpen(false);
        onLogout();
      },
      danger: true,
    },
  ];

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] py-1 pl-1 pr-2 transition hover:bg-[var(--color-m-hover-overlay)] md:pr-3"
      >
        <PresignedAvatar
          key={photoUrl ?? 'none'}
          storedUrl={photoUrl}
          name={displayName}
          className="size-9"
        />
        <span className="hidden max-w-[140px] truncate text-[13px] text-[var(--color-m-text-secondary)] md:inline">
          {displayName}
        </span>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] py-1 shadow-[var(--shadow-m-card)] ring-1 ring-[var(--color-m-ring-subtle)]"
        >
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                onClick={item.onSelect}
                className={cn(
                  'flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition hover:bg-[var(--color-m-hover-overlay)]',
                  'danger' in item && item.danger
                    ? 'text-[var(--color-m-error)]'
                    : 'text-[var(--color-m-text)]'
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                {item.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
