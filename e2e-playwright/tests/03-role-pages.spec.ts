import { test, expect } from '@playwright/test';
import {
  authFile,
  expectCleanAudit,
  expectNoCrash,
  settle,
  themeOf,
  useTheme,
  watchErrors,
  type Role,
} from './helpers';

/**
 * Level 3 · every static page of every role renders in both themes and passes the design audit
 * (12 px minimum, AA contrast, no horizontal overflow, named controls).
 */
const PAGES: Record<Role, string[]> = {
  parent: [
    'dashboard',
    'lessons',
    'messages',
    'wallet',
    'students',
    'materials',
    'profile',
    'profile/edit',
    'notifications',
    'search',
    'mentor-discovery',
    'mentor-discovery/saved',
    'my-mentor-requests',
    'favourites',
  ],
  student: [
    'dashboard',
    'lessons',
    'messages',
    'materials',
    'profile',
    'profile/edit',
    'notifications',
    'search',
    'mentor-discovery',
    'mentor-discovery/saved',
    'my-mentor-requests',
    'favourites',
  ],
  mentor: [
    'dashboard',
    'lessons',
    'messages',
    'materials',
    'materials/new',
    'availability',
    'listings',
    'listings/create',
    'pricing',
    'earnings',
    'wallet',
    'wallet/payout-methods',
    'wallet/payout-methods/new',
    'profile',
    'profile/edit',
    'media',
    'notifications',
    'contact-requests',
    'references',
    'verification',
  ],
  admin: [
    '',
    'mentor-verifications',
    'mentor-profiles',
    'listings',
    'users',
    'mentor-contact-requests',
    'reports',
    'marketing',
  ],
};

for (const role of Object.keys(PAGES) as Role[]) {
  test.describe(`Pages · ${role}`, () => {
    test.use({ storageState: authFile(role) });
    for (const sub of PAGES[role]) {
      const path = `/${role}${sub ? '/' + sub : ''}`;
      test(path, async ({ page }, testInfo) => {
        const theme = themeOf(testInfo);
        await useTheme(page, theme);
        const errors = watchErrors(page);
        await page.goto(path);
        await settle(page);
        await expect(page, 'session still valid').not.toHaveURL(/\/login/);
        await expectNoCrash(page);
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        await expectCleanAudit(page, testInfo, path);
        await testInfo.attach(`${path} (${theme})`, {
          body: await page.screenshot({ fullPage: true }),
          contentType: 'image/png',
        });
        expect(errors.pageErrors, 'uncaught page errors').toEqual([]);
        if (errors.consoleErrors.length)
          testInfo.annotations.push({
            type: 'console-errors',
            description: errors.consoleErrors.join(' | '),
          });
      });
    }
  });
}
