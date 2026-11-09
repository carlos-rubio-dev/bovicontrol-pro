import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/ui',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['json', { outputFile: 'test-results/ui.json' }]],
  use: {
    baseURL: 'http://127.0.0.1:5018',
    viewport: { width: 1280, height: 900 },
    launchOptions: process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {},
  },
  webServer: {
    command: `"${process.env.BOVI_TEST_PYTHON || 'python'}" tests/serve_ui.py`,
    url: 'http://127.0.0.1:5018/health',
    reuseExistingServer: false,
    timeout: 30000,
  },
})
