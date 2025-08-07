// Test script for signup flow and name generation
const { createClient } = require('@supabase/supabase-js');

// Test configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Test cases for signup and name generation
const testCases = [
  {
    name: 'Happy Path - Both names',
    input: { firstName: 'John', lastName: 'Doe' },
    expected: 'John Doe'
  },
  {
    name: 'First name only',
    input: { firstName: 'Jane', lastName: '' },
    expected: 'Jane'
  },
  {
    name: 'Last name only',
    input: { firstName: '', lastName: 'Smith' },
    expected: 'Smith'
  },
  {
    name: 'Empty names',
    input: { firstName: '', lastName: '' },
    expected: ''
  },
  {
    name: 'Null names',
    input: { firstName: null, lastName: null },
    expected: ''
  },
  {
    name: 'Multiple first names',
    input: { firstName: 'Mary Jane', lastName: 'Watson' },
    expected: 'Mary Jane Watson'
  },
  {
    name: 'Hyphenated last name',
    input: { firstName: 'Sarah', lastName: 'Connor-Smith' },
    expected: 'Sarah Connor-Smith'
  },
  {
    name: 'Special characters',
    input: { firstName: "O'Brien", lastName: 'D\'Angelo' },
    expected: "O'Brien D'Angelo"
  }
];

async function testNameGeneration() {
  console.log('🧪 Testing name generation...\n');
  
  for (const testCase of testCases) {
    try {
      console.log(`Testing: ${testCase.name}`);
      
      // Create test profile
      const testUserId = crypto.randomUUID();
      
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: testUserId,
          role: 'job-seeker',
          first_name: testCase.input.firstName,
          last_name: testCase.input.lastName,
          email: `test-${testUserId}@example.com`
        })
        .select('id, first_name, last_name, name')
        .single();
      
      if (error) {
        console.error(`❌ Error creating profile: ${error.message}`);
        continue;
      }
      
      // Verify generated name
      const actualName = data.name;
      const expectedName = testCase.expected;
      
      if (actualName === expectedName) {
        console.log(`✅ PASS: Generated name "${actualName}" matches expected "${expectedName}"`);
      } else {
        console.log(`❌ FAIL: Generated name "${actualName}" does not match expected "${expectedName}"`);
      }
      
      // Clean up test data
      await supabase
        .from('profiles')
        .delete()
        .eq('id', testUserId);
        
    } catch (err) {
      console.error(`❌ Test failed: ${err.message}`);
    }
    
    console.log('');
  }
}

async function testSignupFlow() {
  console.log('🚀 Testing complete signup flow...\n');
  
  const testEmail = `test-signup-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  const testFullName = 'Test User';
  
  try {
    console.log('Step 1: Creating user account...');
    
    // This simulates what happens in the signup action
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        role: 'job-seeker',
        fullName: testFullName,
        first_name: testFullName.split(' ')[0],
        last_name: testFullName.split(' ').slice(1).join(' ') || ''
      }
    });
    
    if (authError) {
      throw new Error(`Auth creation failed: ${authError.message}`);
    }
    
    const userId = authData.user.id;
    console.log(`✅ User created with ID: ${userId}`);
    
    console.log('Step 2: Creating profile...');
    
    // This simulates the profile creation from signup action
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        role: 'job-seeker',
        first_name: testFullName.split(' ')[0],
        last_name: testFullName.split(' ').slice(1).join(' ') || '',
        email: testEmail
      })
      .select('id, first_name, last_name, name, role, email')
      .single();
    
    if (profileError) {
      throw new Error(`Profile creation failed: ${profileError.message}`);
    }
    
    console.log('✅ Profile created successfully:');
    console.log(`   - ID: ${profileData.id}`);
    console.log(`   - First Name: "${profileData.first_name}"`);
    console.log(`   - Last Name: "${profileData.last_name}"`);
    console.log(`   - Generated Name: "${profileData.name}"`);
    console.log(`   - Role: ${profileData.role}`);
    console.log(`   - Email: ${profileData.email}`);
    
    // Verify generated name is correct
    const expectedName = `${profileData.first_name} ${profileData.last_name}`.trim();
    if (profileData.name === expectedName) {
      console.log('✅ Generated name matches expected concatenation');
    } else {
      console.log(`❌ Generated name mismatch: expected "${expectedName}", got "${profileData.name}"`);
    }
    
    console.log('\nStep 3: Testing profile updates...');
    
    // Test updating names and verifying generated name updates
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        first_name: 'Updated',
        last_name: 'Name'
      })
      .eq('id', userId)
      .select('first_name, last_name, name')
      .single();
    
    if (updateError) {
      throw new Error(`Profile update failed: ${updateError.message}`);
    }
    
    console.log('✅ Profile updated successfully:');
    console.log(`   - Updated First Name: "${updatedProfile.first_name}"`);
    console.log(`   - Updated Last Name: "${updatedProfile.last_name}"`);
    console.log(`   - Updated Generated Name: "${updatedProfile.name}"`);
    
    // Clean up
    console.log('\nStep 4: Cleaning up test data...');
    await supabase.auth.admin.deleteUser(userId);
    console.log('✅ Test data cleaned up successfully');
    
  } catch (err) {
    console.error(`❌ Signup flow test failed: ${err.message}`);
  }
}

async function testEdgeCases() {
  console.log('🔧 Testing edge cases...\n');
  
  const edgeCases = [
    {
      name: 'Single character names',
      firstName: 'A',
      lastName: 'B',
      expected: 'A B'
    },
    {
      name: 'Names with spaces',
      firstName: '  John  ',
      lastName: '  Doe  ',
      expected: '  John    Doe  '  // Generated column preserves spaces
    },
    {
      name: 'Unicode characters',
      firstName: 'José',
      lastName: 'García',
      expected: 'José García'
    },
    {
      name: 'Very long names',
      firstName: 'Pneumonoultramicroscopicsilicovolcanoconiosis',
      lastName: 'Antidisestablishmentarianism',
      expected: 'Pneumonoultramicroscopicsilicovolcanoconiosis Antidisestablishmentarianism'
    }
  ];
  
  for (const testCase of edgeCases) {
    try {
      console.log(`Testing: ${testCase.name}`);
      
      const testUserId = crypto.randomUUID();
      
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: testUserId,
          role: 'job-seeker',
          first_name: testCase.firstName,
          last_name: testCase.lastName,
          email: `test-edge-${testUserId}@example.com`
        })
        .select('first_name, last_name, name')
        .single();
      
      if (error) {
        console.error(`❌ Error: ${error.message}`);
        continue;
      }
      
      if (data.name === testCase.expected) {
        console.log(`✅ PASS: "${data.name}"`);
      } else {
        console.log(`❌ FAIL: Expected "${testCase.expected}", got "${data.name}"`);
      }
      
      // Clean up
      await supabase
        .from('profiles')
        .delete()
        .eq('id', testUserId);
        
    } catch (err) {
      console.error(`❌ Edge case test failed: ${err.message}`);
    }
    
    console.log('');
  }
}

async function runAllTests() {
  console.log('🧪 Starting comprehensive signup and name generation tests\n');
  console.log('=' * 60);
  
  try {
    await testNameGeneration();
    console.log('=' * 60);
    await testSignupFlow();
    console.log('=' * 60);
    await testEdgeCases();
    console.log('=' * 60);
    console.log('🎉 All tests completed!');
  } catch (err) {
    console.error('💥 Test suite failed:', err.message);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testNameGeneration,
  testSignupFlow,
  testEdgeCases,
  runAllTests
};