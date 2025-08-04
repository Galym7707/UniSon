import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => req.cookies.set(name, value))
          res.cookies.setAll(cookiesToSet)
        },
      },
    }
  )

  // Get session
  const { data: { session } } = await supabase.auth.getSession()

  const protectedRoutes = ['/job-seeker', '/employer']
  const isProtected = protectedRoutes.some((r) => req.nextUrl.pathname.startsWith(r))

  // Debug logging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log('Middleware:', {
      pathname: req.nextUrl.pathname,
      isProtected,
      hasSession: !!session,
      sessionUser: session?.user?.email,
      cookies: req.cookies.getAll().map(c => c.name)
    })
  }

  if (isProtected && !session) {
    console.log('Redirecting to login - no session found')
    const loginURL = new URL('/auth/login', req.url)
    return NextResponse.redirect(loginURL)
  }

  return res
}

export const config = {
  matcher: ['/job-seeker/:path*', '/employer/:path*'],
} 