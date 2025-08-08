// Test comprehensive signup flow with validation and error handling
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hmvtbhiqibglzidmkbmj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtdnRiaGlxaWJnbHppZG1rYm1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE1NzIxNjAsImV4cCI6MjA0NzE0ODE2MH0.fhHCVQfzNm8dH7X6nG8dXz8o0M0q4JmJP_gBf0FzBOM'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('🧪 Testing comprehensive signup flow...')

// Test data
const testCases = [
  {
    name: "Invalid - Missing first name",
    data: {
      role: "job-seeker",
      first_name: "",
      last_name: "Smith",
      email: "test1@example.com",
      password: "Password123"
    },
    shouldFail: true
  },
  {
    name: "Invalid - Missing last name", 
    data: {
      role: "job-seeker",
      first_name: "Jane",
      last_name: "",
      email: "test2@example.com", 
      password: "Password123"
    },
    shouldFail: true
  },
  {
    name: "Invalid - First name too short",
    data: {
      role: "job-seeker",
      first_name: "J",
      last_name: "Smith",
      email: "test3@example.com",
      password: "Password123"
    },
    shouldFail: true
  },
  {
    name: "Invalid - Last name contains numbers",
    data: {
      role: "job-seeker",
      first_name: "Jane",
      last_name: "Smith123",
      email: "test4@example.com",
      password: "Password123"
    },
    shouldFail: true
  },
  {
    name: "Invalid - Employer missing company name",
    data: {
      role: "employer",
      first_name: "John",
      last_name: "Doe",
      companyName: "",
      email: "test5@example.com",
      password: "Password123"
    },
    shouldFail: true
  },
  {
    name: "Valid - Job seeker signup",
    data: {
      role: "job-seeker",
      first_name: "Alice",
      last_name: "Johnson",
      email: `alice.test.${Date.now()}@example.com`,
      password: "SecurePass123"
    },
    shouldFail: false
  },
  {
    name: "Valid - Employer signup", 
    data: {
      role: "employer",
      first_name: "Bob",
      last_name: "Wilson",
      companyName: "Tech Corp Inc.",
      email: `bob.test.${Date.now()}@example.com`,
      password: "SecurePass123"
    },
    shouldFail: false
  }
]

// Function to simulate server action
async function simulateSignupAction(formData) {
  try {
    // Create FormData object
    const form = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      if (value) form.append(key, value)
    })

    // Validate required fields
    if (!formData.first_name || formData.first_name.trim().length === 0) {
      return { error: "First name is required" }
    }
    
    if (!formData.last_name || formData.last_name.trim().length === 0) {
      return { error: "Last name is required" }
    }

    // Additional validation
    if (formData.first_name.length < 2) {
      return { error: "First name must be at least 2 characters" }
    }

    if (formData.last_name.length < 2) {
      return { error: "Last name must be at least 2 characters" }
    }

    if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(formData.first_name)) {
      return { error: "First name can only contain letters, spaces, apostrophes, and hyphens" }
    }

    if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(formData.last_name)) {
      return { error: "Last name can only contain letters, spaces, apostrophes, and hyphens" }
    }

    if (formData.role === "employer" && (!formData.companyName || formData.companyName.trim().length === 0)) {
      return { error: "Company name is required for employers" }
    }

    // Try actual signup
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          role: formData.role,
          first_name: formData.first_name,
          last_name: formData.last_name,
          companyName: formData.companyName || null,
        },
      },
    })

    if (error) {
      return { error: error.message }
    }

    if (!data.user?.id) {
      return { error: "User creation failed - no user ID returned" }
    }

    return { success: true, user: data.user }

  } catch (err) {
    return { error: err.message || "An unexpected error occurred" }
  }
}

// Run tests
async function runTests() {
  for (const testCase of testCases) {
    console.log(`\n📋 Testing: ${testCase.name}`)
    console.log(`   Data:`, testCase.data)
    
    const result = await simulateSignupAction(testCase.data)
    
    if (testCase.shouldFail) {
      if (result.error) {
        console.log(`   ✅ Expected failure: ${result.error}`)
      } else {
        console.log(`   ❌ Expected failure but got success`)
      }
    } else {
      if (result.success) {
        console.log(`   ✅ Success: User created with ID ${result.user.id}`)
        
        // Clean up successful test users
        try {
          const { error: deleteError } = await supabase.auth.admin.deleteUser(result.user.id)
          if (!deleteError) {
            console.log(`   🧹 Cleaned up test user`)
          }
        } catch (e) {
          console.log(`   ⚠️ Could not clean up test user: ${e.message}`)
        }
      } else {
        console.log(`   ❌ Expected success but got error: ${result.error}`)
      }
    }
  }
}

runTests().then(() => {
  console.log('\n✨ Comprehensive signup tests completed!')
})