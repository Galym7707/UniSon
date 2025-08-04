// 📁 app/api/assessment/latest/route.ts
// Возвращает последние результаты пользователя из Supabase

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
    console.error(err)
    return NextResponse.json({ error: 'Ошибка получения результата' }, { status: 500 })
  }
}
