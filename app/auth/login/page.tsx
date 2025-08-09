//app/auth/login/page.tsx

import { Suspense } from 'react'
import { LoginForm } from "@/components/login-form"
import { Logotype } from "@/components/logotype"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

function LoginContent({ searchParams }: { searchParams: { message?: string; reason?: string } }) {
  const message = searchParams.message
  const reason = searchParams.reason

  let alertMessage = null
  if (message === 'login_required') {
    alertMessage = 'Please sign in to access this page.'
  } else if (reason === 'insufficient_permissions') {
    alertMessage = 'You need different permissions to access that page. Please sign in with an appropriate account.'
  } else if (message) {
    alertMessage = decodeURIComponent(message)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex justify-center">
          <Link href="/" className="flex items-center gap-2 text-2xl font-semibold">
            <Logotype className="h-8 w-8" />
            <span>UnisonAI</span>
          </Link>
        </div>
        
        {alertMessage && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <p className="text-amber-800 text-sm">{alertMessage}</p>
            </CardContent>
          </Card>
        )}
        
        <LoginForm />
      </div>
    </div>
  )
}

export default async function LoginPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ message?: string; reason?: string }> 
}) {
  const params = await searchParams
  
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginContent searchParams={params} />
    </Suspense>
  )
}