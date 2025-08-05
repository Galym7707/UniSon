/* app/job-seeker/profile/page.tsx – SERVER COMPONENT */
import { redirect } from 'next/navigation'
import { getSupabaseServer } from '@/lib/supabase/server'
import ClientProfileShell from './ClientProfileShell'
import { logError } from '@/lib/error-handling'

export default async function ProfilePage() {
  try {
    const supabase = getSupabaseServer()          // ✅ already awaits cookies() internally
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()             // ✅ calls Auth API, verifies JWT

    if (authError || !user) {
      // instead of throw redirect here we use helper that logs context
      logError('profile-page', authError ?? new Error('No user'))
      redirect('/auth/login')
    }

    // ────────────────────────────────────
    //  Fetch the profile row (may be null)
    // ────────────────────────────────────
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('first_name,last_name,title,summary,experience,skills')
      .eq('id', user.id)           // ← keyed by auth.user.id
      .maybeSingle()              // ← returns null if no row exists

    if (profileError && profileError.code !== 'PGRST116') {
      logError('profile-page', profileError)
      redirect('/error')
    }

    // Pass profile data to client component (may be null for new users)
    return <ClientProfileShell profile={profile} />
  } catch (error) {
    logError('profile-page', error)
    redirect('/auth/login')
  }
}