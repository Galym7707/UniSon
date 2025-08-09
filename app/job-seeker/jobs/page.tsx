'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function JobsPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to the search page since we're consolidating these pages
    router.replace('/job-seeker/search')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-gray-600">Redirecting to Browse & Search Jobs...</p>
      </div>
    </div>
  )
}