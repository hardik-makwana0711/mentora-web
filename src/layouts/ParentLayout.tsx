import { RoleShell, parentNav } from '@/components/layouts/RoleShell';

const parentMobileNav = parentNav
  .filter((i) => !i.to.endsWith('/notifications') && !i.to.endsWith('/favourites'))
  .slice(0, 5);

export default function ParentLayout() {
  return <RoleShell roleBase="/parent" navItems={parentNav} mobileNavItems={parentMobileNav} />;
}
