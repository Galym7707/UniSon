'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { LayoutDashboard, Briefcase, Building2, Users, Settings } from 'lucide-react'
import { UserProfile } from '@/lib/auth-helpers'

interface EmployerNavbarProps {
  userProfile?: UserProfile
}

export default function EmployerNavbar({ userProfile }: EmployerNavbarProps) {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === '/employer/dashboard') {
      return pathname === path
    }
    return pathname?.startsWith(path)
  }

  const navItems = [
    {
      href: '/employer/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard'
    },
    {
      href: '/employer/jobs',
      icon: Briefcase,
      label: 'Jobs'
    },
    {
      href: '/employer/company',
      icon: Building2,
      label: 'Company Profile'
    },
    {
      href: '/employer/candidates',
      icon: Users,
      label: 'Candidates'
    },
    {
      href: '/employer/settings',
      icon: Settings,
      label: 'Settings'
    }
  ]

  return (
    <div className="w-64 bg-white shadow-sm border-r">
      <div className="p-6">
        <Link href="/employer/dashboard" className="text-xl font-bold text-[#0A2540]">
          Unison AI
        </Link>
        <p className="text-sm text-[#333333] mt-1">Employer Dashboard</p>
        {userProfile && (
          <div className="mt-2 text-xs text-gray-500">
            Welcome, {userProfile.name || userProfile.email}
            <Badge variant="secondary" className="ml-2 text-xs">
              {userProfile.role}
            </Badge>
          </div>
        )}
      </div>
      <nav className="px-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                active
                  ? 'text-[#FF7A00] bg-[#FF7A00]/10'
                  : 'text-[#333333] hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}