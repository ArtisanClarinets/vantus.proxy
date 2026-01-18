import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('/');
  // Default Next.js starter text
  await expect(page.locator('body')).toContainText('Get started');
});

test('login page loads', async ({ page }) => {
  await page.goto('/auth/login');
  await expect(page.getByRole('heading', { name: 'Vantus Proxy' })).toBeVisible();
});
