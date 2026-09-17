import { RoleShell } from '@/components/layouts/RoleShell';
import { parentNav } from '@/components/layouts/nav-config';

const parentMobileNav = parentNav
  .filter((i) => !i.to.endsWith('/notifications') && !i.to.endsWith('/favourites'))
  .slice(0, 5);

export default function ParentLayout() {
  return <RoleShell roleBase="/parent" navItems={parentNav} mobileNavItems={parentMobileNav} />;
}
