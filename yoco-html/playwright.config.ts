import 'dotenv/config';
import { defineConfig } from '@playwright/test';

const API_BASE = process.env.API_BASE;
const API_TOKEN = process.env.API_TOKEN;

if (!API_BASE) {
  throw new Error('API_BASE is required. Copy .env.example to .env and set API_BASE. Example: API_BASE=https://api.yoco.com');
}
if (!API_TOKEN) {
  throw new Error('API_TOKEN is required. Copy .env.example to .env and set API_TOKEN.');
}

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['allure-playwright', { resultsDir: 'allure-results' }],
  ],
  use: {
    baseURL: API_BASE,
    extraHTTPHeaders: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  },
});
