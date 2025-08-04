/* app/job-seeker/profile/page.tsx – SERVER COMPONENT */
import { redirect } from 'next/navigation'
import { cookies }  from 'next/headers'
import { createServerComponentClient }
  from '@supabase/auth-helpers-nextjs'
import ClientProfileShell from './ClientProfileShell'
import { logError, getUserFriendlyErrorMessage } from '@/lib/error-handling'

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

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('first_name,last_name,title,summary,experience,skills,resume_url')
      .eq('id', session.user.id)
      .single()

    // Handle the case where profile doesn't exist yet (PGRST116 is "no rows returned")
    if (profileError && profileError.code !== 'PGRST116') {
      logError('profile-page-data', profileError)
      // Don't redirect on profile load error, just pass null data
      // The client component will handle showing the error
    }

    return <ClientProfileShell initial={profile ?? null} />
  } catch (error) {
    logError('profile-page', error)
    redirect('/auth/login')
  }
}