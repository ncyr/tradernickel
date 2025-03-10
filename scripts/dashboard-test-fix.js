#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');

const execAsync = util.promisify(exec);

console.log('📊 Dashboard Testing & Fixing Script');
console.log('====================================');

// Configuration
const config = {
  frontendPort: 3000,
  apiPort: 443,
  username: 'nickelnick',
  password: 'nickels',
  projectRoot: path.resolve(__dirname, '..')
};

// Helper function to check if a process is running on a port
async function isProcessRunningOnPort(port) {
  try {
    const { stdout } = await execAsync(`lsof -i:${port} -t`);
    return !!stdout.trim();
  } catch (error) {
    return false;
  }
}

// Helper function to install dependencies
async function installDependencies() {
  console.log('\n📦 Installing required dependencies...');
  
  return new Promise((resolve, reject) => {
    const install = spawn('npm', ['install'], { 
      cwd: config.projectRoot,
      stdio: 'inherit'
    });
    
    install.on('close', code => {
      if (code === 0) {
        console.log('✅ Dependencies installed successfully');
        resolve();
      } else {
        console.error('❌ Failed to install dependencies');
        reject(new Error('Dependency installation failed'));
      }
    });
  });
}

// Start the frontend server if it's not running
async function ensureFrontendRunning() {
  console.log('\n🔍 Checking if frontend is running...');
  
  const isFrontendRunning = await isProcessRunningOnPort(config.frontendPort);
  
  if (isFrontendRunning) {
    console.log('✅ Frontend is already running');
    return;
  }
  
  console.log('🚀 Starting frontend server...');
  
  return new Promise((resolve) => {
    const frontend = spawn('npm', ['run', 'dev'], { 
      cwd: config.projectRoot,
      detached: true,
      stdio: 'ignore'
    });
    
    frontend.unref();
    
    // Give it some time to start
    setTimeout(() => {
      console.log('✅ Frontend server started');
      resolve();
    }, 10000);
  });
}

// Check API accessibility with retry mechanism
async function checkApiAccessibility() {
  console.log('\n🔍 Checking API server accessibility...');
  
  const maxRetries = 3;
  let retryCount = 0;
  let lastError = null;
  
  while (retryCount < maxRetries) {
    try {
      const { stdout } = await execAsync('curl -s https://api-local.tradernickel.com/');
      const response = JSON.parse(stdout);
      
      if (response.message && response.message.includes('ALIVE')) {
        console.log('✅ API server is accessible');
        return true;
      } else {
        console.error('❌ API server returned unexpected response');
        lastError = new Error('Unexpected API response');
      }
    } catch (error) {
      console.error(`❌ Attempt ${retryCount + 1}/${maxRetries}: Could not access API server:`, error.message);
      lastError = error;
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 2000 * Math.pow(2, retryCount)));
    }
    
    retryCount++;
  }
  
  console.error('❌ Failed to access API server after multiple attempts');
  console.error('Last error:', lastError?.message || 'Unknown error');
  return false;
}

// Fix API client to handle rate limiting
async function fixApiClient() {
  console.log('\n🔧 Checking API client configuration...');
  
  const apiClientPath = path.join(config.projectRoot, 'src/services/api/index.ts');
  let apiClientContent = fs.readFileSync(apiClientPath, 'utf8');
  
  let updated = false;
  
  // Check if we need to add rate limiting handling
  if (!apiClientContent.includes('handleRateLimiting') && !apiClientContent.includes('429')) {
    console.log('🔧 Adding rate limiting handling to API client...');
    
    // Find the interceptors.response.use block
    const interceptorMatch = apiClientContent.match(/api\.interceptors\.response\.use\(\s*\([^)]*\)\s*=>\s*{[^}]*}/);
    
    if (interceptorMatch) {
      const insertPos = apiClientContent.indexOf('// Handle token expiration');
      if (insertPos !== -1) {
        const rateLimitingCode = `
    // Handle rate limiting
    if (error.response?.status === 429) {
      console.warn('Rate limit exceeded. Will retry after delay...');
      const retryAfter = error.response.headers['retry-after'] || 2;
      const retryMs = parseInt(retryAfter, 10) * 1000;
      
      return new Promise(resolve => {
        console.log(\`Waiting \${retryMs}ms before retrying request...\`);
        setTimeout(() => {
          console.log('Retrying rate limited request...');
          resolve(api(originalRequest));
        }, retryMs);
      });
    }
    
`;
        
        apiClientContent = apiClientContent.slice(0, insertPos) + rateLimitingCode + apiClientContent.slice(insertPos);
        fs.writeFileSync(apiClientPath, apiClientContent);
        updated = true;
      }
    }
  }
  
  if (updated) {
    console.log('✅ API client updated to handle rate limiting');
  } else {
    console.log('✅ API client already has rate limiting handling or couldn\'t be updated');
  }
}

// Fix common dashboard issues
async function fixDashboardIssues() {
  console.log('\n🔧 Checking for common dashboard issues...');
  
  // 1. Check if API client is properly imported in dashboard page
  const dashboardPath = path.join(config.projectRoot, 'src/app/dashboard/page.tsx');
  let dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
  
  // Fix import statements if needed
  if (dashboardContent.includes("import { api } from '@/services/api/index'")) {
    console.log('🔧 Fixing API client import in dashboard page...');
    dashboardContent = dashboardContent.replace(
      "import { api } from '@/services/api/index'", 
      "import api from '@/services/api'"
    );
    fs.writeFileSync(dashboardPath, dashboardContent);
    console.log('✅ Fixed API client import');
  }
  
  // 2. Check and fix authentication service usage
  if (!dashboardContent.includes('await authService.getCurrentUser()')) {
    console.log('🔧 Fixing auth service usage in dashboard page...');
    // This would require more complex code transformation
    console.log('⚠️ Manual review needed for auth service implementation');
  }
  
  // 3. Check fetchDashboardData implementation
  if (!dashboardContent.includes('fetchDashboardData')) {
    console.log('🔧 Adding fetchDashboardData implementation...');
    // This would require more complex code transformation
    console.log('⚠️ Manual review needed for fetchDashboardData implementation');
  }
  
  // 4. Check API client configuration
  const apiClientPath = path.join(config.projectRoot, 'src/services/api/index.ts');
  const apiClientContent = fs.readFileSync(apiClientPath, 'utf8');
  
  if (!apiClientContent.includes('interceptors.request.use') || 
      !apiClientContent.includes('interceptors.response.use')) {
    console.log('⚠️ API client may be missing interceptors');
  }
  
  console.log('✅ Dashboard issues check completed');
}

// Run the E2E tests
async function runE2ETests() {
  console.log('\n🧪 Running E2E tests...');
  
  return new Promise((resolve) => {
    const test = spawn('npm', ['run', 'test:e2e'], { 
      cwd: config.projectRoot,
      stdio: 'inherit'
    });
    
    test.on('close', code => {
      if (code === 0) {
        console.log('✅ E2E tests passed successfully');
      } else {
        console.log('⚠️ E2E tests failed with code:', code);
      }
      resolve();
    });
  });
}

// Main function
async function main() {
  try {
    await installDependencies();
    await ensureFrontendRunning();
    const isApiAccessible = await checkApiAccessibility();
    
    if (!isApiAccessible) {
      console.error('❌ Cannot proceed: API server is not accessible');
      process.exit(1);
    }
    
    await fixApiClient();
    await fixDashboardIssues();
    await runE2ETests();
    
    console.log('\n🎉 Dashboard testing and fixing completed!');
    console.log('Please check the test results and screenshots for any remaining issues.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();