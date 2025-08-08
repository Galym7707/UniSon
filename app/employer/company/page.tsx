//app/employer/company/page.tsx

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import ClientCompanyProfile from './ClientCompanyProfile'
import { logError } from '@/lib/error-handling'
import { Header } from '@/components/header-landing'
import { Footer } from '@/components/footer'

export default async function CompanyProfilePage() {
  try {
    const supabase = createServerComponentClient({ cookies })
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      logError('company-profile-page-session', sessionError)
      redirect('/auth/login')
    }
    
    if (!session) {
      redirect('/auth/login')
    }

    // Let the client component handle company profile fallback logic
    return (
      <>
        <Header />
        <ClientCompanyProfile />
        <Footer />
      </>
    )
  } catch (error) {
    logError('company-profile-page', error)
    redirect('/auth/login')
  }
}