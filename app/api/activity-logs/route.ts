import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch user's recent activities (last 20 activities)
    const { data: activities, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Error fetching activity logs:', error)
      return NextResponse.json(
        { error: 'Failed to fetch activities' }, 
        { status: 500 }
      )
    }

    return NextResponse.json({ activities: activities || [] })

  } catch (error) {
    console.error('Activity logs API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, description, details } = body

    if (!action || !description) {
      return NextResponse.json(
        { error: 'Action and description are required' }, 
        { status: 400 }
      )
    }

    // Insert new activity log
    const { data: activity, error } = await supabase
      .from('activity_logs')
      .insert({
        user_id: user.id,
        action,
        description,
        details: details || {}
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating activity log:', error)
      return NextResponse.json(
        { error: 'Failed to create activity log' }, 
        { status: 500 }
      )
    }

    return NextResponse.json({ activity })

  } catch (error) {
    console.error('Activity logs POST API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}