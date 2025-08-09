import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { CreateActivityLog, ActivityType } from '@/lib/activity-tracker';
import { z } from 'zod';

// Validation schemas
const CreateActivitySchema = z.object({
  action_type: z.string().min(1, 'Action type is required'),
  description: z.string().min(1, 'Description is required'),
  metadata: z.record(z.any()).optional().default({})
});

const GetActivitiesSchema = z.object({
  limit: z.coerce.number().min(1).max(100).optional().default(50),
  action_type: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = CreateActivitySchema.parse(body);

    // Insert activity log
    const { data, error } = await supabase
      .from('activity_logs')
      .insert({
        user_id: user.id,
        action_type: validatedData.action_type,
        description: validatedData.description,
        metadata: validatedData.metadata
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to log activity' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });

  } catch (error) {
    console.error('POST /api/activity error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams);
    const { limit, action_type } = GetActivitiesSchema.parse(queryParams);

    // Build query
    let query = supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Apply action_type filter if provided
    if (action_type) {
      query = query.eq('action_type', action_type);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch activities' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: data || [] });

  } catch (error) {
    console.error('GET /api/activity error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}