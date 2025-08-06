// app/api/user/delete/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabase } from '@/lib/supabase/server'

export async function DELETE() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  /* 1. удаляем строку профиля */
  const { error: profileErr } = await supabase
    .from('profiles')
    .delete()
    .eq('id', user.id)

  if (profileErr) {
    return NextResponse.json({ error: profileErr.message }, { status: 500 })
  }

  /* 2. удаляем самого пользователя (нужен service-key) */
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,   //  <-- добавьте в .env.local
    { auth: { persistSession: false } }
  )

  const { error: userErr } = await admin.auth.admin.deleteUser(user.id)
  if (userErr) {
    return NextResponse.json({ error: userErr.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}