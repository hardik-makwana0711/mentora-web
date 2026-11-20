import { test, expect, type Page } from '@playwright/test';
import {
  authFile,
  expectNoCrash,
  settle,
  themeOf,
  useTheme,
  watchErrors,
  type Role,
} from './helpers';

/**
 * Level 4 · every button and link.
 * For each role's main pages: press every visible, safe button/link one at a time
 * (fresh page each time), and check the app does not crash or throw.
 * Destructive or irreversible actions are never pressed.
 */
const DANGEROUS =
  /log ?out|çıkış|delete|sil\b|remove|kaldır|cancel lesson|iptal|deactivate|suspend|reject|reddet|approve|onayla|pay\b|öde|checkout|confirm|request payout|withdraw|submit|send|gönder|save|kaydet|publish|yayınla|upload|yükle|report|bildir|block|reset|regenerate|join|katıl|book|rezerv|activate|deactivate|active|inactive|pause|resume|status|durum|favou?rite|favori|bookmark|kaydedil|hide|gizle|toggle|archive|arşiv/i;

const PAGES: Record<Exclude<Role, 'admin'>, string[]> = {
  parent: ['dashboard', 'lessons', 'wallet', 'students', 'search', 'profile'],
  student: ['dashboard', 'lessons', 'materials', 'search', 'profile'],
  mentor: ['dashboard', 'availability', 'listings', 'wallet', 'earnings', 'profile'],
};

type Control = { idx: number; name: string; tag: string; href: string | null };

async function listControls(page: Page): Promise<Control[]> {
  return page.evaluate((dangerSrc) => {
    const danger = new RegExp(dangerSrc, 'i');
    const main = document.querySelector('main') ?? document.body;
    const els = [
      ...main.querySelectorAll<HTMLElement>('button, a[href], [role="button"], [role="tab"]'),
    ];
    return els
      .map((el, idx) => {
        const r = el.getBoundingClientRect();
        const name = (
          el.getAttribute('aria-label') ||
          el.innerText ||
          el.getAttribute('title') ||
          ''
        )
          .trim()
          .replace(/\s+/g, ' ')
          .slice(0, 60);
        const disabled =
          (el as HTMLButtonElement).disabled || el.getAttribute('aria-disabled') === 'true';
        const external =
          el.tagName === 'A' &&
          /^(https?:|mailto:|tel:)/.test(el.getAttribute('href') ?? '') &&
          !(el.getAttribute('href') ?? '').includes(location.host);
        const type = el.getAttribute('type');
        // State toggles (switches, pressed buttons, checkboxes) change data, so they are never pressed
        const isToggle =
          el.getAttribute('role') === 'switch' ||
          el.hasAttribute('aria-pressed') ||
          el.hasAttribute('aria-checked') ||
          !!el.querySelector('[role="switch"], input[type="checkbox"]');
        const ok =
          r.width > 0 &&
          r.height > 0 &&
          !disabled &&
          !external &&
          !isToggle &&
          type !== 'submit' &&
          !danger.test(name);
        return ok
          ? { idx, name, tag: el.tagName.toLowerCase(), href: el.getAttribute('href') }
          : null;
      })
      .filter(
        (x): x is { idx: number; name: string; tag: string; href: string | null } => x !== null
      );
  }, DANGEROUS.source);
}

