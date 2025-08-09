//app/employer/company/page.tsx

import { requireAuth } from '@/lib/auth-helpers'
import ClientCompanyProfile from './ClientCompanyProfile'
import { Header } from '@/components/header-landing'
import { Footer } from '@/components/footer'

export const dynamic = 'force-dynamic'

export default async function CompanyProfilePage() {
  // Require authentication and employer role
  const { user, profile } = await requireAuth({ role: 'employer' })

  return (
    <>
      <Header />
      <ClientCompanyProfile userProfile={profile} />
      <Footer />
    </>
  )
}