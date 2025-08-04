// 📁 lib/env.ts
/**
 * Centralized environment variable validation and configuration
 * This ensures all required environment variables are properly validated at application startup
 */

interface EnvironmentConfig {
  supabase: {
    url: string
    anonKey: string
  }
}

class EnvironmentValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EnvironmentValidationError'
  }
}

/**
 * Validates and returns all required environment variables
 * Throws detailed error messages for missing or invalid variables
 */
function validateEnvironment(): EnvironmentConfig {
  const errors: string[] = []
  
  // Validate Supabase configuration
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is required but not set')
  } else if (!isValidUrl(supabaseUrl)) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL must be a valid URL')
  }
  
  if (!supabaseAnonKey) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is required but not set')
  } else if (supabaseAnonKey.length < 10) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY appears to be invalid (too short)')
  }
  
  if (errors.length > 0) {
    const errorMessage = [
      '❌ Environment variable validation failed:',
      ...errors.map(error => `  • ${error}`),
      '',
      '🔧 To fix this:',
      '  1. Create a .env.local file in your project root',
      '  2. Add the missing environment variables:',
      '     NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url',
      '     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key',
      '  3. Get these values from your Supabase project dashboard',
      '  4. Restart your development server'
    ].join('\n')
    
    throw new EnvironmentValidationError(errorMessage)
  }
  
  return {
    supabase: {
      url: supabaseUrl!,
      anonKey: supabaseAnonKey!,
    },
  }
}

/**
 * Basic URL validation helper
 */
function isValidUrl(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch {
    return false
  }
}

// Validate environment variables at module load time
let env: EnvironmentConfig | null = null

/**
 * Get validated environment configuration
 * Returns validated environment variables or throws descriptive error
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  if (env === null) {
    try {
      env = validateEnvironment()
    } catch (error) {
      // In build/test environments, provide helpful context
      if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
        console.error('\n' + (error as Error).message + '\n')
      }
      throw error
    }
  }
  return env
}

/**
 * Get Supabase configuration specifically
 * Convenience method for accessing Supabase settings
 */
export function getSupabaseConfig() {
  return getEnvironmentConfig().supabase
}

// Export the validation error class for custom error handling
export { EnvironmentValidationError }