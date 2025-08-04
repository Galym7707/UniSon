//app/layout.tsx

import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

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
  title: 'Unison-AI',
  description: 'Unison-AI platform for AI-powered tools and modules',
  generator: 'Unison-AI',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}