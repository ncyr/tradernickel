import { test, expect } from '@playwright/test';

test.describe('Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Go to login page
    await page.goto('/login');
    
    // Fill in login form
    await page.fill('input[name="username"]', 'nickelnick');
    await page.fill('input[name="password"]', 'nickels');
    
    // Click login button
    await page.click('button[type="submit"]');
    
    // Wait for navigation to complete
    await page.waitForURL('**/dashboard');
  });

  const pages = [
    { path: '/dashboard', title: 'Dashboard' },
    { path: '/bots', title: 'Trading Bots' },
    { path: '/plans', title: 'Trading Plans' },
    { path: '/bot-plans', title: 'Bot Plans' },
    { path: '/schedules', title: 'Trading Schedules' },
    { path: '/brokers', title: 'Brokers' },
    { path: '/support', title: 'Support' },
    { path: '/profile', title: 'Profile' },
  ];

  for (const { path, title } of pages) {
    test(`should navigate to ${path}`, async ({ page }) => {
      // Navigate to the page
      await page.click(`a[href="${path}"]`);
      
      // Wait for navigation
      await page.waitForURL(`**${path}`);
      
      // Verify page content
      const heading = await page.getByRole('heading', { name: title });
      await expect(heading).toBeVisible();
      
      // Verify navigation menu is visible
      const nav = await page.getByRole('navigation');
      await expect(nav).toBeVisible();
    });
  }

  test('should be able to logout', async ({ page }) => {
    // Click logout button
    await page.getByRole('button', { name: 'Logout' }).click();
    
    // Should redirect to login page
    await page.waitForURL('**/login');
    
    // Verify login form is visible
    const loginForm = await page.getByRole('form');
    await expect(loginForm).toBeVisible();
  });
}); 