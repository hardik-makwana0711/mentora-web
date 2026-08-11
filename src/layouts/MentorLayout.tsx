import { mentorNav, RoleShell } from '@/components/layouts/RoleShell';

const mentorMobileNav = mentorNav
  .filter((i) => !i.to.endsWith('/notifications') && !i.to.endsWith('/earnings'))
  .slice(0, 5);

export default function MentorLayout() {
  return <RoleShell roleBase="/mentor" navItems={mentorNav} mobileNavItems={mentorMobileNav} />;
}
