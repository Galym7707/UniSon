/* app/job-seeker/profile/page.tsx – SERVER COMPONENT */
import { redirect } from 'next/navigation'
import { cookies }  from 'next/headers'
import { createServerComponentClient }
  from '@supabase/auth-helpers-nextjs'
import ClientProfileShell from './ClientProfileShell'
import { logError } from '@/lib/error-handling'

export default async function ProfilePage() {
  try {
    const supabase = createServerComponentClient({ cookies })
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      logError('profile-page-session', sessionError)
      redirect('/auth/login')
    }
    
    if (!session) {
      redirect('/auth/login')
    }

    // Let the client component handle profile fallback logic
    // This ensures consistency between server and client components
    return <ClientProfileShell />
  } catch (error) {
    logError('profile-page', error)
    redirect('/auth/login')
  }
}