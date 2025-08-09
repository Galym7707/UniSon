'use client'

import { usePathname } from 'next/navigation'
import { Header } from './header-landing'
import { Footer } from './footer'
import Navbar from './Navbar'

interface LayoutWrapperProps {
  children: React.ReactNode
  showJobSeekerNav?: boolean
}

export function LayoutWrapper({ children, showJobSeekerNav = false }: LayoutWrapperProps) {
  const pathname = usePathname()
  const isJobSeekerPage = pathname?.startsWith('/job-seeker') || showJobSeekerNav

  return (
    <div className="min-h-screen flex flex-col">
      {isJobSeekerPage ? <Navbar /> : <Header />}
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}