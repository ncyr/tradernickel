import { Page } from '@playwright/test';

export async function login(page: Page, username: string, password: string) {
  await page.goto('/login');
  await page.fill('input[name="username"]', username);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard');
}

export async function logout(page: Page) {
  await page.getByRole('button', { name: 'Logout' }).click();
  await page.waitForURL('**/login');
} 