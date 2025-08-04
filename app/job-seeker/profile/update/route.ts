//app\job-seeker\profile\update\route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    firstName,
    lastName,
    title,
    summary,
    experience,
    skills,
    country,
    city,
  } = body

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  

  const email = user.email

  try {
    const { error } = await supabase.from('profiles').upsert({
      email,
      first_name: firstName,
      last_name: lastName,
      title,
      summary,
      experience,
      skills,
      country,
      city,
      updated_at: new Date().toISOString(),
    })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
