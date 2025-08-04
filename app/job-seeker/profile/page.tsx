/* app/job-seeker/profile/page.tsx – SERVER COMPONENT */
import { redirect } from 'next/navigation'
import { cookies }  from 'next/headers'
import { createServerComponentClient }
  from '@supabase/auth-helpers-nextjs'
import ClientProfileShell from './ClientProfileShell'

export default async function ProfilePage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name,last_name,title,summary,experience,skills,resume_url')
    .eq('id', session.user.id)
    .single()

  return <ClientProfileShell initial={profile ?? null} />
}
