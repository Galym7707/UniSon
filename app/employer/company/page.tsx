//app/employer/company/page.tsx

import { requireAuth } from '@/lib/auth-helpers'
import ClientCompanyProfile from './ClientCompanyProfile'

export const dynamic = 'force-dynamic'

export default async function CompanyProfilePage() {
  // Require authentication and employer role
  const { user, profile } = await requireAuth({ role: 'employer' })

  return <ClientCompanyProfile userProfile={profile} />
}