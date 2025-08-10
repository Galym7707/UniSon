'use client'

import EmployerNavbar from './EmployerNavbar'
import JobSeekerNavbar from './JobSeekerNavbar'
import Navbar from './Navbar'

export type UserRole = 'employer' | 'job-seeker' | null | undefined

interface RoleBasedNavigationProps {
  role: UserRole
  userEmail?: string
  userName?: string
  isAuthenticated?: boolean
  className?: string
}

export default function RoleBasedNavigation({
  role,
  userEmail,
  userName,
  isAuthenticated,
  className = ''
}: RoleBasedNavigationProps) {
  // Handle case where role is provided and matches expected values
  if (role === 'employer') {
    return <EmployerNavbar />
  }

  if (role === 'job-seeker') {
    return <JobSeekerNavbar />
  }

  // Fallback to default navbar when no role is provided or role is invalid
  return (
    <Navbar
      userEmail={userEmail}
      userName={userName}
      isAuthenticated={isAuthenticated}
      className={className}
    />
  )
}