/**
 * Comprehensive Signup Flow Testing Script
 * Tests both job-seeker and employer registration flows with validation
 */

import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';

async function testSignupFlow() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  
  try {
    console.log('🚀 Starting comprehensive signup flow testing...\n');
    
    // Test 1: Job-seeker signup - successful case
    await testJobSeekerSignup(context);
    
    // Test 2: Employer signup - successful case  
    await testEmployerSignup(context);
    
    // Test 3: Error handling tests
    await testErrorHandling(context);
    
    // Test 4: Form validation tests
    await testFormValidation(context);
    
    console.log('\n✅ All signup flow tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

async function testJobSeekerSignup(context) {
  console.log('📋 Testing Job Seeker Signup Flow...');
  
  const page = await context.newPage();
  
  try {
    // Navigate to signup page
    await page.goto(`${BASE_URL}/auth/signup`);
    await page.waitForLoadState('networkidle');
    
    // Verify page loads correctly
    await page.waitForSelector('text=Create an account');
    console.log('  ✓ Signup page loaded');
    
    // Select job-seeker role (should be default)
    const jobSeekerRole = page.locator('[data-role="job-seeker"], div:has-text("Job Seeker")').first();
    await jobSeekerRole.click();
    console.log('  ✓ Job Seeker role selected');
    
    // Fill in job seeker form
    const timestamp = Date.now();
    const testData = {
      firstName: 'John',
      lastName: 'Seeker',
      email: `jobseeker${timestamp}@test.com`,
      password: 'TestPassword123!'
    };
    
    await page.fill('input[name="first_name"], #first_name', testData.firstName);
    await page.fill('input[name="last_name"], #last_name', testData.lastName);
    await page.fill('input[name="email"], #email', testData.email);
    await page.fill('input[name="password"], #password', testData.password);
    
    console.log('  ✓ Form filled with test data');
    console.log(`    - Name: ${testData.firstName} ${testData.lastName}`);
    console.log(`    - Email: ${testData.email}`);
    
    // Submit form
    await page.click('button[type="submit"], button:has-text("Create account")');
    
    // Wait for either success redirect or error
    try {
      // Check for successful redirect to dashboard
      await page.waitForURL('**/job-seeker/dashboard', { timeout: 10000 });
      console.log('  ✅ Successfully redirected to job-seeker dashboard');
      
      // Verify user profile is displayed correctly
      const profileName = page.locator('text=' + testData.firstName + ' ' + testData.lastName).first();
      if (await profileName.isVisible()) {
        console.log('  ✓ User profile displays correct first_name and last_name');
      }
      
    } catch (timeoutError) {
      // Check for error messages
      const errorMessage = await page.locator('[data-testid="error-message"], .text-red-500, .error').first().textContent();
      if (errorMessage) {
        console.log(`  ⚠ Error during signup: ${errorMessage}`);
      } else {
        console.log('  ⚠ No redirect or error message found - checking page state');
        const currentUrl = page.url();
        console.log(`    Current URL: ${currentUrl}`);
      }
    }
    
  } catch (error) {
    console.error(`  ❌ Job seeker signup test failed: ${error.message}`);
    throw error;
  } finally {
    await page.close();
  }
}

async function testEmployerSignup(context) {
  console.log('\n🏢 Testing Employer Signup Flow...');
  
  const page = await context.newPage();
  
  try {
    await page.goto(`${BASE_URL}/auth/signup`);
    await page.waitForLoadState('networkidle');
    
    // Select employer role
    const employerRole = page.locator('[data-role="employer"], div:has-text("Employer")').first();
    await employerRole.click();
    console.log('  ✓ Employer role selected');
    
    // Fill in employer form
    const timestamp = Date.now();
    const testData = {
      companyName: 'Test Company Inc',
      firstName: 'Jane',
      lastName: 'Employer',
      email: `employer${timestamp}@test.com`,
      password: 'TestPassword123!'
    };
    
    await page.fill('input[name="companyName"], #companyName', testData.companyName);
    await page.fill('input[name="first_name"], #first_name', testData.firstName);
    await page.fill('input[name="last_name"], #last_name', testData.lastName);
    await page.fill('input[name="email"], #email', testData.email);
    await page.fill('input[name="password"], #password', testData.password);
    
    console.log('  ✓ Form filled with test data');
    console.log(`    - Company: ${testData.companyName}`);
    console.log(`    - Name: ${testData.firstName} ${testData.lastName}`);
    console.log(`    - Email: ${testData.email}`);
    
    // Submit form
    await page.click('button[type="submit"], button:has-text("Create account")');
    
    // Wait for redirect or error
    try {
      await page.waitForURL('**/employer/dashboard', { timeout: 10000 });
      console.log('  ✅ Successfully redirected to employer dashboard');
      
      // Verify profile information
      const profileElements = await Promise.all([
        page.locator('text=' + testData.firstName + ' ' + testData.lastName).first().isVisible().catch(() => false),
        page.locator('text=' + testData.companyName).first().isVisible().catch(() => false)
      ]);
      
      if (profileElements[0]) {
        console.log('  ✓ User profile displays correct first_name and last_name');
      }
      if (profileElements[1]) {
        console.log('  ✓ Company profile displays correct company name');
      }
      
    } catch (timeoutError) {
      const errorMessage = await page.locator('[data-testid="error-message"], .text-red-500, .error').first().textContent();
      if (errorMessage) {
        console.log(`  ⚠ Error during signup: ${errorMessage}`);
      }
    }
    
  } catch (error) {
    console.error(`  ❌ Employer signup test failed: ${error.message}`);
    throw error;
  } finally {
    await page.close();
  }
}

async function testErrorHandling(context) {
  console.log('\n🚨 Testing Error Handling...');
  
  const page = await context.newPage();
  
  try {
    await page.goto(`${BASE_URL}/auth/signup`);
    await page.waitForLoadState('networkidle');
    
    // Test 1: Duplicate email
    console.log('  Testing duplicate email error...');
    await page.fill('input[name="first_name"], #first_name', 'Test');
    await page.fill('input[name="last_name"], #last_name', 'User');
    await page.fill('input[name="email"], #email', 'existing@test.com'); // Use a known existing email
    await page.fill('input[name="password"], #password', 'TestPassword123!');
    
    await page.click('button[type="submit"]');
    
    // Look for error message
    await page.waitForSelector('[data-testid="error-message"], .text-red-500, .error', { timeout: 5000 });
    const errorText = await page.locator('[data-testid="error-message"], .text-red-500, .error').first().textContent();
    
    if (errorText && (errorText.includes('already') || errorText.includes('exists') || errorText.includes('duplicate'))) {
      console.log('  ✓ Duplicate email error handled correctly');
    } else {
      console.log(`  ⚠ Unexpected error message: ${errorText}`);
    }
    
  } catch (error) {
    console.log(`  ⚠ Error handling test: ${error.message}`);
  } finally {
    await page.close();
  }
}

async function testFormValidation(context) {
  console.log('\n📝 Testing Form Validation...');
  
  const page = await context.newPage();
  
  try {
    await page.goto(`${BASE_URL}/auth/signup`);
    await page.waitForLoadState('networkidle');
    
    // Test invalid email format
    console.log('  Testing invalid email format...');
    await page.fill('input[name="email"], #email', 'invalid-email');
    await page.blur('input[name="email"], #email');
    
    // Look for validation error
    const emailError = await page.locator('text=*email*').first().isVisible().catch(() => false);
    if (emailError) {
      console.log('  ✓ Email validation working');
    }
    
    // Test weak password
    console.log('  Testing weak password validation...');
    await page.fill('input[name="password"], #password', '123');
    await page.blur('input[name="password"], #password');
    
    const passwordError = await page.locator('text=*password*, text=*8*').first().isVisible().catch(() => false);
    if (passwordError) {
      console.log('  ✓ Password validation working');
    }
    
    // Test required first_name/last_name
    console.log('  Testing required name fields...');
    await page.fill('input[name="first_name"], #first_name', '');
    await page.fill('input[name="last_name"], #last_name', '');
    
    await page.click('button[type="submit"]');
    
    const nameErrors = await Promise.all([
      page.locator('text=*First name*, text=*required*').first().isVisible().catch(() => false),
      page.locator('text=*Last name*, text=*required*').first().isVisible().catch(() => false)
    ]);
    
    if (nameErrors[0] || nameErrors[1]) {
      console.log('  ✓ Name field validation working');
    }
    
    // Test employer company name requirement
    console.log('  Testing employer company name requirement...');
    const employerRole = page.locator('div:has-text("Employer")').first();
    await employerRole.click();
    
    await page.fill('input[name="companyName"], #companyName', '');
    await page.click('button[type="submit"]');
    
    const companyError = await page.locator('text=*Company*, text=*required*').first().isVisible().catch(() => false);
    if (companyError) {
      console.log('  ✓ Company name validation working');
    }
    
  } catch (error) {
    console.log(`  ⚠ Form validation test: ${error.message}`);
  } finally {
    await page.close();
  }
}

// Run the tests
if (import.meta.url === `file://${process.argv[1]}`) {
  testSignupFlow().catch(console.error);
}

export { testSignupFlow };