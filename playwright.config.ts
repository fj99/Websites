import { defineConfig, devices } from '@playwright/test';

const apps = [
  { name: 'saas', port: 4173 },
  { name: 'agency', port: 4174 },
  { name: 'portfolio', port: 4175 },
  { name: 'restaurant', port: 4176 },
  { name: 'real-estate', port: 4177 },
];

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  reporter: 'list',
  use: { trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: apps.map(({ name, port }) => ({
    command: `npm run dev --workspace @templates/${name} -- --host 127.0.0.1 --port ${port}`,
    port,
    reuseExistingServer: true,
  })),
});
