import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
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

/** Bento tints: navy, mint, amber, blue (mobile parity). */
const TINTS = [
  'var(--color-m-primary)',
  'var(--color-m-secondary)',
  'var(--color-m-accent-warm)',
  'var(--color-m-info)',
];

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
      <h2 className="mb-3 text-lg font-extrabold tracking-[-0.3px] text-[var(--color-m-text)]">
        {tr.dashboardQuickActions}
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {actions.map((action, index) => {
          const Icon = ICON_MAP[action.icon] ?? BookOpen;
          const tint = TINTS[index % TINTS.length];
          return (
            <button
              key={action.action_id}
              type="button"
              onClick={() => navigate(webPathForQuickAction(roleBase, action.target_route))}
              style={{
                backgroundColor: `color-mix(in srgb, ${tint} 8%, var(--color-m-card))`,
                borderColor: `color-mix(in srgb, ${tint} 18%, transparent)`,
              }}
              className="group flex min-h-[112px] flex-col justify-between gap-3 rounded-[var(--radius-m-card)] border p-4 text-left transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[var(--shadow-m-card)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[color-mix(in_srgb,var(--color-m-primary)_28%,transparent)]"
            >
              <span className="flex w-full items-start justify-between">
                <span
                  className="flex size-11 items-center justify-center rounded-[var(--radius-m-button)]"
                  style={{ backgroundColor: `color-mix(in srgb, ${tint} 16%, transparent)` }}
                >
                  <Icon className="size-[22px]" style={{ color: tint }} aria-hidden />
                </span>
                <ArrowRight
                  className="size-4 text-[var(--color-m-text-muted)] transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </span>
              <span className="text-[15px] font-bold tracking-[-0.2px] text-[var(--color-m-text)]">
                {translateQuickActionLabel(action.action_id, action.action_name)}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
