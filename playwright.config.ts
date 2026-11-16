import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/playwright',
  timeout: 30_000,
  retries: 0,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ['json', { outputFile: 'docs/evaluation/pw-report.json' }],
  ],
  globalSetup: './global-setup.ts',
  use: {
    baseURL: process.env.BASE_URL || 'http://books.toscrape.com',
    headless: true,
    screenshot: 'on',
    video: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
