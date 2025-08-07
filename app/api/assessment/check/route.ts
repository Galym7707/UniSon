import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createServerSupabase()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) {
      return NextResponse.json(
        { error: 'Authentication failed', details: authError.message }, 
        { status: 401 }
      )
    }
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' }, 
        { status: 401 }
      )
    }

    // Check user profile and test results
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, test_results')
      .eq('id', user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error checking user profile:', profileError)
      return NextResponse.json(
        { error: 'Database error', details: profileError.message }, 
        { status: 500 }
      )
    }

    // Return whether test results exist
    const hasTestResults = !!(profile?.test_results)
    const completedAt = profile?.test_results?.completed_at
    const previousAttempts = profile?.test_results?.previous_attempts || 0

    return NextResponse.json({ 
      hasTestResults,
      completedAt,
      previousAttempts
    })
  } catch (error) {
    console.error('Assessment check error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    )
  }
}