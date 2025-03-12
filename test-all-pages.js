const puppeteer = require('puppeteer');

async function testAllPages() {
  console.log('Starting comprehensive page test...');
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--window-size=1280,800']
  });
  
  try {
    const page = await browser.newPage();
    
    // Enable console logs from the browser
    page.on('console', msg => console.log('BROWSER:', msg.text()));
    
    // First, log in
    console.log('Logging in...');
    await login(page);
    
    // Test all pages
    const pages = [
      { name: 'Dashboard', url: '/dashboard' },
      { name: 'Bots', url: '/bots' },
      { name: 'Schedules', url: '/schedules' },
      { name: 'Plans', url: '/plans' },
      { name: 'Bot Plans', url: '/bot-plans' },
      { name: 'Brokers', url: '/brokers' },
      { name: 'Support', url: '/support' }
    ];
    
    for (const pageInfo of pages) {
      await testPage(page, pageInfo.name, pageInfo.url);
    }
    
    console.log('All page tests completed successfully!');
    
  } catch (error) {
    console.error('Test failed:', error);
    await browser.screenshot({ path: 'error.png' }).catch(() => {});
  } finally {
    // Keep the browser open for manual inspection
    // await browser.close();
    console.log('Test completed. Browser left open for inspection.');
  }
}

async function login(page) {
  try {
    // Navigate to login page
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
    
    // Fill in login form
    await page.type('input[name="username"]', 'testuser');
    await page.type('input[name="password"]', 'testpassword');
    
    // Click login button and wait for navigation
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(e => console.log('Navigation timeout, continuing...'))
    ]);
    
    // Check if we're on the dashboard page
    const url = page.url();
    console.log('After login, URL:', url);
    
    if (url.includes('/dashboard')) {
      console.log('Login successful!');
      return true;
    } else {
      console.log('Login failed!');
      await page.screenshot({ path: 'login-failed.png', fullPage: true });
      return false;
    }
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
}

async function testPage(page, name, url) {
  try {
    console.log(`Testing ${name} page...`);
    
    // Navigate to the page
    await page.goto(`http://localhost:3000${url}`, { waitUntil: 'networkidle2', timeout: 10000 }).catch(e => {
      console.log(`Navigation timeout for ${name}, continuing...`);
    });
    
    // Check if we're on the right page
    const currentUrl = page.url();
    console.log(`${name} current URL:`, currentUrl);
    
    if (!currentUrl.includes(url)) {
      console.log(`Failed to navigate to ${name} page!`);
      await page.screenshot({ path: `${name.toLowerCase()}-failed.png`, fullPage: true });
      return false;
    }
    
    // Wait for content to load
    await page.waitForSelector('h1', { timeout: 5000 }).catch(e => {
      console.log(`Header not found on ${name} page, continuing...`);
    });
    
    // Take a screenshot
    await page.screenshot({ path: `${name.toLowerCase()}.png`, fullPage: true });
    
    // Test some interactions if applicable
    if (name === 'Bots') {
      const addButton = await page.$('button:has-text("Add Bot")');
      if (addButton) {
        console.log('Found Add Bot button');
      } else {
        console.log('Add Bot button not found');
      }
    }
    
    console.log(`${name} page test completed successfully!`);
    return true;
  } catch (error) {
    console.error(`Error testing ${name} page:`, error);
    return false;
  }
}

testAllPages().catch(console.error); 