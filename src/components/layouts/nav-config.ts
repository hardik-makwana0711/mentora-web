import type { ComponentType } from 'react';
import {
  Bell,
  BookOpen,
  Calendar,
  Coins,
  Compass,
  FileText,
  Heart,
  Images,
  LayoutDashboard,
  MessageSquare,
  Search,
  Star,
  Tag,
  UserRound,
  Wallet,
} from 'lucide-react';
import type { Strings } from '@/constants/strings';

export type NavLabelKey = Extract<
  keyof Strings,
  | 'navPanel'
  | 'navFindMentor'
  | 'navFavorites'
  | 'navMyClasses'
  | 'navMessages'
  | 'navPurse'
  | 'navProfile'
  | 'navNotifications'
  | 'navDashboard'
  | 'navMyListings'
  | 'navAvailability'
  | 'navEarnings'
  | 'navMyStudents'
  | 'navMaterials'
  | 'navMentorDiscovery'
  | 'myMentorRequests'
  | 'mentorContactRequests'
  | 'navReferences'
  | 'navPricing'
  | 'navMediaGallery'
>;

export type NavItem = {
  to: string;
  labelKey: NavLabelKey;
  icon: ComponentType<{ className?: string }>;
  /** Blocked behind mentor identity/academic verification — see MentorVerificationGate. */
  gated?: boolean;
};

export const parentNav: NavItem[] = [
  { to: '/parent/dashboard', labelKey: 'navDashboard', icon: LayoutDashboard },
  { to: '/parent/mentor-discovery', labelKey: 'navMentorDiscovery', icon: Compass },
  { to: '/parent/search', labelKey: 'navFindMentor', icon: Search },
  // { to: '/parent/my-mentor-requests', labelKey: 'myMentorRequests', icon: Inbox },
  { to: '/parent/students', labelKey: 'navMyStudents', icon: UserRound },
  { to: '/parent/favourites', labelKey: 'navFavorites', icon: Heart },
  { to: '/parent/lessons', labelKey: 'navMyClasses', icon: Calendar },
  { to: '/parent/materials', labelKey: 'navMaterials', icon: BookOpen },
  { to: '/parent/messages', labelKey: 'navMessages', icon: MessageSquare },
  { to: '/parent/wallet', labelKey: 'navPurse', icon: Wallet },
  { to: '/parent/profile', labelKey: 'navProfile', icon: UserRound },
  { to: '/parent/notifications', labelKey: 'navNotifications', icon: Bell },
];

export const studentNav: NavItem[] = [
  { to: '/student/dashboard', labelKey: 'navDashboard', icon: LayoutDashboard },
  { to: '/student/mentor-discovery', labelKey: 'navMentorDiscovery', icon: Compass },
  { to: '/student/search', labelKey: 'navFindMentor', icon: Search },
  { to: '/student/favourites', labelKey: 'navFavorites', icon: Heart },
  { to: '/student/lessons', labelKey: 'navMyClasses', icon: Calendar },
  { to: '/student/materials', labelKey: 'navMaterials', icon: BookOpen },
  { to: '/student/messages', labelKey: 'navMessages', icon: MessageSquare },
  { to: '/student/profile', labelKey: 'navProfile', icon: UserRound },
  { to: '/student/notifications', labelKey: 'navNotifications', icon: Bell },
];

export const mentorNav: NavItem[] = [
  { to: '/mentor/dashboard', labelKey: 'navDashboard', icon: LayoutDashboard, gated: true },
  // { to: '/mentor/contact-requests', labelKey: 'mentorContactRequests', icon: Inbox },
  { to: '/mentor/listings', labelKey: 'navMyListings', icon: FileText },
  { to: '/mentor/lessons', labelKey: 'navMyClasses', icon: Calendar, gated: true },
  { to: '/mentor/messages', labelKey: 'navMessages', icon: MessageSquare },
  { to: '/mentor/availability', labelKey: 'navAvailability', icon: Calendar, gated: true },
  { to: '/mentor/materials', labelKey: 'navMaterials', icon: BookOpen, gated: true },
  { to: '/mentor/wallet', labelKey: 'navEarnings', icon: Coins, gated: true },
  { to: '/mentor/media', labelKey: 'navMediaGallery', icon: Images, gated: true },
  { to: '/mentor/pricing', labelKey: 'navPricing', icon: Tag, gated: true },
  { to: '/mentor/profile', labelKey: 'navProfile', icon: UserRound },
  { to: '/mentor/references', labelKey: 'navReferences', icon: Star, gated: true },
  { to: '/mentor/notifications', labelKey: 'navNotifications', icon: Bell },
];
