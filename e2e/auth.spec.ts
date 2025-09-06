import { test, expect } from '@playwright/test';

test('sign in shows error code when credentials invalid', async ({ page }) => {
  await page.goto('http://localhost:8081/auth');

  // Fill in the sign-in form
  await page.fill('#email', 'nonexistent@example.com');
  await page.fill('#password', 'invalidpassword');

  // Submit the form
  await page.click('text=Sign In');

  // Wait for the error message to appear in the UI
  const alert = page.getByRole('alert');
  await expect(alert).toBeVisible({ timeout: 5000 });

  // Ensure the error contains the Supabase error code substring
  await expect(alert).toContainText(/invalid_credentials|email_address_invalid/);
});
