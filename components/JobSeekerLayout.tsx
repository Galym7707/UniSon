'use client'

import { ReactNode } from 'react'
import Navbar from './Navbar'
import JobSeekerSidebar from './JobSeekerSidebar'

interface JobSeekerLayoutProps {
  children: ReactNode
  userEmail?: string
  userName?: string
  isAuthenticated?: boolean
  className?: string
}

export default function JobSeekerLayout({
  children,
  userEmail,
  userName,
  isAuthenticated,
  className = ''
}: JobSeekerLayoutProps) {
  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <Navbar 
        userEmail={userEmail}
        userName={userName}
        isAuthenticated={isAuthenticated}
      />
      
      <div className="flex">
        <JobSeekerSidebar />
        
        <div className="flex-1 lg:pl-64">
          <main className="px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}