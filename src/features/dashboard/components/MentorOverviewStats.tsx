import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  CalendarDays,
  Inbox,
  MessageSquare,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { useStrings } from '@/constants/strings';
import { formatWalletMoney } from '@/features/mentor/lib/format-wallet';
import { cn } from '@/lib/utils';

export type MentorOverviewStat = {
  key: string;
  label: string;
  value: string;
  href?: string;
  icon: LucideIcon;
};

type Props = {
  todayLessons: number;
  pendingRequests: number | null;
  activeListings: number | null;
  unreadMessages: number | null;
  availablePayout: string | number | null;
  currency?: string;
  roleBase: string;
  className?: string;
};

export function MentorOverviewStats({
  todayLessons,
  pendingRequests,
  activeListings,
  unreadMessages,
  availablePayout,
  currency = 'TRY',
  roleBase,
  className,
}: Props) {
  const tr = useStrings();
  const navigate = useNavigate();

  const cards: MentorOverviewStat[] = [
    {
      key: 'today',
      label: tr.dashboardStatTodayLessons,
      value: String(todayLessons),
      href: `${roleBase}/lessons`,
      icon: CalendarDays,
    },
  ];

  if (pendingRequests != null) {
    cards.push({
      key: 'requests',
      label: tr.dashboardStatPendingRequests,
      value: String(pendingRequests),
      href: `${roleBase}/contact-requests`,
      icon: Inbox,
    });
  }

  if (activeListings != null) {
    cards.push({
      key: 'listings',
      label: tr.dashboardStatActiveListings,
      value: String(activeListings),
      href: `${roleBase}/listings`,
      icon: BookOpen,
    });
  }

  if (unreadMessages != null) {
    cards.push({
      key: 'messages',
      label: tr.dashboardStatUnreadMessages,
      value: String(unreadMessages),
      href: `${roleBase}/messages`,
      icon: MessageSquare,
    });
  }

  if (availablePayout != null) {
    cards.push({
      key: 'payout',
      label: tr.dashboardStatAvailablePayout,
      value: formatWalletMoney(availablePayout, currency),
      href: `${roleBase}/earnings`,
      icon: Wallet,
    });
  }

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5',
        className
      )}
    >
      {cards.map((card) => {
        const Icon = card.icon;
        const interactive = Boolean(card.href);
        const content = (
          <>
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-m-primary)]/12 text-[var(--color-m-primary-light)]">
              <Icon className="size-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-[var(--color-m-text-muted)]">
                {card.label}
              </p>
              <p className="mt-0.5 truncate text-xl font-semibold tabular-nums text-[var(--color-m-text)]">
                {card.value}
              </p>
            </div>
          </>
        );

        if (interactive && card.href) {
          return (
            <button
              key={card.key}
              type="button"
              onClick={() => navigate(card.href!)}
              className="flex items-center gap-3 rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] px-4 py-3 text-left ring-1 ring-[var(--color-m-ring-subtle)] transition hover:border-[var(--color-brand-primary)]/40 hover:shadow-[var(--shadow-m-glow)]"
            >
              {content}
            </button>
          );
        }

        return (
          <div
            key={card.key}
            className="flex items-center gap-3 rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] px-4 py-3 ring-1 ring-[var(--color-m-ring-subtle)]"
          >
            {content}
          </div>
        );
      })}
    </div>
  );
}
