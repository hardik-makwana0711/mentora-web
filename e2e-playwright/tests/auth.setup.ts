import { test as setup, expect } from '@playwright/test';
import { ACCOUNTS, authFile, settle, type Role } from './helpers';

/** Logs every seeded role in through the real login form and saves the session. */
for (const role of Object.keys(ACCOUNTS) as Role[]) {
  setup(`log in as ${role}`, async ({ page }) => {
    const acc = ACCOUNTS[role];
    await page.addInitScript(() => localStorage.setItem('mentora:locale', 'en'));
    await page.goto('/login');
    await page.getByLabel(/email or phone/i).fill(acc.email);
    await page.getByLabel(/^password$/i).fill(acc.password);
    await page.getByRole('button', { name: /^log in$/i }).click();
    await expect(page).toHaveURL(acc.home, { timeout: 20_000 });
    await settle(page);
    await page.context().storageState({ path: authFile(role) });
  });
}
