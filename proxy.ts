import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

// Demo mode runs without external infra — fall back to a fixed string when
// JWT_SECRET is unset. Must match the fallback in lib/auth.ts.
const DEMO_JWT_FALLBACK = 'nexus-demo-jwt-secret-not-for-production-use'

function getJwtSecret() {
  const secret = process.env.JWT_SECRET || DEMO_JWT_FALLBACK
  return new TextEncoder().encode(secret)
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  const token = req.cookies.get('token')?.value
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    const role = payload.role as string

    if (pathname.startsWith('/student') && role !== 'student') {
      return NextResponse.redirect(new URL('/mentor', req.url))
    }
    if (pathname.startsWith('/mentor') && role !== 'mentor') {
      return NextResponse.redirect(new URL('/student', req.url))
    }

    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

export const config = {
  matcher: ['/student/:path*', '/mentor/:path*'],
}
