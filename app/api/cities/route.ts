import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const country = searchParams.get('country')
    
    if (!country) {
      return NextResponse.json(
        { error: 'Country parameter is required' },
        { status: 400 }
      )
    }

    const supabase = await createRouteHandlerClient()
    
    // For now, return hardcoded cities based on country. In a real app, this would come from a database
    const citiesByCountry: Record<string, Array<{id: string, name: string, country: string}>> = {
      russia: [
        { id: 'moscow', name: 'Moscow', country: 'russia' },
        { id: 'spb', name: 'St. Petersburg', country: 'russia' },
        { id: 'kazan', name: 'Kazan', country: 'russia' },
        { id: 'novosibirsk', name: 'Novosibirsk', country: 'russia' },
        { id: 'yekaterinburg', name: 'Yekaterinburg', country: 'russia' }
      ],
      usa: [
        { id: 'nyc', name: 'New York', country: 'usa' },
        { id: 'sf', name: 'San Francisco', country: 'usa' },
        { id: 'la', name: 'Los Angeles', country: 'usa' },
        { id: 'chicago', name: 'Chicago', country: 'usa' }
      ],
      germany: [
        { id: 'berlin', name: 'Berlin', country: 'germany' },
        { id: 'munich', name: 'Munich', country: 'germany' },
        { id: 'hamburg', name: 'Hamburg', country: 'germany' }
      ],
      canada: [
        { id: 'toronto', name: 'Toronto', country: 'canada' },
        { id: 'vancouver', name: 'Vancouver', country: 'canada' },
        { id: 'montreal', name: 'Montreal', country: 'canada' }
      ]
    }

    const cities = citiesByCountry[country] || []
    return NextResponse.json({ cities }, { status: 200 })
  } catch (error) {
    console.error('Error fetching cities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cities' },
      { status: 500 }
    )
  }
}