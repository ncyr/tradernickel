import { test, expect, Page, Locator } from '@playwright/test';

// Test configuration
const config = {
  auth: {
    username: 'nickelnick',
    password: 'nickels'
  }
};

// Add this at the top of the file
const TIMEOUT = 10000;

// Helper function for finding the main heading
async function findMainHeading(page: Page, possibleTitles: string[]) {
  // Try exact h1 matches first
  for (const title of possibleTitles) {
    const h1 = page.getByRole('heading', { 
      name: title,
      exact: true,
      level: 1 
    });
    if (await h1.count() > 0 && await h1.isVisible()) {
      return h1;
    }
  }
  
  // Try partial matches
  const headingLocator = page.getByRole('heading', { level: 1 }).filter({
    hasText: new RegExp(possibleTitles.join('|'), 'i')
  });
  
  if (await headingLocator.count() > 0) {
    return headingLocator.first();
  }
  
  throw new Error(`Could not find heading matching: ${possibleTitles.join(', ')}`);
}

test.describe('Full App Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    await test.step('Setup', async () => {
      console.log('\n=== Starting Login Setup ===');
      
      // Go to login page and wait for it to be ready
    await page.goto('/login');
      await page.waitForLoadState('networkidle');
      
      // Wait for loading spinner to disappear if present
      try {
        await page.waitForSelector('.MuiCircularProgress-root', { state: 'hidden', timeout: 5000 });
      } catch (e) {
        console.log('No loading spinner found or already hidden');
      }
      
      // Debug login form state
      console.log('Page URL:', await page.url());
      console.log('Page title:', await page.title());
      
      // Wait for form with debug
      try {
        await page.waitForSelector('form', { timeout: TIMEOUT });
        console.log('Form found');
        
        // Log form elements
        const formElements = await page.locator('form').evaluate(form => ({
          inputs: Array.from(form.querySelectorAll('input')).map(i => ({
            type: i.type,
            name: i.name,
            id: i.id
          })),
          buttons: Array.from(form.querySelectorAll('button')).map(b => ({
            type: b.type,
            text: b.textContent
          }))
        }));
        console.log('Form elements:', formElements);
        
        // Fill in form
        await page.fill('input[type="text"], input[name="username"]', config.auth.username);
        await page.fill('input[type="password"]', config.auth.password);
        
        // Find and click submit with debug
        const submitButton = page.getByRole('button').filter({ 
          hasText: /sign in|login|submit/i 
        });
        console.log('Submit button found:', await submitButton.isVisible());
        
        await submitButton.click();
        console.log('Clicked submit');
        
        // Wait for navigation with debug
        await Promise.all([
          page.waitForURL('**/dashboard'),
          page.waitForLoadState('networkidle'),
          page.waitForLoadState('domcontentloaded'),
        ]);
        
        console.log('Navigation complete');
        console.log('Final URL:', await page.url());
        
        // Verify dashboard state
        const dashboardHeading = await page.getByRole('heading', { 
          name: 'Dashboard',
          exact: true,
          level: 1 
        });
        console.log('Dashboard heading visible:', await dashboardHeading.isVisible());
        
        // Check navigation menu
        const navMenu = await page.locator('nav').first();
        console.log('Navigation menu visible:', await navMenu.isVisible());
        if (await navMenu.isVisible()) {
          console.log('Nav menu content:', await navMenu.innerHTML());
        }
      } catch (e) {
        console.error('Login setup failed:', e);
        throw e;
      }
    });
  });

  // Helper function to wait for page load
  async function waitForPageLoad(page: Page) {
    // Wait for loading states
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for loading spinner to disappear if present
    try {
      await page.waitForSelector('.MuiCircularProgress-root', { state: 'hidden', timeout: 5000 });
    } catch (e) {
      console.log('No loading spinner found or already hidden');
    }
    
    // Wait for main content
    await page.waitForSelector('main', { state: 'visible' });
  }

  // Helper function to check navigation
  async function navigateAndVerify(page: Page, linkText: string, expectedUrl: string, expectedHeading: string | string[]) {
    console.log(`Navigating to ${linkText}...`);
    
    // Click and wait for navigation
    await Promise.all([
      page.click(`a:has-text("${linkText}")`),
      page.waitForURL(`**/${expectedUrl}`),
    ]);
    
    await waitForPageLoad(page);
    
    // Debug current state
    console.log('Current URL:', await page.url());
    console.log('Page title:', await page.title());
    
    // Get all headings for debugging
    const headings = await page.getByRole('heading').all();
    console.log('Available headings:', await Promise.all(
      headings.map(async (h: Locator) => ({
        text: (await h.textContent()) || '',
        level: await h.evaluate((el: HTMLElement) => el.tagName.toLowerCase()),
        visible: await h.isVisible()
      }))
    ));
    
    return headings;
  }

  // Update your test cases to use these helpers
  test('navigation flow', async ({ page }) => {
    const pages = [
      { link: 'Dashboard', url: 'dashboard', heading: 'Dashboard' },
      { link: 'Bots', url: 'dashboard/bots', heading: 'Trading Bots' },
      { link: 'Plans', url: 'dashboard/plans', heading: 'Trading Plans' },
      { link: 'Schedules', url: 'dashboard/schedules', heading: 'Schedules' },
      { link: 'Brokers', url: 'dashboard/brokers', heading: ['Brokers', 'Trading Brokers', 'Broker Management'] },
      { link: 'Tickets', url: 'dashboard/tickets', heading: ['Support', 'Support Tickets'] },
      { link: 'Trade Logs', url: 'dashboard/trade-logs', heading: 'Trade Logs' },
      { link: 'Profile', url: 'dashboard/profile', heading: 'Profile' }
    ];

    for (const { link, url, heading } of pages) {
      await test.step(`Navigate to ${link}`, async () => {
        const headings = await navigateAndVerify(page, link, url, heading);
        
        // Check for heading with flexible matching
        const headingTexts = Array.isArray(heading) ? heading : [heading];
        let found = false;
        
        for (const h of headings) {
          const text = await h.textContent();
          if (headingTexts.some(t => text.includes(t)) && await h.isVisible()) {
            found = true;
            break;
          }
        }
        
        if (!found) {
          throw new Error(`Could not find heading matching: ${headingTexts.join(' or ')}`);
        }
      });
    }
  });

  // Keep your other specific test cases but update them to use the helpers
  test('dashboard functionality', async ({ page }) => {
    await test.step('Check dashboard elements', async () => {
      await waitForPageLoad(page);
      
      await expect(page.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Refresh' })).toBeVisible();
      
      // Check dashboard cards
      const cards = [
        { title: 'Active Bots', emoji: '🤖' },
        { title: "Today's Trades", emoji: '📊' },
        { title: 'Profit Today', emoji: '💰' },
        { title: 'Active Schedules', emoji: '🕒' }
      ];

      for (const card of cards) {
        await expect(page.getByText(card.emoji)).toBeVisible();
        await expect(page.getByRole('heading', { name: card.title })).toBeVisible();
      }
    });
  });

  // Test Dashboard
  test('dashboard page and functionality', async ({ page }) => {
    await test.step('Check dashboard elements', async () => {
      await expect(page.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Refresh' })).toBeVisible();
      
      // Check dashboard cards
      const cards = [
        { title: 'Active Bots', emoji: '🤖' },
        { title: "Today's Trades", emoji: '📊' },
        { title: 'Profit Today', emoji: '💰' },
        { title: 'Active Schedules', emoji: '🕒' }
      ];

      for (const card of cards) {
        await expect(page.getByText(card.emoji)).toBeVisible();
        await expect(page.getByRole('heading', { name: card.title })).toBeVisible();
      }
    });
  });

  // Test Bots Page
  test('bots page and functionality', async ({ page }) => {
    await test.step('Navigate and check bots page', async () => {
      await page.click('a:has-text("Bots")');
      await page.waitForURL('**/bots');
      await expect(page.getByRole('heading', { name: 'Trading Bots', level: 1 })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Add Bot' })).toBeVisible();
    });
  });

  // Test Plans Page
  test('plans page and functionality', async ({ page }) => {
    await test.step('Navigate and check plans page', async () => {
      await page.click('a:has-text("Plans")');
      await page.waitForURL('**/plans');
      await expect(page.getByRole('heading', { name: 'Trading Plans', level: 1 })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Create Plan' })).toBeVisible();
    });
  });

  // Test Bot Plans Page
  test('bot plans page and functionality', async ({ page }) => {
    await test.step('Navigate and check bot plans page', async () => {
      await page.click('a:has-text("Bot Plans")');
      await page.waitForURL('**/bot-plans');
      await expect(page.getByRole('heading', { name: 'Bot Plans', level: 1 })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Create Bot Plan' })).toBeVisible();
    });
  });

  // Test Schedules Page
  test('schedules page and functionality', async ({ page }) => {
    await test.step('Navigate and check schedules page', async () => {
      // Click and wait for navigation
      await Promise.all([
        page.click('a:has-text("Schedules")'),
        page.waitForURL('**/schedules'),
        page.waitForLoadState('networkidle'),
      ]);
      
      // Debug logging
      await test.step('Debug page state', async () => {
        console.log('Current URL:', page.url());
        console.log('Page title:', await page.title());
        
        // Log all buttons
        const buttons = await page.getByRole('button').all();
        console.log('Available buttons:', await Promise.all(
          buttons.map(async b => await b.textContent())
        ));
      });

      // Use exact text match for the button
      const addButton = page.getByRole('button', { 
        name: 'New Schedule',
        exact: true 
      });

      // Wait for either the heading or the button to be visible
      await Promise.any([
        expect(page.getByRole('heading', { 
          name: 'Trading Schedules',
          exact: true 
        })).toBeVisible({ timeout: TIMEOUT }),
        expect(addButton).toBeVisible({ timeout: TIMEOUT })
      ]).catch(async (e) => {
        console.log('Page content:', await page.content());
        throw new Error('Could not find schedules page elements: ' + e.message);
      });
    });
  });

  // Test Brokers Page
  test('brokers page and functionality', async ({ page }) => {
    await test.step('Navigate and check brokers page', async () => {
      await Promise.all([
        page.click('a:has-text("Brokers")'),
        page.waitForURL('**/brokers'),
        page.waitForLoadState('networkidle'),
      ]);

      const heading = await findMainHeading(page, [
        'Brokers',
        'Trading Brokers',
        'Broker Management',
        'Broker Connections'
      ]);
      
      await expect(heading).toBeVisible();
    });
  });

  // Test Profile Page
  test('profile page and functionality', async ({ page }) => {
    await test.step('Navigate and check profile page', async () => {
      await page.click('a:has-text("Profile")');
      await page.waitForURL('**/profile');
      await expect(page.getByRole('heading', { name: 'Profile', level: 1 })).toBeVisible();
    });
  });

  // Test Support Page
  test('support page and functionality', async ({ page }) => {
    await test.step('Navigate and check support page', async () => {
      await page.click('a:has-text("Support")');
      await page.waitForURL('**/support');
      await expect(page.getByRole('heading', { name: 'Support', level: 1 })).toBeVisible();
    });
  });

  // Test Logout
  test('logout functionality', async ({ page }) => {
    await test.step('Perform logout', async () => {
    await page.getByRole('button', { name: 'Logout' }).click();
      await page.waitForURL('**/login');
      await expect(page.getByRole('button', { name: /sign in|login/i })).toBeVisible();
    });
  });

  // Test Error Handling
  test('error page handling', async ({ page }) => {
    await test.step('Check 404 page', async () => {
      await page.goto('/non-existent-page');
      await expect(page.getByText(/404|not found/i)).toBeVisible();
    });
  });

  // Test Navigation Menu
  test('navigation menu functionality', async ({ page }) => {
    await test.step('Check navigation menu', async () => {
      // First find any navigation element
      const navElements = await page.locator('nav, [role="navigation"]').all();
      console.log('Found nav elements:', navElements.length);
      
      // Try different navigation patterns
      const menuItems = [
        { name: 'Dashboard', patterns: ['a[href="/dashboard"]', 'a:has-text("Dashboard")'] },
        { name: 'Bots', patterns: ['a[href="/bots"]', 'a:has-text("Bots")'] },
        { name: 'Plans', patterns: ['a[href="/plans"]', 'a:has-text("Plans")'] },
        { name: 'Bot Plans', patterns: ['a[href="/bot-plans"]', 'a:has-text("Bot Plans")'] },
        { name: 'Schedules', patterns: ['a[href="/schedules"]', 'a:has-text("Schedules")'] },
        { name: 'Brokers', patterns: ['a[href="/brokers"]', 'a:has-text("Brokers")'] },
        { name: 'Support', patterns: ['a[href="/support"]', 'a:has-text("Support")'] },
        { name: 'Profile', patterns: ['a[href="/profile"]', 'a:has-text("Profile")'] }
      ];
      
      for (const item of menuItems) {
        console.log(`Checking ${item.name}...`);
        for (const pattern of item.patterns) {
          console.log(`Trying pattern: ${pattern}`);
          const element = page.locator(pattern);
          if (await element.isVisible()) {
            console.log(`${item.name} found!`);
            break;
          }
        }
      }
    });
  });
}); 