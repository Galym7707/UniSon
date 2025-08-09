// 📁 app/unauthorized/page.tsx

import Link from 'next/link'
import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { ShieldAlert, ArrowLeft } from 'lucide-react'

function UnauthorizedContent({ searchParams }: { searchParams: { reason?: string; message?: string } }) {
  const reason = searchParams.reason
  const message = searchParams.message

  let title = 'Access Denied'
  let description = 'You do not have permission to access this page.'
  let actionButton = (
    <Link href="/auth/login">
      <Button className="bg-[#FF7A00] hover:bg-[#E66A00]">
        Sign In
      </Button>
    </Link>
  )

  if (reason === 'insufficient_permissions') {
    title = 'Insufficient Permissions'
    description = 'You need employer privileges to access this feature. Please contact support if you believe this is an error.'
    actionButton = (
      <div className="space-y-2">
        <Link href="/">
          <Button variant="outline" className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </Link>
        <Link href="/auth/login">
          <Button className="bg-[#FF7A00] hover:bg-[#E66A00] w-full">
            Sign In with Different Account
          </Button>
        </Link>
      </div>
    )
  } else if (reason === 'login_required') {
    title = 'Login Required'
    description = 'Please sign in to access this page.'
  }

  if (message) {
    description = decodeURIComponent(message)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md text-center space-y-6">
        <ShieldAlert className="w-16 h-16 text-red-500 mx-auto" />
        <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
        <p className="text-gray-600">{description}</p>
        {actionButton}
      </div>
    </div>
  )
}

export default async function UnauthorizedPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ reason?: string; message?: string }> 
}) {
  const params = await searchParams
  
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <UnauthorizedContent searchParams={params} />
    </Suspense>
  )
}