import { useNavigate } from 'react-router-dom';
import {
  BarChart2,
  BookOpen,
  Calendar,
  HelpCircle,
  MessageCircle,
  Play,
  Search,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { useStrings } from '@/constants/strings';
import { translateQuickActionLabel } from '@/lib/translate-dashboard';
import { webPathForQuickAction } from '@/features/dashboard/lib/quick-action-routes';
import type { DashboardQuickAction } from '@/types/dashboard';

const ICON_MAP: Record<string, LucideIcon> = {
  play: Play,
  search: Search,
  book: BookOpen,
  calendar: Calendar,
  report: BarChart2,
  quiz: HelpCircle,
  wallet: Wallet,
  message: MessageCircle,
};

type QuickActionsGridProps = {
  roleBase: string;
  actions: DashboardQuickAction[];
};

export function QuickActionsGrid({ roleBase, actions }: QuickActionsGridProps) {
  const tr = useStrings();
  const navigate = useNavigate();
  if (!actions.length) return null;

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-[var(--color-m-text)]">{tr.dashboardQuickActions}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {actions.map((action) => {
          const Icon = ICON_MAP[action.icon] ?? BookOpen;
          return (
            <button
              key={action.action_id}
              type="button"
              onClick={() => navigate(webPathForQuickAction(roleBase, action.target_route))}
              className="flex flex-col items-center gap-2 rounded-[16px] border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] p-4 text-center transition hover:border-[var(--color-brand-primary)]/40 hover:shadow-[var(--shadow-m-glow)]"
            >
              <span className="flex size-12 items-center justify-center rounded-xl bg-[var(--color-brand-primary)]/15">
                <Icon className="size-6 text-[var(--color-brand-primary)]" aria-hidden />
              </span>
              <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                {translateQuickActionLabel(action.action_id, action.action_name)}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
