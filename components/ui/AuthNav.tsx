// 📁 components/ui/AuthNav.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Button } from './button'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AuthNav() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.email) setUserEmail(data.user.email)
    })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/') // редирект на главную после выхода
  }

  return (
    <div className="flex items-center space-x-4">
      {userEmail ? (
        <>
          <span className="text-sm text-gray-600">{userEmail}</span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Выйти
          </Button>
        </>
      ) : (
        <>
          <Link href="/auth/login">
            <Button variant="outline" size="sm">Войти</Button>
          </Link>
          <Link href="/auth/signup">
            <Button size="sm">Регистрация</Button>
          </Link>
        </>
      )}
    </div>
  )
}
