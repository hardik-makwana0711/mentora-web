import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  MessageSquare,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { useStrings } from '@/constants/strings';
import { cn } from '@/lib/utils';

type StatCard = {
  key: string;
  label: string;
  value: string;
  href: string;
  icon: LucideIcon;
};

type Props = {
  upcomingLessons: number | null;
  creditBalance: number;
  unreadMessages: number | null;
  linkedStudents: number | null;
  roleBase: string;
  className?: string;
};

export function ParentOverviewStats({
  upcomingLessons,
  creditBalance,
  unreadMessages,
  linkedStudents,
  roleBase,
  className,
}: Props) {
  const tr = useStrings();
  const navigate = useNavigate();

  const cards: StatCard[] = [];

  if (upcomingLessons != null) {
    cards.push({
      key: 'upcoming',
      label: tr.parentStatUpcomingLessons,
      value: String(upcomingLessons),
      href: `${roleBase}/lessons`,
      icon: CalendarDays,
    });
  }

  cards.push({
    key: 'credits',
    label: tr.parentStatCreditBalance,
    value: `${creditBalance} ${tr.creditUnit}`,
    href: `${roleBase}/wallet`,
    icon: Wallet,
  });

  if (unreadMessages != null) {
    cards.push({
      key: 'messages',
      label: tr.parentStatUnreadMessages,
      value: String(unreadMessages),
      href: `${roleBase}/messages`,
      icon: MessageSquare,
    });
  }

  if (linkedStudents != null) {
    cards.push({
      key: 'students',
      label: tr.parentStatLinkedStudents,
      value: String(linkedStudents),
      href: `${roleBase}/students`,
      icon: Users,
    });
  }

  return (
    <div className={cn('grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4', className)}>
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <button
            key={card.key}
            type="button"
            onClick={() => navigate(card.href)}
            className="flex items-center gap-3 rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] px-4 py-3 text-left ring-1 ring-[var(--color-m-ring-subtle)] transition hover:border-[var(--color-brand-primary)]/40 hover:shadow-[var(--shadow-m-glow)]"
          >
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
          </button>
        );
      })}
    </div>
  );
}
