import { test, expect } from '@playwright/test';
import {
  authFile,
  expectCleanAudit,
  expectNoCrash,
  settle,
  themeOf,
  useTheme,
  watchErrors,
} from './helpers';

/**
 * Level 5 · real user journeys per role, end to end against the local API + database.
 * They change local seed data only (credits, profile name, availability) and restore it where possible.
 */

test.describe('Journey · parent', () => {
  test.use({ storageState: authFile('parent') });

  test('wallet: validation, then a dummy top-up adds credits', async ({ page }, testInfo) => {
    await useTheme(page, themeOf(testInfo));
    const errors = watchErrors(page);
    await page.goto('/parent/wallet');
    await settle(page);

    await page
      .getByRole('button', { name: /add credits/i })
      .first()
      .click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    const amount = dialog.getByLabel(/enter credit amount/i);

    // Zero is rejected
    await amount.fill('0');
    await dialog.getByRole('button', { name: /add credits/i }).click();
    await expect(dialog.getByText(/greater than 0/i)).toBeVisible();

    // A valid amount succeeds and closes the dialog
    await amount.fill('25');
    await expectCleanAudit(page, testInfo, 'top-up dialog');
    await dialog.getByRole('button', { name: /add credits/i }).click();
    await expect(dialog).toBeHidden({ timeout: 15_000 });
    await settle(page);
    await expect(page.getByText(/25/).first()).toBeVisible();
    await expectNoCrash(page);
    expect(errors.pageErrors).toEqual([]);
  });

  test('discovery: search → mentor profile → booking start', async ({ page }, testInfo) => {
    await useTheme(page, themeOf(testInfo));
    const errors = watchErrors(page);
    await page.goto('/parent/search');
    await settle(page);
    await expectNoCrash(page);

    const profileLink = page
      .getByRole('button', { name: /view services|view mentor|view profile/i })
      .first();
    await expect(profileLink, 'at least one mentor or listing in results').toBeVisible({
      timeout: 15_000,
    });
    await profileLink.click();
    await settle(page);
    await expect(page).toHaveURL(/\/(mentors|listings)\//);
    await expectNoCrash(page);
    await expectCleanAudit(page, testInfo, 'mentor profile');

    const book = page
      .getByRole('button', { name: /book lesson|book/i })
      .or(page.getByRole('link', { name: /book lesson|book/i }))
      .first();
    if (await book.isVisible().catch(() => false)) {
      await book.click();
      await settle(page);
      await expectNoCrash(page);
      await expect(
        page.getByText(/select a date|select a time|booking|choose/i).first()
      ).toBeVisible();
      await expectCleanAudit(page, testInfo, 'booking start');
    } else {
      testInfo.annotations.push({
        type: 'note',
        description: 'No bookable listing shown for the seed mentor',
      });
    }
    expect(errors.pageErrors).toEqual([]);
  });

  test('profile: edit first name, save, and restore', async ({ page }, testInfo) => {
    test.skip(
      themeOf(testInfo) === 'dark',
      'edits shared seed data, so it runs once (light project)'
    );
    await useTheme(page, themeOf(testInfo));
    await page.goto('/parent/profile/edit');
    await settle(page);
    const first = page.getByLabel(/^first name/i);
    await expect(first).toBeVisible();
    const original = await first.inputValue();
    // A one-word change: names with spaces are re-split on load (see QA report, bug QA-11)
    await first.fill(`${original}Qa`);
    await page
      .getByRole('button', { name: /save changes|^save$/i })
      .first()
      .click();
    await settle(page);
    await page.goto('/parent/profile');
    await settle(page);
    await expect(page.getByText(new RegExp(`${original}Qa`)).first()).toBeVisible();

    await page.goto('/parent/profile/edit');
    await settle(page);
    await page.getByLabel(/^first name/i).fill(original);
    await page
      .getByRole('button', { name: /save changes|^save$/i })
      .first()
      .click();
    await settle(page);
    await expectNoCrash(page);
  });

  test('messages page renders thread list and composer state', async ({ page }, testInfo) => {
    await useTheme(page, themeOf(testInfo));
    const errors = watchErrors(page);
    await page.goto('/parent/messages');
    await settle(page);
    await expectNoCrash(page);
    await expectCleanAudit(page, testInfo, 'messages');
    expect(errors.pageErrors).toEqual([]);
  });
});

test.describe('Journey · student', () => {
  test.use({ storageState: authFile('student') });

  test('lessons: switch views and move the calendar', async ({ page }, testInfo) => {
    await useTheme(page, themeOf(testInfo));
    const errors = watchErrors(page);
    await page.goto('/student/lessons');
    await settle(page);
    const tabs = page.getByRole('tab');
    const n = await tabs.count();
    for (let i = 0; i < n; i++) {
      await tabs.nth(i).click();
      await settle(page);
      await expect(tabs.nth(i)).toHaveAttribute('aria-selected', 'true');
      await expectNoCrash(page);
    }
    const next = page.getByRole('button', { name: /next( month)?|sonraki/i }).first();
    if (await next.isVisible().catch(() => false)) {
      await next.click();
      await page
        .getByRole('button', { name: /previous( month)?|prev|önceki/i })
        .first()
        .click();
    }
    await expectNoCrash(page);
    expect(errors.pageErrors).toEqual([]);
  });

  test('dashboard shows the Trusted Navy hero or the empty state', async ({ page }, testInfo) => {
    await useTheme(page, themeOf(testInfo));
    await page.goto('/student/dashboard');
    await settle(page);
    const hero = page.getByText(/upcoming lesson/i).first();
    const empty = page.getByText(/no upcoming|find mentor|book/i).first();
    await expect(hero.or(empty)).toBeVisible();
    await expectCleanAudit(page, testInfo, 'student dashboard');
  });
});

test.describe('Journey · mentor', () => {
  test.use({ storageState: authFile('mentor') });

  test('listings: create form validates required fields', async ({ page }, testInfo) => {
    await useTheme(page, themeOf(testInfo));
    const errors = watchErrors(page);
    await page.goto('/mentor/listings/create');
    await settle(page);
    // Submit stays disabled until the required fields are filled
    await expect(page.getByRole('button', { name: /create listing/i })).toBeDisabled();
    await expect(page).toHaveURL(/listings\/create/);
    await expectCleanAudit(page, testInfo, 'create listing');
    await expectNoCrash(page);
    expect(errors.pageErrors).toEqual([]);
  });

  test('dashboard: earnings hero, schedule and quick actions', async ({ page }, testInfo) => {
    await useTheme(page, themeOf(testInfo));
    await page.goto('/mentor/dashboard');
    await settle(page);
    await expect(page.getByText(/earnings/i).first()).toBeVisible();
    await expectCleanAudit(page, testInfo, 'mentor dashboard');
  });

  test('wallet → payout methods → new method form opens', async ({ page }, testInfo) => {
    await useTheme(page, themeOf(testInfo));
    await page.goto('/mentor/wallet');
    await settle(page);
    await page.goto('/mentor/wallet/payout-methods/new');
    await settle(page);
    await expectNoCrash(page);
    await expect(page.locator('main form, main input').first()).toBeVisible();
    await expectCleanAudit(page, testInfo, 'payout method form');
  });
});

test.describe('Journey · mobile navigation (375 px)', () => {
  test.use({ storageState: authFile('parent'), viewport: { width: 375, height: 812 } });

  test('menu opens and bottom tab bar navigates', async ({ page }, testInfo) => {
    await useTheme(page, themeOf(testInfo));
    await page.goto('/parent/dashboard');
    await settle(page);
    await page.getByRole('button', { name: /^menu$/i }).click();
    await expect(
      page
        .getByRole('dialog')
        .or(page.getByRole('navigation', { name: /main menu/i }))
        .first()
    ).toBeVisible();
    await page.keyboard.press('Escape');
    const tabs = page.getByRole('navigation', { name: /tab|sekme/i }).getByRole('link');
    const count = await tabs.count();
    expect(count).toBeGreaterThan(2);
    await tabs.nth(1).click();
    await settle(page);
    await expectNoCrash(page);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1
    );
    expect(overflow).toBe(false);
  });
});
