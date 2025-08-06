// app/api/user/delete/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabase } from '@/lib/supabase/server'

export async function DELETE() {
  let user: any = null
  
  try {
    const supabase = await createServerSupabase()
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    user = authUser

    // Authentication errors
    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { 
          error: 'Authentication failed', 
          message: 'Unable to verify user authentication',
          details: authError.message 
        },
        { status: 401 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { 
          error: 'User not authenticated', 
          message: 'Please log in to delete your account' 
        },
        { status: 401 }
      )
    }

    // Environment variable validation
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing required environment variables')
      return NextResponse.json(
        { 
          error: 'Server configuration error', 
          message: 'Server is not properly configured' 
        },
        { status: 500 }
      )
    }

    // Initialize admin client for user deletion
    let adminClient: any = null
    try {
      adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { 
          auth: { 
            persistSession: false,
            autoRefreshToken: false
          } 
        }
      )
    } catch (clientError) {
      console.error('Failed to create admin client:', clientError)
      return NextResponse.json(
        { 
          error: 'Server initialization failed', 
          message: 'Unable to initialize admin client' 
        },
        { status: 500 }
      )
    }

    // Step 1: Delete profile data and related records
    try {
      // Check if profile exists first
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (existingProfile) {
        const { error: profileErr } = await supabase
          .from('profiles')
          .delete()
          .eq('id', user.id)

        if (profileErr) {
          console.error('Profile deletion error:', profileErr)
          return NextResponse.json(
            { 
              error: 'Profile deletion failed', 
              message: 'Failed to delete user profile data',
              details: profileErr.message 
            },
            { status: 500 }
          )
        }
      }
      
      // TODO: Add deletion of other related data tables here if they exist
      // Example: job applications, saved jobs, etc.
      
    } catch (profileError) {
      console.error('Profile deletion operation failed:', profileError)
      return NextResponse.json(
        { 
          error: 'Data cleanup failed', 
          message: 'Unable to delete user data from database',
          details: profileError instanceof Error ? profileError.message : 'Unknown error'
        },
        { status: 500 }
      )
    }

    // Step 2: Delete user account from auth system
    try {
      const { error: userErr } = await adminClient.auth.admin.deleteUser(user.id)
      
      if (userErr) {
        console.error('User deletion error:', userErr)
        
        // Provide more specific error messages based on error type
        let message = 'Failed to delete user account'
        if (userErr.message?.includes('not found')) {
          message = 'User account not found or already deleted'
        } else if (userErr.message?.includes('permission')) {
          message = 'Insufficient permissions to delete account'
        } else if (userErr.message?.includes('network')) {
          message = 'Network error occurred during account deletion'
        }

        return NextResponse.json(
          { 
            error: 'Account deletion failed', 
            message,
            details: userErr.message 
          },
          { status: 500 }
        )
      }
    } catch (userDeleteError) {
      console.error('User account deletion operation failed:', userDeleteError)
      return NextResponse.json(
        { 
          error: 'Account deletion failed', 
          message: 'Unable to delete user account from authentication system',
          details: userDeleteError instanceof Error ? userDeleteError.message : 'Unknown error'
        },
        { status: 500 }
      )
    }

    // Success response
    return NextResponse.json({ 
      success: true, 
      message: 'Your account has been successfully deleted. We\'re sorry to see you go!' 
    })

  } catch (error) {
    console.error('Unexpected error during account deletion:', error)
    
    // Log user ID for debugging if available
    if (user?.id) {
      console.error('Failed deletion for user ID:', user.id)
    }
    
    return NextResponse.json(
      { 
        error: 'Unexpected error', 
        message: 'An unexpected error occurred. Please try again or contact support.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}