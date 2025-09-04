import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('http://localhost:8080/');
  await expect(page).toHaveTitle(/Ihundo|Client Portal|Admin Dashboard/);
});
