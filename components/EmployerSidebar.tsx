'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  Users,
  Settings
} from 'lucide-react'

const navigationItems = [
  {
    href: '/employer/dashboard',
    icon: LayoutDashboard,
    text: 'Dashboard',
    key: 'dashboard'
  },
  {
    href: '/employer/company',
    icon: Building2,
    text: 'Company',
    key: 'company'
  },
  {
    href: '/employer/candidates',
    icon: Users,
    text: 'Candidates',
    key: 'candidates'
  },
  {
    href: '/employer/settings',
    icon: Settings,
    text: 'Settings',
    key: 'settings'
  }
]

export default function EmployerSidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    // Handle exact matches
    if (pathname === href) return true
    
    // Handle nested routes
    if (pathname.startsWith(href + '/')) return true
    
    return false
  }

  return (
    <aside className="fixed left-0 top-0 z-30 h-screen w-64 bg-white border-r border-gray-200">
      <div className="flex flex-col h-full">
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              
              return (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      active
                        ? 'bg-[#FF7A00]/10 text-[#FF7A00] font-semibold border-l-4 border-[#FF7A00]'
                        : 'text-gray-700 hover:text-[#FF7A00] hover:bg-orange-50'
                    }`}
                  >
                    <Icon 
                      className={`mr-3 h-5 w-5 transition-colors ${
                        active ? 'text-[#FF7A00]' : 'text-gray-500 group-hover:text-[#FF7A00]'
                      }`} 
                    />
                    {item.text}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </aside>
  )
}