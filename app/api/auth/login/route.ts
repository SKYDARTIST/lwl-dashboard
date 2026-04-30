import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase/server'
import { signToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

const attempts = new Map<string, { count: number; resetAt: number }>()
const LOGIN_WINDOW_MS = 15 * 60 * 1000
const LOGIN_LIMIT = 10

function getRateLimitKey(req: NextRequest, email: unknown) {
  const forwardedFor = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const ip = forwardedFor || req.headers.get('x-real-ip') || 'unknown'
  return `${ip}:${String(email || '').toLowerCase().trim()}`
}

function isRateLimited(key: string) {
  const now = Date.now()
  const current = attempts.get(key)

  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + LOGIN_WINDOW_MS })
    return false
  }

  current.count += 1
  attempts.set(key, current)
  return current.count > LOGIN_LIMIT
}

export async function POST(req: NextRequest) {
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

  const rateLimitKey = getRateLimitKey(req, email)
  if (isRateLimited(rateLimitKey)) {
    return NextResponse.json({ error: 'Too many login attempts. Try again later.' }, { status: 429 })
  }

  const supabase = getSupabase()
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .single()

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  const token = await signToken({ id: user.id, name: user.name, role: user.role })

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
