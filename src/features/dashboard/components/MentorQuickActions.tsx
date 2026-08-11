import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  FileUp,
  Inbox,
  LayoutList,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { useStrings } from '@/constants/strings';

type Action = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
};

type Props = {
  roleBase: string;
};

export function MentorQuickActions({ roleBase }: Props) {
  const tr = useStrings();
  const navigate = useNavigate();

  const actions: Action[] = [
    {
      id: 'availability',
      label: tr.dashboardQuickSetAvailability,
      href: `${roleBase}/availability`,
      icon: Calendar,
    },
    {
      id: 'listing',
      label: tr.dashboardQuickCreateListing,
      href: `${roleBase}/listings/create`,
      icon: LayoutList,
    },
    {
      id: 'material',
      label: tr.dashboardQuickUploadMaterial,
      href: `${roleBase}/materials/new`,
      icon: FileUp,
    },
    {
      id: 'requests',
      label: tr.dashboardQuickContactRequests,
      href: `${roleBase}/contact-requests`,
      icon: Inbox,
    },
    {
      id: 'earnings',
      label: tr.dashboardQuickEarnings,
      href: `${roleBase}/earnings`,
      icon: Wallet,
    },
  ];

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-[var(--color-m-text)]">
        {tr.dashboardQuickActions}
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              type="button"
              onClick={() => navigate(action.href)}
              className="flex flex-col items-center gap-2 rounded-[16px] border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] p-4 text-center transition hover:border-[var(--color-brand-primary)]/40 hover:shadow-[var(--shadow-m-glow)]"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-[var(--color-brand-primary)]/15">
                <Icon className="size-5 text-[var(--color-brand-primary)]" aria-hidden />
              </span>
              <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
