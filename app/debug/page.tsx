'use client'

export default function DebugPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Info</h1>
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Environment Variables</h2>
          <p>SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set'}</p>
          <p>SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Links</h2>
          <a href="/auth/login" className="text-blue-500 underline block">Login Page</a>
          <a href="/test-auth" className="text-blue-500 underline block">Test Auth</a>
          <a href="/job-seeker/profile" className="text-blue-500 underline block">Profile Page</a>
        </div>
      </div>
    </div>
  )
} 