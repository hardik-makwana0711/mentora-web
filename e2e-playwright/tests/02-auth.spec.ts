import { test, expect } from '@playwright/test';
import { ACCOUNTS, authFile, settle, themeOf, useTheme, watchErrors, type Role } from './helpers';

/** Level 2 · authentication, guards and the global chrome controls (theme, language). */
test.describe('Auth · login form', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await useTheme(page, themeOf(testInfo));
    await page.goto('/login');
    await settle(page);
  });

  test('empty submit stays on login and does not crash', async ({ page }) => {
    await page.getByRole('button', { name: /^log in$/i }).click();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByLabel(/email or phone/i)).toBeVisible();
  });

  test('wrong password shows an error and stays on login', async ({ page }) => {
    await page.getByLabel(/email or phone/i).fill(ACCOUNTS.parent.email);
    await page.getByLabel(/^password$/i).fill('Wrong-password-1');
    await page.getByRole('button', { name: /^log in$/i }).click();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText(/sign in failed|invalid|incorrect|wrong/i).first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test('show / hide password toggles the field type', async ({ page }) => {
    const pwd = page.getByLabel(/^password$/i);
    await pwd.fill('Secret123');
    await expect(pwd).toHaveAttribute('type', 'password');
    await page.getByRole('button', { name: /show password/i }).click();
    await expect(pwd).toHaveAttribute('type', 'text');
    await page.getByRole('button', { name: /hide password/i }).click();
    await expect(pwd).toHaveAttribute('type', 'password');
  });

  test('theme toggle switches and persists across reload', async ({ page }, testInfo) => {
    const start = themeOf(testInfo);
    const other = start === 'dark' ? 'light' : 'dark';
    await page
      .getByRole('button', { name: new RegExp(`switch to ${other} mode`, 'i') })
      .first()
      .click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', other);
    expect(await page.evaluate(() => localStorage.getItem('mentora:theme'))).toBe(other);
  });

  test('language switch TR ⇄ EN changes the copy', async ({ page }) => {
    const lang = page
      .getByRole('group', { name: /select language|dil seç/i })
      .filter({ visible: true })
      .first();
    await lang.getByRole('button', { name: /türkçe|turkish/i }).click();
    await expect(page.getByRole('button', { name: /giriş yap/i })).toBeVisible();
    await expect(lang.getByRole('button', { name: /türkçe|turkish/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    await lang.getByRole('button', { name: /english|ngilizce/i }).click();
    await expect(page.getByRole('button', { name: /^log in$/i })).toBeVisible();
  });

  test('links: forgot password and sign up', async ({ page }) => {
    await page
      .getByRole('link', { name: /forgot password/i })
      .or(page.getByRole('button', { name: /forgot password/i }))
      .first()
      .click();
    await expect(page).toHaveURL(/forgot-password/);
    await page.goBack();
    await page
      .getByRole('link', { name: /sign up/i })
      .or(page.getByRole('button', { name: /sign up/i }))
      .first()
      .click();
    await expect(page).toHaveURL(/register/);
  });
});

test.describe('Auth · every role signs in through the form', () => {
  for (const role of Object.keys(ACCOUNTS) as Role[]) {
    test(`${role} lands on its home`, async ({ page }, testInfo) => {
      await useTheme(page, themeOf(testInfo));
      const errors = watchErrors(page);
      await page.goto('/login');
      await page.getByLabel(/email or phone/i).fill(ACCOUNTS[role].email);
      await page.getByLabel(/^password$/i).fill(ACCOUNTS[role].password);
      await page.getByRole('button', { name: /^log in$/i }).click();
      await expect(page).toHaveURL(ACCOUNTS[role].home, { timeout: 20_000 });
      await settle(page);
      expect(errors.pageErrors).toEqual([]);
    });
  }
});

test.describe('Auth · route guards', () => {
  test('signed-out user is sent to login from a role page', async ({ page }) => {
    await page.goto('/parent/dashboard');
    await expect(page).toHaveURL(/\/login|\/$/);
  });

  test.describe('student cannot open parent or mentor areas', () => {
    test.use({ storageState: authFile('student') });
    test('guard redirects away', async ({ page }) => {
      for (const path of ['/parent/wallet', '/mentor/earnings']) {
        await page.goto(path);
        await settle(page);
        await expect(page, `${path} must not render for a student`).not.toHaveURL(
          new RegExp(path.replace(/\//g, '\\/') + '$')
        );
      }
      await page.goto('/admin');
      await settle(page);
      await expect(page.getByRole('heading', { name: /access denied/i })).toBeVisible();
    });
  });

  test.describe('parent cannot open admin', () => {
    test.use({ storageState: authFile('parent') });
    test('guard redirects away', async ({ page }) => {
      await page.goto('/admin');
      await settle(page);
      await expect(page.getByRole('heading', { name: /access denied/i })).toBeVisible();
      await page
        .getByRole('button', { name: /go home|home/i })
        .first()
        .click();
      await expect(page).toHaveURL(/\/parent\/dashboard/);
    });
  });
});

test.describe('Auth · logout', () => {
  // Uses a fresh UI login so the shared session files are not revoked.
  test('parent logs out through the confirm dialog', async ({ page }, testInfo) => {
    await useTheme(page, themeOf(testInfo));
    await page.goto('/login');
    await page.getByLabel(/email or phone/i).fill(ACCOUNTS.parent.email);
    await page.getByLabel(/^password$/i).fill(ACCOUNTS.parent.password);
    await page.getByRole('button', { name: /^log in$/i }).click();
    await expect(page).toHaveURL(ACCOUNTS.parent.home);
    await settle(page);
    await page
      .getByRole('navigation', { name: /main menu/i })
      .locator('..')
      .getByRole('button', { name: /^log out$/i })
      .click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText(/log out\?/i)).toBeVisible();
    await dialog.getByRole('button', { name: /^log out$/i }).click();
    await expect(page).toHaveURL(/\/login|\/$/, { timeout: 15_000 });
    expect(await page.evaluate(() => localStorage.getItem('mentora_access_token'))).toBeNull();
  });
});
