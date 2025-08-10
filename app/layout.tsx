//app/layout.tsx

import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { GlobalErrorBoundary } from '@/components/error-boundary'

// Validate environment variables at application startup
import { getEnvironmentConfig } from '../lib/env'

// Initialize environment validation
try {
  getEnvironmentConfig()
} catch (error) {
  // Environment validation errors will be logged by the validation module
  // The error will also be thrown at runtime when clients are created
}

export const metadata: Metadata = {
  title: 'Unison-AI - AI-Powered Platform for Recruitment and Team Management',
  description: 'UnisonAI unifies recruiting, CRM & projects in one powerful platform. Advance your entire organization with intelligent automation and AI-driven people analytics.',
  generator: 'Unison-AI',
  keywords: 'AI recruitment, team management, CRM, project management, hiring platform, automation',
  authors: [{ name: 'UnisonAI' }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Unison-AI - AI-Powered Platform for Recruitment and Team Management',
    description: 'UnisonAI unifies recruiting, CRM & projects in one powerful platform.',
    type: 'website',
    siteName: 'UnisonAI',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#0A2540',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning={true}>
        <a 
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-black focus:text-white focus:rounded focus:outline-none focus:ring-2 focus:ring-white"
        >
          Skip to main content
        </a>
        <GlobalErrorBoundary>
          <main id="main-content">
            {children}
          </main>
          <Toaster />
        </GlobalErrorBoundary>
      </body>
    </html>
  )
}