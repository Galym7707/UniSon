// 📁 app/api/assessment/latest/route.ts
// Возвращает последние результаты пользователя из Supabase

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logError, ErrorType } from '@/lib/error-handling'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('assessments')
      .select('score')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) throw error

    return NextResponse.json({ score: data?.score ?? null })
  } catch (err) {
    const structuredError = logError('api-assessment-latest', err)
    
    // Return appropriate error response based on error type
    const statusCode = structuredError.type === ErrorType.DATABASE ? 503 : 500
    const message = structuredError.type === ErrorType.DATABASE 
      ? 'Database temporarily unavailable' 
      : 'Internal server error'
    
    return NextResponse.json({ 
      error: message,
      errorId: structuredError.id 
    }, { status: statusCode })
  }
}