import { NextRequest, NextResponse } from 'next/server'
import { DEMO_COOKIE_NAME } from '@/lib/demo/store'
import { isSameOrigin } from '@/lib/csrf'

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(DEMO_COOKIE_NAME, '', { maxAge: 0, path: '/' })
  return res
}
