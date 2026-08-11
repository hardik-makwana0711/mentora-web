import type { ComponentType } from 'react';
import {
  ClipboardList,
  Flag,
  Image,
  Inbox,
  LayoutDashboard,
  ListChecks,
  Megaphone,
  ShieldCheck,
  Star,
  Trophy,
  Users,
} from 'lucide-react';

export type AdminNavItem = {
  to: string;
  labelKey: string;
  icon: ComponentType<{ className?: string }>;
  /** When false, item is hidden from sidebar (backend endpoint not available). */
  enabled: boolean;
  filterQuery?: string;
};

export const ADMIN_NAV: AdminNavItem[] = [
  { to: '/admin', labelKey: 'adminNavDashboard', icon: LayoutDashboard, enabled: true },
  {
    to: '/admin/mentor-verifications',
    labelKey: 'adminNavVerifications',
    icon: ShieldCheck,
    enabled: true,
  },
  { to: '/admin/mentor-profiles', labelKey: 'adminNavProfiles', icon: Users, enabled: true },
  { to: '/admin/listings', labelKey: 'adminNavListings', icon: ListChecks, enabled: true },
  { to: '/admin/mentor-contact-requests', labelKey: 'adminContactRequests', icon: Inbox, enabled: true },
  { to: '/admin/media', labelKey: 'adminNavMedia', icon: Image, enabled: false },
  { to: '/admin/reviews', labelKey: 'adminNavReviews', icon: Star, enabled: false },
  { to: '/admin/success-stories', labelKey: 'adminNavSuccessStories', icon: Trophy, enabled: false },
  { to: '/admin/reports', labelKey: 'adminNavReports', icon: Flag, enabled: true },
  { to: '/admin/marketing', labelKey: 'adminNavMarketing', icon: Megaphone, enabled: true },
  { to: '/admin/users', labelKey: 'adminNavUsers', icon: Users, enabled: true },
  { to: '/admin/audit-logs', labelKey: 'adminNavAuditLogs', icon: ClipboardList, enabled: false },
];

export function enabledAdminNav(): AdminNavItem[] {
  return ADMIN_NAV.filter((item) => item.enabled);
}