for (const role of Object.keys(PAGES) as Exclude<Role, 'admin'>[]) {
  test.describe(`Buttons · ${role}`, () => {
    test.use({ storageState: authFile(role) });
    for (const sub of PAGES[role]) {
      const path = `/${role}/${sub}`;
      test(`press every safe control on ${path}`, async ({ page }, testInfo) => {
        test.setTimeout(420_000);
        await useTheme(page, themeOf(testInfo));
        const errors = watchErrors(page);
        await page.goto(path);
        await settle(page);
        const controls = await listControls(page);
        testInfo.annotations.push({
          type: 'controls',
          description: `${controls.length} safe controls on ${path}`,
        });
        const pressed: string[] = [];

        for (const c of controls.slice(0, 30)) {
          await page.goto(path);
          await settle(page);
          const el = page
            .locator('main')
            .locator('button, a[href], [role="button"], [role="tab"]')
            .nth(c.idx);
          if (!(await el.isVisible().catch(() => false))) continue;
          await el.scrollIntoViewIfNeeded().catch(() => undefined);
          await el.click({ timeout: 5_000, trial: false }).catch(() => undefined);
          await page.waitForTimeout(500);
          // Close any dialog or menu it opened
          await page.keyboard.press('Escape').catch(() => undefined);
          await expectNoCrash(page);
          pressed.push(`${c.tag} "${c.name}" → ${new URL(page.url()).pathname}`);
        }
        await testInfo.attach('pressed controls', {
          body: pressed.join('\n'),
          contentType: 'text/plain',
        });
        expect(errors.pageErrors, 'uncaught page errors while pressing controls').toEqual([]);
        if (errors.consoleErrors.length)
          testInfo.annotations.push({
            type: 'console-errors',
            description: errors.consoleErrors.slice(0, 5).join(' | '),
          });
      });
    }
  });
}

test.describe('Buttons · shell navigation', () => {
  for (const role of ['parent', 'student', 'mentor'] as const) {
    test.describe(role, () => {
      test.use({ storageState: authFile(role) });
      test(`${role}: every sidebar link opens its page`, async ({ page }, testInfo) => {
        await useTheme(page, themeOf(testInfo));
        const errors = watchErrors(page);
        await page.goto(`/${role}/dashboard`);
        await settle(page);
        const nav = page.getByRole('navigation', { name: /main menu/i });
        const links = nav.getByRole('link');
        await expect(links.first()).toBeVisible({ timeout: 20_000 }); // count() does not auto-wait
        const count = await links.count();
        expect(count, 'sidebar has links').toBeGreaterThan(3);
        const visited: string[] = [];
        for (let i = 0; i < count; i++) {
          const link = links.nth(i);
          const href = await link.getAttribute('href');
          const label = (await link.innerText()).trim().split('\n')[0];
          await link.click();
          await settle(page);
          await expectNoCrash(page);
          if (href)
            await expect(page, `sidebar "${label}"`).toHaveURL(
              new RegExp(href.replace(/\//g, '\\/'))
            );
          await expect(link, `"${label}" marked active`).toHaveAttribute('aria-current', 'page');
          visited.push(`${label} → ${href}`);
        }
        await testInfo.attach('sidebar', { body: visited.join('\n'), contentType: 'text/plain' });
        expect(errors.pageErrors).toEqual([]);
      });

      test(`${role}: header controls (theme, language, notifications, profile menu)`, async ({
        page,
      }, testInfo) => {
        const theme = themeOf(testInfo);
        await useTheme(page, theme);
        await page.goto(`/${role}/dashboard`);
        await settle(page);
        const other = theme === 'dark' ? 'light' : 'dark';
        await page
          .getByRole('button', { name: new RegExp(`switch to ${other} mode`, 'i') })
          .first()
          .click();
        await expect(page.locator('html')).toHaveAttribute('data-theme', other);
        await page
          .getByRole('button', { name: new RegExp(`switch to ${theme} mode`, 'i') })
          .first()
          .click();
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);

        const lang = page
          .getByRole('group', { name: /select language|dil seç/i })
          .filter({ visible: true })
          .first();
        await lang.getByRole('button', { name: /turkish|türkçe/i }).click();
        await expect(page.getByRole('navigation', { name: /ana menü|menü/i })).toBeVisible();
        await lang.getByRole('button', { name: /english|ngilizce/i }).click();
        await expect(page.getByRole('navigation', { name: /main menu/i })).toBeVisible();

        await page.getByRole('button', { name: /^notifications$/i }).click();
        await expect(page).toHaveURL(new RegExp(`/${role}/notifications`));
      });
    });
  }
});
