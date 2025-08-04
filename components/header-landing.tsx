// 📁 components/header-landing.tsx
'use client'

import Link   from 'next/link'
import Image  from 'next/image'
import { useState } from 'react'

export function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full bg-white">
      <div className="container mx-auto h-16 flex items-center justify-between px-2 md:px-6">
        {/* ── logo ───────────────────────────── */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/LOGO2(1).png"
            alt="UnisonAI logo"
            width={140}
            height={40}
            className="h-8 md:h-10 w-auto"
            priority
          />
        </Link>

        {/* ── desktop nav ────────────────────── */}
        <nav className="hidden md:flex items-center gap-8 text-base font-medium">
          <Link href="/"           className="text-gray-700 hover:text-black">Product</Link>
          <a  href="#features"     className="text-gray-700 hover:text-black">Functions</a>
          <Link href="#uni-modules" className="text-gray-700 hover:text-black">Programs</Link>
          <Link href="#tools"      className="text-gray-700 hover:text-black">Tools</Link>
          <Link href="#pricing"    className="text-gray-700 hover:text-black">Pricing</Link>
          <a  href="#footer"       className="text-gray-700 hover:text-black">Contacts</a>
        </nav>

        {/* ── desktop CTA buttons ────────────── */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/auth/login"
            className="text-base font-medium text-gray-700 hover:text-black px-2 py-1"
          >
            Login
          </Link>
          <Link
            href="/auth/signup"
            className="rounded-md bg-black px-4 py-2 text-base font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            Sign up
          </Link>
        </div>

        {/* ── hamburger icon ─────────────────── */}
        <button
          className="md:hidden flex flex-col justify-center items-center w-10 h-10"
          aria-label="Open navigation"
          onClick={() => setOpen(!open)}
        >
          <span className={`block h-0.5 w-6 bg-black transition-all duration-200 ${open ? 'rotate-45 translate-y-1.5' : ''}`} />
          <span className={`block h-0.5 w-6 bg-black my-1 transition-all duration-200 ${open ? 'opacity-0' : ''}`} />
          <span className={`block h-0.5 w-6 bg-black transition-all duration-200 ${open ? '-rotate-45 -translate-y-1.5' : ''}`} />
        </button>
      </div>

      {/* ── mobile nav ──────────────────────── */}
      {open && (
        <div className="md:hidden w-full bg-white border-t border-gray-200">
          <nav className="flex flex-col items-center gap-2 py-2 text-base font-medium">
            <Link href="/"           className="w-full text-center text-gray-700 hover:text-black"     onClick={() => setOpen(false)}>Product</Link>
            <a  href="#features"     className="w-full text-center text-gray-700 hover:text-black"     onClick={() => setOpen(false)}>Functions</a>
            <Link href="#uni-modules" className="w-full text-center text-gray-700 hover:text-black"    onClick={() => setOpen(false)}>Programs</Link>
            <Link href="#tools"      className="w-full text-center text-gray-700 hover:text-black"     onClick={() => setOpen(false)}>Tools</Link>
            <Link href="#pricing"    className="w-full text-center text-gray-700 hover:text-black"     onClick={() => setOpen(false)}>Pricing</Link>
            <a  href="#footer"       className="w-full text-center text-gray-700 hover:text-black"     onClick={() => setOpen(false)}>Contacts</a>

            {/* mobile CTA buttons */}
            <div className="flex flex-col items-center gap-2 mt-2">
              <Link
                href="/auth/login"
                className="text-base font-medium text-gray-700 hover:text-black px-2 py-1"
                onClick={() => setOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-md bg-black px-4 py-2 text-base font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                onClick={() => setOpen(false)}
              >
                Sign up
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
