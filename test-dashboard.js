const puppeteer = require('puppeteer');

async function testDashboard() {
  console.log('Starting dashboard test...');
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--window-size=1280,800']
  });
  
  try {
    const page = await browser.newPage();
    
    // Enable console logs from the browser
    page.on('console', msg => console.log('BROWSER:', msg.text()));
    
    // Navigate to login page
    console.log('Navigating to login page...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
    
    // Fill in login form
    console.log('Filling login form...');
    await page.type('input[name="username"]', 'testuser');
    await page.type('input[name="password"]', 'testpassword');
    
    // Click login button and wait for navigation
    console.log('Submitting login form...');
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(e => console.log('Navigation timeout, continuing...'))
    ]);
    
    // Check if we're on the dashboard page
    console.log('Checking current URL...');
    const url = page.url();
    console.log('Current URL:', url);
    
    if (url.includes('/dashboard')) {
      console.log('Successfully navigated to dashboard!');
      
      // Wait for dashboard content to load
      await page.waitForSelector('h1', { timeout: 5000 }).catch(e => console.log('Header not found, continuing...'));
      
      // Test navigation to other pages
      console.log('Testing navigation to Bots page...');
      const botLink = await page.$('a[href="/bots"]');
      if (botLink) {
        await Promise.all([
          botLink.click(),
          page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 5000 }).catch(e => console.log('Navigation timeout, continuing...'))
        ]);
        console.log('Current URL after clicking Bots:', page.url());
      } else {
        console.log('Bots link not found');
      }
      
      // Take a screenshot
      await page.screenshot({ path: 'dashboard-test.png', fullPage: true });
      
      // Get localStorage data
      const localStorage = await page.evaluate(() => {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          data[key] = localStorage.getItem(key);
        }
        return data;
      });
      
      console.log('LocalStorage data:', localStorage);
      
      // Get cookies
      const cookies = await page.cookies();
      console.log('Cookies:', cookies);
      
    } else {
      console.log('Failed to navigate to dashboard');
      await page.screenshot({ path: 'login-failed.png', fullPage: true });
    }
    
  } catch (error) {
    console.error('Test failed:', error);
    await browser.screenshot({ path: 'error.png' }).catch(() => {});
  } finally {
    // Keep the browser open for manual inspection
    // await browser.close();
    console.log('Test completed. Browser left open for inspection.');
  }
}

testDashboard().catch(console.error); 