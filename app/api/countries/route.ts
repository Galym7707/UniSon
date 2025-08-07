import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createServerSupabase()
    
    const { data: countries, error } = await supabase
      .from('countries')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching countries:', error)
      return NextResponse.json({ error: 'Failed to fetch countries' }, { status: 500 })
    }

    return NextResponse.json(countries || [])
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}