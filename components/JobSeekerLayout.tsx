'use client'

import { ReactNode } from 'react'
import Navbar from './Navbar'

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
      <main className="pt-4">
        {children}
      </main>
    </div>
  )
}