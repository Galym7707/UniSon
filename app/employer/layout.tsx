'use client'

import React from 'react'
import EmployerSidebar from '@/components/EmployerSidebar'
import { Header } from '@/components/header-landing'

export default function EmployerSectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Employer fixed sidebar */}
      <EmployerSidebar />
      {/* Content area with left offset for sidebar and padding for header height */}
      <div className="ml-64 p-6 pt-16">
        {children}
      </div>
    </div>
  )
}


