import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

function getJwtSecret() {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET environment variable is not set')
  return new TextEncoder().encode(process.env.JWT_SECRET)
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
