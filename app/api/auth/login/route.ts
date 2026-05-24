import { NextRequest, NextResponse } from 'next/server'
import { signToken } from '@/lib/auth'
import { SEED_USERS } from '@/lib/demo/seed'
import { isSameOrigin } from '@/lib/csrf'

// Demo mode: any email + any non-empty password is accepted. If the email
// matches a seeded user, the visitor "becomes" that user (Aarav, Priya, …).
// Unrecognized emails get the dedicated guest identity (u-guest), which has
// its own clean assignments so submit/review flows aren't blocked by Aarav's
// already-submitted work.
const GENERIC_DEMO_STUDENT = { id: 'u-guest', name: 'Guest Student', role: 'student' as const }

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: { email?: unknown; password?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { email, password } = body

  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }

  const normalized = email.toLowerCase().trim()
  const seeded = SEED_USERS.find(u => u.email === normalized)
  const user = seeded
    ? { id: seeded.id, name: seeded.name, role: seeded.role }
    : GENERIC_DEMO_STUDENT

  const token = await signToken(user)

  const res = NextResponse.json({ role: user.role, name: user.name })
  res.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  return res
}
