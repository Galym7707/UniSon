import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country');
    const countryId = searchParams.get('country_id');

    // Support both country name/code and country_id parameters
    if (!country && !countryId) {
      return NextResponse.json(
        { error: 'Country parameter or country_id is required' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabase();

    let query = supabase
      .from('cities')
      .select(`
        id,
        name,
        state_province,
        created_at,
        countries (
          id,
          name,
          code
        )
      `)
      .order('name');

    // If country_id is provided, use exact match (for backward compatibility)
    if (countryId) {
      query = query.eq('country_id', countryId);
    } else if (country) {
      // If country name/code is provided, use fuzzy search with inner join
      query = query
        .select(`
          id,
          name,
          state_province,
          created_at,
          countries!inner (
            id,
            name,
            code
          )
        `)
        .or(`countries.name.ilike.%${country}%,countries.code.ilike.%${country}%`);
    }

    const { data: cities, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Database error occurred' },
        { status: 500 }
      );
    }

    if (!cities || cities.length === 0) {
      return NextResponse.json(
        { error: 'No cities found for the specified country' },
        { status: 404 }
      );
    }

    // Format the response to include country information with each city
    const formattedCities = cities.map(city => ({
      id: city.id,
      name: city.name,
      state_province: city.state_province,
      created_at: city.created_at,
      country: city.countries
    }));

    return NextResponse.json({
      success: true,
      data: formattedCities,
      count: formattedCities.length
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}