import { test, expect } from '@playwright/test';

// First, let's test just the login page to make sure our foundation works
test('basic login flow', async ({ page }) => {
  // 1. Navigate to login
  await page.goto('/login');
  console.log('Reached login page');

  // 2. Debug: Log the current page content
  console.log('Page content:', await page.content());

  // 3. Fill in credentials - using more flexible selectors
  await page.fill('input[type="text"], input[name="username"]', 'nickelnick');
  await page.fill('input[type="password"]', 'nickels');
  
  // 4. Find and click submit - using multiple possible selectors
  const submitButton = await page.getByRole('button').filter({ hasText: /sign|login|submit/i });
  await submitButton.click();

  // 5. Wait for navigation and verify
  try {
    await page.waitForURL('/dashboard', { timeout: 5000 });
    console.log('Successfully reached dashboard');
  } catch (e) {
    console.log('Navigation failed. Current URL:', page.url());
    console.log('Page content after login attempt:', await page.content());
    throw e;
  }
});

// Let's add a basic protected page test
test('access dashboard after login', async ({ page }) => {
  // 1. Login first
  await page.goto('/login');
  await page.fill('input[type="text"], input[name="username"]', 'nickelnick');
  await page.fill('input[type="password"]', 'nickels');
  const submitButton = await page.getByRole('button').filter({ hasText: /sign|login|submit/i });
  await submitButton.click();
  await page.waitForURL('/dashboard');

  // 2. Verify dashboard access with exact heading match
  await expect(page.getByRole('heading', { 
    name: 'Dashboard',
    exact: true,
    level: 1 
  })).toBeVisible();
}); 