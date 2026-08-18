import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: ['start-discovery.spec.ts', 'ipa-remediation.spec.ts'],
  workers: 1,
  retries: 0,
  reporter: 'line',
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
  use: {
    baseURL: 'http://127.0.0.1:4174/tests/visual/fixtures/start-discovery/',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4174',
    url: 'http://127.0.0.1:4174/tests/visual/fixtures/start-discovery/',
    reuseExistingServer: true,
  },
});
