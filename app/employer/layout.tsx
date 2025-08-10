'use client'

import React from 'react'
import EmployerSidebar from '@/components/EmployerSidebar'

export default function EmployerSectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Employer fixed sidebar */}
      <EmployerSidebar />
      {/* Content area with left offset for sidebar */}
      <div className="ml-64 p-6">
        {children}
      </div>
    </div>
  )
}


