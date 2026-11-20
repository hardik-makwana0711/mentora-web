import { defineConfig, devices } from '@playwright/test';

/**
 * Mentora web E2E · Trusted Navy rollout.
 *
 * Runs against a LOCAL stack only:
 *   web  → http://localhost:5180  (vite, VITE_API_BASE_URL=http://localhost:4000)
 *   api  → http://localhost:4000  (apps/backend, seeded local Postgres)
 *
 * Projects:
 *   setup          logs in every seeded role once and saves the session
 *   light / dark   desktop Chrome in each theme
 *   mobile-light / mobile-dark   375 px wide Chrome (layout + overflow checks)
 */
const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:5180';

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  workers: process.env.CI ? 2 : 3,
  retries: 0,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'report', open: 'never' }],
    ['json', { outputFile: 'results/results.json' }],
  ],
  use: {
    baseURL: BASE_URL,
    channel: 'chrome',
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    locale: 'en-US',
  },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'light',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        viewport: { width: 1366, height: 860 },
      },
      metadata: { theme: 'light' },
    },
    {
      name: 'dark',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        viewport: { width: 1366, height: 860 },
      },
      metadata: { theme: 'dark' },
    },
    {
      name: 'mobile-light',
      dependencies: ['setup'],
      testMatch: /(01-smoke|03-role-pages)\.spec\.ts/,
      use: {
        channel: 'chrome',
        viewport: { width: 375, height: 812 },
        isMobile: false,
        hasTouch: true,
      },
      metadata: { theme: 'light', mobile: true },
    },
    {
      name: 'mobile-dark',
      dependencies: ['setup'],
      testMatch: /(01-smoke|03-role-pages)\.spec\.ts/,
      use: {
        channel: 'chrome',
        viewport: { width: 375, height: 812 },
        isMobile: false,
        hasTouch: true,
      },
      metadata: { theme: 'dark', mobile: true },
    },
  ],
});
