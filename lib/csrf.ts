import type { NextRequest } from 'next/server'

// Block cross-site POSTs that ride on the visitor's cookies. sameSite=lax
// already prevents most cross-origin fetch CSRF, but top-level form POSTs
// still travel with cookies — this Origin check closes that gap.
export function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin')
  if (!origin) return false
  try {
    return new URL(origin).origin === req.nextUrl.origin
  } catch {
    return false
  }
}
