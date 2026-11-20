import { expect, type Page, type TestInfo } from '@playwright/test';
import path from 'node:path';

export type Role = 'parent' | 'student' | 'mentor' | 'admin';

/**
 * Seeded LOCAL test accounts (apps/backend/prisma/seed.ts). Override with env vars
 * E2E_<ROLE>_EMAIL / E2E_<ROLE>_PASSWORD. Never point this suite at production.
 */
export const ACCOUNTS: Record<Role, { email: string; password: string; home: RegExp }> = {
  parent: {
    email: process.env.E2E_PARENT_EMAIL ?? 'parent.seed@mentora.dev',
    password: process.env.E2E_PARENT_PASSWORD ?? 'Parent@123',
    home: /\/parent\/dashboard/,
  },
  student: {
    email: process.env.E2E_STUDENT_EMAIL ?? 'student.seed@mentora.dev',
    password: process.env.E2E_STUDENT_PASSWORD ?? 'Student@123',
    home: /\/student\/dashboard/,
  },
  mentor: {
    email: process.env.E2E_MENTOR_EMAIL ?? 'mentor.seed@mentora.dev',
    password: process.env.E2E_MENTOR_PASSWORD ?? 'Mentor@123',
    home: /\/mentor\/(dashboard|verification)/,
  },
  admin: {
    email: process.env.E2E_ADMIN_EMAIL ?? 'admin.seed@mentora.dev',
    password: process.env.E2E_ADMIN_PASSWORD ?? 'Admin@123',
    home: /\/admin/,
  },
};

export const authFile = (role: Role) => path.join(__dirname, '..', '.auth', `${role}.json`);

export function themeOf(testInfo: TestInfo): 'light' | 'dark' {
  return (testInfo.project.metadata?.theme as 'light' | 'dark') ?? 'light';
}

export function isMobile(testInfo: TestInfo): boolean {
  return Boolean(testInfo.project.metadata?.mobile);
}

/** Applies the project's theme (and English) before any page script runs. */
export async function useTheme(page: Page, theme: 'light' | 'dark') {
  await page.addInitScript(
    ([t]) => {
      localStorage.setItem('mentora:theme', t);
      if (!localStorage.getItem('mentora:locale')) localStorage.setItem('mentora:locale', 'en');
    },
    [theme]
  );
}

/** Collects uncaught page errors and console errors for the whole test. */
export function watchErrors(page: Page) {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const t = m.text();
    // Network noise from features that are not configured locally (Meet, S3, sockets)
    if (
      /Failed to load resource|ERR_CONNECTION_REFUSED|WebSocket|socket\.io|status of 40[134]/i.test(
        t
      )
    )
      return;
    consoleErrors.push(t.slice(0, 300));
  });
  return { pageErrors, consoleErrors };
}

/** Waits for the SPA to settle: no loading spinner, network mostly idle. */
export async function settle(page: Page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);
  await page.waitForTimeout(400);
}

export async function expectNoCrash(page: Page) {
  await expect(page.getByText(/something went wrong|bir şeyler ters gitti/i)).toHaveCount(0);
}

export type AuditResult = {
  small: string[];
  lowContrast: string[];
  overflowX: boolean;
  unnamedControls: string[];
  tinyTargets: string[];
};

/**
 * In-page design audit (Trusted Navy acceptance UI-03, UI-07, UI-09, A11Y-02):
 * - text smaller than 12 px
 * - text contrast under WCAG AA (4.5:1, or 3:1 for large text) on solid backgrounds
 * - horizontal overflow
 * - buttons/links without an accessible name
 * - tap targets smaller than 24×24 px
 */
