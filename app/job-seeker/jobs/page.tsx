'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LayoutDashboard, User, Search, Settings, Heart, MapPin, Clock, Building2, Brain, AlertCircle, Sparkles, Filter } from "lucide-react"
import Link from "next/link"
import { createBrowserClient } from '@/lib/supabase/browser'
import { Header } from '@/components/header-landing'
import { Footer } from '@/components/footer'
import { usePathname, useRouter } from 'next/navigation'

type Job = {
  id: string
  title: string
  company: string
  location: string
  salary_min: number
  salary_max: number
  employment_type: string
  remote: boolean
  posted_at: string
  skills: string[]
  description: string
  match_score?: number
  reasoning?: string
}

const SidebarLink = ({ href, icon, children, pathname }: {
  href: string
  icon: React.ReactNode
  children: React.ReactNode
  pathname: string
}) => {
  const isActive = pathname === href || pathname.startsWith(href + '/')
  
  return (
    <Link
      href={href}
      className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
        isActive 
          ? 'text-[#00C49A] bg-[#00C49A]/10 font-semibold' 
          : 'text-[#333333] hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <div className="w-5 h-5 mr-3">{icon}</div>
      {children}
    </Link>
  )
}

export default function JobsPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to the search page since we're consolidating these pages
    router.replace('/job-seeker/search')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-gray-600">Redirecting to Browse & Search Jobs...</p>
      </div>
    </div>
  )
}