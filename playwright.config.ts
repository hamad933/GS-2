import { defineConfig } from '@playwright/test';

const previewPort = process.env.PLAYWRIGHT_PORT ?? '4173';
const previewUrl = `http://127.0.0.1:${previewPort}`;

export default defineConfig({
  testDir: './tests/visual',
  workers: 1,
  retries: 0,
  reporter: 'line',
  use: {
    baseURL: previewUrl,
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
    command: `npm run preview -- --host 127.0.0.1 --port ${previewPort}`,
    url: previewUrl,
    reuseExistingServer: process.env.PLAYWRIGHT_REUSE_EXISTING_SERVER === 'true',
  },
});
