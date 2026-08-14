import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: 'solutions-workspace.visual.spec.ts',
  workers: 1,
  retries: 0,
  reporter: 'line',
  timeout: 45_000,
  expect: { timeout: 8_000 },
  use: {
    baseURL: 'http://127.0.0.1:4182',
    browserName: 'chromium',
    headless: true,
    screenshot: 'off',
    trace: 'off',
    video: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  webServer: {
    command: 'npx vite ../fixtures/solutions --host 127.0.0.1 --port 4182',
    url: 'http://127.0.0.1:4182',
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
