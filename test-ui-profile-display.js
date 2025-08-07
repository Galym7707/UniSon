// Test script to verify profile name display in UI components
const { chromium } = require('playwright');
const { createClient } = require('@supabase/supabase-js');

// Test configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestUser(firstName, lastName) {
  const testEmail = `test-ui-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`;
  const testPassword = 'TestPassword123!';
  
  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true,
    user_metadata: {
      role: 'job-seeker',
      fullName: `${firstName} ${lastName}`.trim(),
      first_name: firstName,
      last_name: lastName
    }
  });
  
  if (authError) {
    throw new Error(`Auth creation failed: ${authError.message}`);
  }
  
  const userId = authData.user.id;
  
  // Create profile
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      role: 'job-seeker',
      first_name: firstName,
      last_name: lastName,
      email: testEmail
    });
  
  if (profileError) {
    throw new Error(`Profile creation failed: ${profileError.message}`);
  }
  
  return {
    userId,
    email: testEmail,
    password: testPassword,
    firstName,
    lastName,
    expectedName: `${firstName} ${lastName}`.trim()
  };
}

async function cleanupTestUser(userId) {
  await supabase.auth.admin.deleteUser(userId);
}

async function testSignupFlow(browser) {
  console.log('🚀 Testing signup flow UI...');
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Navigate to signup page
    await page.goto(`${appUrl}/auth/signup`);
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Signup page loaded');
    
    // Test job-seeker signup
    const testData = {
      fullName: 'Test User UI',
      email: `test-signup-ui-${Date.now()}@example.com`,
      password: 'TestPassword123!'
    };
    
    // Fill signup form
    await page.click('[data-testid="role-job-seeker"], .cursor-pointer:has-text("Job Seeker")');
    await page.fill('input[id="fullName"]', testData.fullName);
    await page.fill('input[id="email"]', testData.email);
    await page.fill('input[id="password"]', testData.password);
    
    console.log('✅ Form filled with test data');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for success message or redirect
    try {
      await page.waitForSelector('text=Account created', { timeout: 10000 });
      console.log('✅ Signup success message displayed');
    } catch (err) {
      // Check if redirected to dashboard
      await page.waitForURL('**/dashboard', { timeout: 10000 });
      console.log('✅ Redirected to dashboard after signup');
    }
    
  } catch (err) {
    console.error('❌ Signup flow test failed:', err.message);
    await page.screenshot({ path: 'signup-error.png' });
  } finally {
    await context.close();
  }
}

async function testProfileDisplay(browser) {
  console.log('👤 Testing profile display UI...');
  
  // Create test users with different name combinations
  const testUsers = [
    await createTestUser('John', 'Doe'),
    await createTestUser('Jane', ''),
    await createTestUser('', 'Smith'),
    await createTestUser('Mary Jane', 'Watson'),
    await createTestUser('José', 'García')
  ];
  
  for (const user of testUsers) {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      console.log(`Testing display for: ${user.firstName} ${user.lastName}`);
      
      // Login as test user
      await page.goto(`${appUrl}/auth/login`);
      await page.fill('input[type="email"]', user.email);
      await page.fill('input[type="password"]', user.password);
      await page.click('button[type="submit"]');
      
      // Wait for login and navigate to profile
      await page.waitForURL('**/dashboard', { timeout: 10000 });
      await page.goto(`${appUrl}/job-seeker/profile`);
      await page.waitForLoadState('networkidle');
      
      // Check if name is displayed correctly in various UI elements
      const profileTitle = await page.textContent('h1').catch(() => '');
      const nameDisplays = await page.locator('text=' + user.expectedName).count();
      
      if (nameDisplays > 0) {
        console.log(`✅ Name "${user.expectedName}" found in UI`);
      } else {
        console.log(`❌ Name "${user.expectedName}" NOT found in UI`);
        await page.screenshot({ path: `profile-display-error-${user.userId}.png` });
      }
      
      // Check form fields are populated correctly
      const firstNameValue = await page.inputValue('input[id*="first"], input[name*="first"]').catch(() => '');
      const lastNameValue = await page.inputValue('input[id*="last"], input[name*="last"]').catch(() => '');
      
      if (firstNameValue === user.firstName && lastNameValue === user.lastName) {
        console.log('✅ Form fields populated correctly');
      } else {
        console.log(`❌ Form fields incorrect: expected "${user.firstName}"/"${user.lastName}", got "${firstNameValue}"/"${lastNameValue}"`);
      }
      
    } catch (err) {
      console.error(`❌ Profile display test failed for ${user.expectedName}:`, err.message);
    } finally {
      await context.close();
      await cleanupTestUser(user.userId);
    }
  }
}

async function testDashboardDisplay(browser) {
  console.log('📊 Testing dashboard name display...');
  
  const user = await createTestUser('Dashboard', 'Testuser');
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Login
    await page.goto(`${appUrl}/auth/login`);
    await page.fill('input[type="email"]', user.email);
    await page.fill('input[type="password"]', user.password);
    await page.click('button[type="submit"]');
    
    // Check dashboard for name display
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    
    // Look for welcome message or name display
    const welcomeText = await page.textContent('body').catch(() => '');
    
    if (welcomeText.includes(user.expectedName) || welcomeText.includes(user.firstName)) {
      console.log(`✅ Name "${user.expectedName}" displayed on dashboard`);
    } else {
      console.log(`❌ Name "${user.expectedName}" NOT found on dashboard`);
      console.log('Dashboard content preview:', welcomeText.substring(0, 200));
    }
    
  } catch (err) {
    console.error('❌ Dashboard display test failed:', err.message);
  } finally {
    await context.close();
    await cleanupTestUser(user.userId);
  }
}

async function runUITests() {
  console.log('🎭 Starting UI profile display tests\n');
  console.log('='.repeat(60));
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    await testSignupFlow(browser);
    console.log('='.repeat(60));
    await testProfileDisplay(browser);
    console.log('='.repeat(60));
    await testDashboardDisplay(browser);
    console.log('='.repeat(60));
    console.log('🎉 All UI tests completed!');
  } catch (err) {
    console.error('💥 UI test suite failed:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

// Utility function to wait for development server
async function waitForServer(url, maxAttempts = 30) {
  console.log(`⏳ Waiting for server at ${url}...`);
  
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(url);
      if (response.ok || response.status === 404) {
        console.log('✅ Server is ready');
        return true;
      }
    } catch (err) {
      // Server not ready yet
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  throw new Error(`Server at ${url} not ready after ${maxAttempts} seconds`);
}

// Main execution
async function main() {
  try {
    // Wait for development server to be ready
    await waitForServer(appUrl);
    
    // Install Playwright if needed
    try {
      await runUITests();
    } catch (err) {
      if (err.message.includes('browser') || err.message.includes('chromium')) {
        console.log('📦 Installing Playwright browsers...');
        const { execSync } = require('child_process');
        execSync('npx playwright install chromium', { stdio: 'inherit' });
        await runUITests();
      } else {
        throw err;
      }
    }
    
  } catch (err) {
    console.error('💥 Test execution failed:', err.message);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = {
  testSignupFlow,
  testProfileDisplay,
  testDashboardDisplay,
  runUITests,
  createTestUser,
  cleanupTestUser
};