import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const countryId = searchParams.get('country_id')
    
    const supabase = await createServerSupabase()
    
    let query = supabase
      .from('cities')
      .select('*')
      .order('name')

    if (countryId) {
      query = query.eq('country_id', countryId)
    }

    const { data: cities, error } = await query

    if (error) {
      console.error('Error fetching cities:', error)
      return NextResponse.json({ error: 'Failed to fetch cities' }, { status: 500 })
    }

    return NextResponse.json(cities || [])
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}