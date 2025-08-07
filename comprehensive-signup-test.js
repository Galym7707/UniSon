// Comprehensive test suite for signup flow and profile name generation
const { testNameGeneration, testSignupFlow, testEdgeCases } = require('./test-signup-flow');
const { testSignupFlow: testUISignup, testProfileDisplay, testDashboardDisplay } = require('./test-ui-profile-display');

async function runComprehensiveTests() {
  console.log('🧪 COMPREHENSIVE SIGNUP & NAME GENERATION TEST SUITE');
  console.log('='.repeat(80));
  console.log('This test suite will verify:');
  console.log('✓ Database name generation from first_name + last_name');
  console.log('✓ Complete signup flow functionality');
  console.log('✓ Edge cases handling');
  console.log('✓ UI display of generated names');
  console.log('✓ Profile management workflow');
  console.log('='.repeat(80));
  
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  
  const runTest = async (testName, testFunction) => {
    console.log(`\n🔧 Running: ${testName}`);
    console.log('-'.repeat(50));
    totalTests++;
    
    try {
      await testFunction();
      passedTests++;
      console.log(`✅ ${testName} - PASSED`);
    } catch (err) {
      failedTests++;
      console.error(`❌ ${testName} - FAILED:`, err.message);
    }
  };
  
  try {
    // Backend/Database Tests
    console.log('\n📊 BACKEND TESTS');
    await runTest('Database Name Generation', testNameGeneration);
    await runTest('Complete Signup Flow', testSignupFlow);
    await runTest('Edge Cases Handling', testEdgeCases);
    
    // Frontend/UI Tests
    console.log('\n🎭 FRONTEND TESTS');
    await runTest('UI Signup Flow', testUISignup);
    await runTest('Profile Display', testProfileDisplay);
    await runTest('Dashboard Display', testDashboardDisplay);
    
  } catch (err) {
    console.error('💥 Test suite execution failed:', err.message);
  }
  
  // Final report
  console.log('\n' + '='.repeat(80));
  console.log('📋 TEST RESULTS SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📊 Success Rate: ${Math.round((passedTests/totalTests)*100)}%`);
  
  if (failedTests === 0) {
    console.log('\n🎉 ALL TESTS PASSED! The signup flow and name generation are working correctly.');
    console.log('\n✨ Features verified:');
    console.log('  • User account creation through signup');
    console.log('  • Profile creation with first_name and last_name');
    console.log('  • Generated name column (first_name + last_name)');
    console.log('  • Proper UI display of generated names');
    console.log('  • Edge case handling for empty/null values');
    console.log('  • No database errors during profile creation');
  } else {
    console.log(`\n⚠️  ${failedTests} test(s) failed. Please review the errors above.`);
    process.exit(1);
  }
}

// Add helper function to setup test environment
async function setupTestEnvironment() {
  console.log('🔧 Setting up test environment...');
  
  // Check environment variables
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars.join(', '));
    console.error('Please set these variables in your .env.local file');
    process.exit(1);
  }
  
  console.log('✅ Environment variables configured');
  
  // Test database connection
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    const { data, error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });
    
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Database connection failed: ${error.message}`);
    }
    
    console.log('✅ Database connection verified');
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('Please check your Supabase configuration');
    process.exit(1);
  }
}

// Main execution
async function main() {
  try {
    await setupTestEnvironment();
    await runComprehensiveTests();
  } catch (err) {
    console.error('💥 Comprehensive test suite failed:', err.message);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = {
  runComprehensiveTests,
  setupTestEnvironment
};