export async function audit(page: Page): Promise<AuditResult> {
  return page.evaluate(() => {
    const parse = (c: string) => {
      const m = c.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const p = m[1]
        .split(/[ ,/]+/)
        .filter(Boolean)
        .map(Number);
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    };
    type C = { r: number; g: number; b: number; a: number };
    const lum = (c: C) => {
      const f = (v: number) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      };
      return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
    };
    const blend = (t: C, b: C): C => ({
      r: t.r * t.a + b.r * (1 - t.a),
      g: t.g * t.a + b.g * (1 - t.a),
      b: t.b * t.a + b.b * (1 - t.a),
      a: 1,
    });
    const bgOf = (el: Element): C | null => {
      const layers: C[] = [];
      let n: Element | null = el;
      while (n) {
        const cs = getComputedStyle(n);
        if (
          cs.backgroundImage &&
          cs.backgroundImage !== 'none' &&
          !cs.backgroundImage.startsWith('url')
        )
          return null;
        if (cs.filter && cs.filter !== 'none') return null;
        const c = parse(cs.backgroundColor);
        if (c && c.a > 0) {
          layers.push(c);
          if (c.a >= 1) break;
        }
        n = n.parentElement;
      }
      let base: C = { r: 255, g: 255, b: 255, a: 1 };
      if (!layers.length || layers[layers.length - 1].a < 1) {
        const b = parse(getComputedStyle(document.body).backgroundColor);
        if (b && b.a > 0) base = b;
      }
      for (let i = layers.length - 1; i >= 0; i--)
        base = layers[i].a >= 1 ? layers[i] : blend(layers[i], base);
      return base;
    };
    const visible = (el: Element) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return false;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || Number(cs.opacity) === 0) return false;
      if (el.closest('[aria-hidden="true"]')) return false;
      return true;
    };
    const effectiveOpacity = (el: Element) => {
      let o = 1;
      let n: Element | null = el;
      while (n) {
        o *= Number(getComputedStyle(n).opacity);
        n = n.parentElement;
      }
      return o;
    };

    const small: string[] = [];
    const lowContrast: string[] = [];
    const seen = new Set<string>();
    document.querySelectorAll('body *').forEach((el) => {
      const own = [...el.childNodes]
        .filter((n) => n.nodeType === 3 && n.textContent && n.textContent.trim())
        .map((n) => n.textContent!.trim())
        .join(' ');
      if (!own || !visible(el)) return;
      if (el.closest('svg, [data-e2e-ignore-contrast]')) return;
      const cs = getComputedStyle(el);
      const fs = parseFloat(cs.fontSize);
      const txt = own.slice(0, 50);
      if (fs < 12) small.push(`${fs}px "${txt}"`);
      // Disabled controls are exempt from contrast rules (WCAG 1.4.3)
      if (el.closest('button:disabled, [aria-disabled="true"], input:disabled')) return;
      if (effectiveOpacity(el) < 0.95) return;
      const fg = parse(cs.color);
      const bg = bgOf(el);
      if (!fg || !bg) return;
      const f = fg.a < 1 ? blend(fg, bg) : fg;
      const L1 = lum(f);
      const L2 = lum(bg);
      const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
      const big = fs >= 24 || (fs >= 18.66 && Number(cs.fontWeight) >= 700);
      if (ratio < (big ? 3 : 4.5)) {
        const key = txt + cs.color;
        if (!seen.has(key)) {
          seen.add(key);
          lowContrast.push(
            `${ratio.toFixed(2)}:1 ${fs}px "${txt}" (${cs.color} on rgb(${[bg.r, bg.g, bg.b].map(Math.round).join(',')}))`
          );
        }
      }
    });

    const unnamedControls: string[] = [];
    const tinyTargets: string[] = [];
    document
      .querySelectorAll(
        'button, a[href], [role="button"], input:not([type="hidden"]), select, textarea'
      )
      .forEach((el) => {
        if (!visible(el)) return;
        const he = el as HTMLElement;
        const name =
          he.getAttribute('aria-label') ||
          he.getAttribute('aria-labelledby') ||
          he.getAttribute('title') ||
          (he as HTMLInputElement).labels?.[0]?.textContent ||
          he.getAttribute('placeholder') ||
          he.innerText?.trim() ||
          he.querySelector('img[alt]')?.getAttribute('alt');
        const desc = `${el.tagName.toLowerCase()}${he.className && typeof he.className === 'string' ? '.' + he.className.split(' ').slice(0, 2).join('.') : ''}`;
        if (!name || !String(name).trim()) unnamedControls.push(desc);
        const r = he.getBoundingClientRect();
        const inline = getComputedStyle(he).display === 'inline' && el.tagName === 'A';
        if (!inline && (r.width < 24 || r.height < 24))
          tinyTargets.push(
            `${Math.round(r.width)}×${Math.round(r.height)} ${desc} "${String(name ?? '')
              .trim()
              .slice(0, 30)}"`
          );
      });

    return {
      small: small.slice(0, 20),
      lowContrast: lowContrast.slice(0, 20),
      overflowX: document.documentElement.scrollWidth > window.innerWidth + 1,
      unnamedControls: [...new Set(unnamedControls)].slice(0, 20),
      tinyTargets: [...new Set(tinyTargets)].slice(0, 20),
    };
  });
}

/** Attaches audit findings to the report and fails on hard rules (text size, contrast, overflow, names). */
export async function expectCleanAudit(page: Page, testInfo: TestInfo, label: string) {
  const a = await audit(page);
  await testInfo.attach(`audit ${label}`, {
    body: JSON.stringify(a, null, 2),
    contentType: 'application/json',
  });
  if (a.tinyTargets.length)
    testInfo.annotations.push({
      type: 'tiny-targets',
      description: `${label}: ${a.tinyTargets.join(' | ')}`,
    });
  expect.soft(a.small, `${label}: text under 12px`).toEqual([]);
  expect.soft(a.lowContrast, `${label}: low contrast text`).toEqual([]);
  expect.soft(a.overflowX, `${label}: horizontal overflow`).toBe(false);
  expect.soft(a.unnamedControls, `${label}: controls without accessible name`).toEqual([]);
  return a;
}
