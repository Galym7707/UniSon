import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createRouteHandlerClient()
    
    // For now, return hardcoded countries. In a real app, this would come from a database
    const countries = [
      { id: 'russia', name: 'Russia', code: 'RU' },
      { id: 'usa', name: 'United States', code: 'US' },
      { id: 'germany', name: 'Germany', code: 'DE' },
      { id: 'canada', name: 'Canada', code: 'CA' }
    ]

    return NextResponse.json({ countries }, { status: 200 })
  } catch (error) {
    console.error('Error fetching countries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch countries' },
      { status: 500 }
    )
  }
}