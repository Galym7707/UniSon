// app/api/user/delete/route.ts
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'

export async function DELETE() {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  /* 1. удаляем строку профиля */
  const { error: profileErr } = await supabase
    .from('profiles')
    .delete()
    .eq('id', session.user.id)

  if (profileErr) {
    return NextResponse.json({ error: profileErr.message }, { status: 500 })
  }

  /* 2. удаляем самого пользователя (нужен service-key) */
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,   //  <-- добавьте в .env.local
    { auth: { persistSession: false } }
  )

  const { error: userErr } = await admin.auth.admin.deleteUser(session.user.id)
  if (userErr) {
    return NextResponse.json({ error: userErr.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
