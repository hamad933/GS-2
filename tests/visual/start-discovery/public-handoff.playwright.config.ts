import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: 'public-handoff.spec.ts',
  workers: 1,
  retries: 0,
  reporter: 'line',
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
  use: {
    baseURL: 'http://127.0.0.1:4176/',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4176',
    url: 'http://127.0.0.1:4176/start',
    reuseExistingServer: true,
  },
});
