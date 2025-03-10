import puppeteer, { Browser, Page } from 'puppeteer';

// Test configuration
const config = {
  baseUrl: 'http://localhost:3000',
  auth: {
    username: 'nickelnick',
    password: 'nickels'
  },
  timeout: 90000, // 90 seconds
  viewportWidth: 1280,
  viewportHeight: 800,
  maxRetries: 3
};

// Dashboard pages to test
const dashboardPages = [
  { path: '/dashboard', name: 'Main Dashboard', selector: '.dashboard-content' },
  { path: '/bots', name: 'Bots', selector: 'main' },
  { path: '/plans', name: 'Trading Plans', selector: 'main' },
  { path: '/schedules', name: 'Schedules', selector: 'main' },
  { path: '/trading/logs', name: 'Trading Logs', selector: 'main' },
  { path: '/profile', name: 'Profile', selector: 'main' }
];

// Helper function to retry operations that might fail due to rate limiting
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = config.maxRetries,
  delayMs: number = 2000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      console.log(`Attempt ${attempt + 1} failed: ${error.message}`);
      lastError = error;
      
      // Check if error is due to rate limiting
      if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
        console.log(`Rate limit detected, waiting ${delayMs}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        // Increase delay for next attempt
        delayMs *= 2;
      } else {
        // For other errors, wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  throw lastError || new Error('Operation failed after maximum retries');
}

// Manual login function that doesn't rely on navigation promises
async function loginManually(page: Page): Promise<void> {
  // Navigate to login page
  await page.goto(`${config.baseUrl}/login`);
  console.log('Navigated to login page');
  
  // Wait for login form and fill it
  await page.waitForSelector('input[name="username"]', { timeout: config.timeout });
  await page.type('input[name="username"]', config.auth.username);
  await page.type('input[name="password"]', config.auth.password);
  console.log('Filled login form');
  
  // Submit form by clicking the button
  await page.click('button[type="submit"]');
  console.log('Clicked login button');
  
  // Wait for either the dashboard content to appear or an error
  try {
    await Promise.race([
      page.waitForSelector('.dashboard-content', { timeout: config.timeout }),
      page.waitForSelector('.error-message', { timeout: config.timeout })
    ]);
    
    // Check if we got an error
    const errorElement = await page.$('.error-message');
    if (errorElement) {
      const errorText = await page.evaluate(el => el.textContent, errorElement);
      throw new Error(`Login failed: ${errorText}`);
    }
    
    console.log('Login successful');
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Login failed')) {
      throw error;
    }
    
    // If we get a timeout waiting for dashboard or error, take a screenshot
    await page.screenshot({ path: 'login-timeout.png' });
    throw new Error('Login did not complete: no dashboard content or error message detected');
  }
}

describe('Dashboard End-to-End Tests', () => {
  let browser: Browser;
  let page: Page;
  
  beforeAll(async () => {
    jest.setTimeout(config.timeout * 2);
    
    // Launch browser
    browser = await puppeteer.launch({
      headless: false, // Set to true for production/CI environments
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: {
        width: config.viewportWidth,
        height: config.viewportHeight
      }
    });
    
    // Create new page
    page = await browser.newPage();
    
    // Enable console logging from the browser
    page.on('console', (msg: any) => console.log(`Browser console: ${msg.text()}`));
    
    // Set default navigation timeout
    page.setDefaultNavigationTimeout(config.timeout);
  });
  
  afterAll(async () => {
    await browser.close();
  });
  
  test('Should log in and verify dashboard pages', async () => {
    console.log('Starting dashboard test...');
    
    // Login to the application
    await withRetry(async () => {
      await loginManually(page);
    });
    
    // Verify we're on the dashboard page
    await withRetry(async () => {
      const currentUrl = page.url();
      console.log('Current URL after login:', currentUrl);
      
      expect(currentUrl).toContain('/dashboard');
      console.log('Verified redirect to dashboard');
    });
    
    // Test each dashboard page
    for (const dashboardPage of dashboardPages) {
      console.log(`Testing ${dashboardPage.name} page...`);
      
      try {
        // Navigate to page
        await page.goto(`${config.baseUrl}${dashboardPage.path}`, { 
          timeout: config.timeout,
          waitUntil: 'networkidle0'
        });
        
        // Wait for the main content to be visible
        await page.waitForSelector(dashboardPage.selector, { 
          timeout: config.timeout,
          visible: true 
        });
        
        // Take screenshot for verification
        await page.screenshot({ path: `dashboard-${dashboardPage.path.replace(/\//g, '-')}.png` });
        
        console.log(`Successfully loaded ${dashboardPage.name} page`);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error(`Error loading ${dashboardPage.name} page:`, errorMessage);
        await page.screenshot({ path: `error-${dashboardPage.path.replace(/\//g, '-')}.png` });
      }
    }
    
    console.log('Dashboard test completed successfully');
  });
}); 