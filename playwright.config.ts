import { defineConfig, devices } from '@playwright/test'

// Use 127.0.0.1 to avoid Windows resolving localhost to ::1 (IPv6) in some environments.
const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000'

export default defineConfig({
  // Important: keep Playwright tests separate from Vitest unit tests.
  // Otherwise Playwright will try to run `tests/unit/*.test.ts` and crash on Vitest imports.
  testDir: './tests/e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html', { open: 'never' }], ['list']],
  webServer: {
    command: 'npm run dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'api',
      testDir: './tests/api',
      testMatch: /.*\.api\.spec\.ts/,
      use: {},
    },
  ],
})

