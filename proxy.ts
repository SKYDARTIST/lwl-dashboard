import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('token')?.value

  // Public: API auth routes
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  // Login page: redirect to dashboard if already logged in
  if (pathname === '/login') {
    if (token) {
      try {
        const { payload } = await jwtVerify(token, secret)
        return NextResponse.redirect(new URL(`/${payload.role}/dashboard`, req.url))
      } catch {}
    }
    return NextResponse.next()
  }

  // Root: redirect based on auth state
  if (pathname === '/') {
    if (token) {
      try {
        const { payload } = await jwtVerify(token, secret)
        return NextResponse.redirect(new URL(`/${payload.role}/dashboard`, req.url))
      } catch {}
    }
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Protected routes: require valid token
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  try {
    const { payload } = await jwtVerify(token, secret)
    const role = payload.role as string

    // Block cross-role access
    if (pathname.startsWith('/student') && role !== 'student') {
      return NextResponse.redirect(new URL(`/${role}/dashboard`, req.url))
    }
    if (pathname.startsWith('/mentor') && role !== 'mentor') {
      return NextResponse.redirect(new URL(`/${role}/dashboard`, req.url))
    }

    return NextResponse.next()
  } catch {
    const res = NextResponse.redirect(new URL('/login', req.url))
    res.cookies.set('token', '', { maxAge: 0, path: '/' })
    return res
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
