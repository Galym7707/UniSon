// 📁 app/unauthorized/page.tsx

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ShieldAlert } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md text-center space-y-6">
        <ShieldAlert className="w-16 h-16 text-red-500 mx-auto" />
        <h1 className="text-3xl font-bold text-gray-800">Доступ запрещён</h1>
        <p className="text-gray-600">Для доступа к этой странице необходимо авторизоваться.</p>
        <Link href="/auth/login">
          <Button className="bg-[#00C49A] hover:bg-[#00A085]">Перейти ко входу</Button>
        </Link>
      </div>
    </div>
  )
}
