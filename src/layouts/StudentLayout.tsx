import { RoleShell } from '@/components/layouts/RoleShell';
import { studentNav } from '@/components/layouts/nav-config';

const studentMobileNav = studentNav
  .filter((i) => !i.to.endsWith('/notifications') && !i.to.endsWith('/favourites'))
  .slice(0, 5);

export default function StudentLayout() {
  return <RoleShell roleBase="/student" navItems={studentNav} mobileNavItems={studentMobileNav} />;
}
