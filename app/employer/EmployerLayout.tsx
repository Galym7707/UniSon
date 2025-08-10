'use client'

import EmployerHeader from "@/components/EmployerHeader"
import EmployerNavbar from "@/components/EmployerNavbar"
import { Footer } from "@/components/footer"
import { UserProfile } from '@/lib/auth-helpers'

interface EmployerLayoutProps {
  children: React.ReactNode
  userProfile?: UserProfile
}

export default function EmployerLayout({ children, userProfile }: EmployerLayoutProps) {
  return (
    <>
      <EmployerHeader userProfile={userProfile} />
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <EmployerNavbar userProfile={userProfile} />
          {/* Main Content */}
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}