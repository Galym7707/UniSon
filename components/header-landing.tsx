// 📁 components/header-landing.tsx
'use client'

import Link   from 'next/link'
import Image  from 'next/image'
import { useState } from 'react'
import { useAuthState } from '@/lib/supabase/hooks'
import { UserProfileHeader } from './user-profile-header'

export function Header() {
  const [open, setOpen] = useState(false)
  const { user, loading } = useAuthState()

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100" role="banner">
      <div className="container mx-auto h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* ── logo ───────────────────────────── */}
        <Link href="/" className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black rounded">
          <Image
            src="/LOGO2(1).png"
            alt="UnisonAI logo"
            width={140}
            height={40}
            className="h-8 sm:h-10 w-auto"
            priority
          />
        </Link>

        {/* ── desktop nav ────────────────────── */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-base font-medium" role="navigation" aria-label="Main navigation">
          <Link 
            href="/" 
            className="text-gray-700 hover:text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black rounded px-2 py-1 transition-colors"
          >
            Product
          </Link>
          <a 
            href="#features" 
            className="text-gray-700 hover:text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black rounded px-2 py-1 transition-colors"
          >
            Functions
          </a>
          <Link 
            href="#uni-modules" 
            className="text-gray-700 hover:text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black rounded px-2 py-1 transition-colors"
          >
            Programs
          </Link>
          <Link 
            href="#tools" 
            className="text-gray-700 hover:text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black rounded px-2 py-1 transition-colors"
          >
            Tools
          </Link>
          <Link 
            href="#pricing" 
            className="text-gray-700 hover:text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black rounded px-2 py-1 transition-colors"
          >
            Pricing
          </Link>
          <a 
            href="#footer" 
            className="text-gray-700 hover:text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black rounded px-2 py-1 transition-colors"
          >
            Contacts
          </a>
        </nav>

        {/* ── desktop CTA buttons / profile ────────────── */}
        <div className="hidden lg:flex items-center gap-3 xl:gap-4">
          {loading ? (
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
          ) : user ? (
            <UserProfileHeader />
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-base font-medium text-gray-700 hover:text-black px-3 py-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black rounded transition-colors"
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-md bg-black px-4 py-2 text-base font-semibold text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* ── hamburger icon ─────────────────── */}
        <button
          className="lg:hidden flex flex-col justify-center items-center w-10 h-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black rounded"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen(!open)}
        >
          <span className={`block h-0.5 w-6 bg-black transition-all duration-200 ${open ? 'rotate-45 translate-y-1.5' : ''}`} />
          <span className={`block h-0.5 w-6 bg-black my-1 transition-all duration-200 ${open ? 'opacity-0' : ''}`} />
          <span className={`block h-0.5 w-6 bg-black transition-all duration-200 ${open ? '-rotate-45 -translate-y-1.5' : ''}`} />
        </button>
      </div>

      {/* ── mobile nav ──────────────────────── */}
      {open && (
        <div 
          id="mobile-navigation"
          className="lg:hidden w-full bg-white border-t border-gray-200 shadow-lg"
          role="navigation"
          aria-label="Mobile navigation"
        >
          <nav className="flex flex-col px-4 py-2 space-y-1">
            <Link 
              href="/" 
              className="w-full text-center py-3 text-gray-700 hover:text-black hover:bg-gray-50 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors"
              onClick={() => setOpen(false)}
            >
              Product
            </Link>
            <a 
              href="#features" 
              className="w-full text-center py-3 text-gray-700 hover:text-black hover:bg-gray-50 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors"
              onClick={() => setOpen(false)}
            >
              Functions
            </a>
            <Link 
              href="#uni-modules" 
              className="w-full text-center py-3 text-gray-700 hover:text-black hover:bg-gray-50 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors"
              onClick={() => setOpen(false)}
            >
              Programs
            </Link>
            <Link 
              href="#tools" 
              className="w-full text-center py-3 text-gray-700 hover:text-black hover:bg-gray-50 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors"
              onClick={() => setOpen(false)}
            >
              Tools
            </Link>
            <Link 
              href="#pricing" 
              className="w-full text-center py-3 text-gray-700 hover:text-black hover:bg-gray-50 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors"
              onClick={() => setOpen(false)}
            >
              Pricing
            </Link>
            <a 
              href="#footer" 
              className="w-full text-center py-3 text-gray-700 hover:text-black hover:bg-gray-50 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors"
              onClick={() => setOpen(false)}
            >
              Contacts
            </a>

            {/* mobile CTA buttons / profile */}
            <div className="flex flex-col items-center gap-3 pt-4 pb-2 border-t border-gray-200 mt-4">
              {loading ? (
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              ) : user ? (
                <div className="w-full flex justify-center">
                  <UserProfileHeader />
                </div>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="text-base font-medium text-gray-700 hover:text-black px-4 py-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black rounded transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="w-full max-w-xs rounded-md bg-black px-4 py-2 text-base font-semibold text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black text-center transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}