// 📁 middleware.ts
// Global middleware used by Next.js (edge runtime)
// 1. Boots a Supabase server‑side client that understands Next cookies.
// 2. Redirects any unauthenticated visitor away from protected routes.
// 3. Mirrors any cookie mutations Supabase makes (sign‑in / sign‑out) back to the
//    browser via `NextResponse`.
//
//  If you add *new* auth‑protected sections, simply extend `protectedPrefixes` or
//  the `matcher` below.

import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(req: NextRequest) {
  // The response we will eventually return (mutated if needed).
  const res = NextResponse.next()

  /**
   * Initialise a Supabase client that can read *and* write auth cookies while
   * running inside the edge‑runtime. We explicitly mirror any cookie writes
   * into the outgoing `NextResponse`, otherwise they would be lost.
   */
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options?: CookieOptions) {
          // Mirror to the *incoming* request (for this middleware run)
          //  and to the response that will be sent to the browser.
          req.cookies.set({ name, value, ...options })
          res.cookies.set({ name, value, ...options })
        },
        remove(name: string, options?: CookieOptions) {
          req.cookies.delete(name)
          res.cookies.set({ name, value: '', ...options, maxAge: 0 })
        }
      }
    }
  )

  // -------------------------
  // 1.  GET CURRENT SESSION
  // -------------------------
  const {
    data: { session }
  } = await supabase.auth.getSession()

  // -------------------------
  // 2.  PROTECTED ROUTE CHECK
  // -------------------------
  const protectedPrefixes = ['/job-seeker', '/employer']
  const isProtected = protectedPrefixes.some(prefix => req.nextUrl.pathname.startsWith(prefix))

  // Helpful debugging in dev
  if (process.env.NODE_ENV === 'development') {
    console.debug('[middleware]', {
      pathname: req.nextUrl.pathname,
      isProtected,
      sessionUser: session?.user?.email ?? null
    })
  }

  if (isProtected && !session) {
    // Bounce unauthenticated users to the login page and remember where they
    // came from so we can send them back afterwards.
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = '/auth/login'
    loginUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Everything OK → continue.
  return res
}

/**
 * The matcher tells Next which routes should invoke this middleware. *Non‑auth*
 * pages stay ultra‑fast because they bypass the edge runtime completely.
 */
export const config = {
  matcher: ['/job-seeker/:path*', '/employer/:path*']
}