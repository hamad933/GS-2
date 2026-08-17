import { defineConfig } from '@playwright/test';

const FIXTURE_URL = 'http://127.0.0.1:4184/tests/visual/fixtures/how-we-work/index.html';

export default defineConfig({
  testDir: '.',
  workers: 1,
  retries: 0,
  reporter: 'line',
  use: {
    baseURL: 'http://127.0.0.1:4184',
    browserName: 'chromium',
    headless: true,
    screenshot: 'off',
    trace: 'off',
    video: 'off',
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
  webServer: {
    command: 'npx vite --host 127.0.0.1 --port 4184',
    cwd: process.cwd(),
    url: FIXTURE_URL,
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
