import { cookies } from 'next/headers'
import { jwtVerify, SignJWT } from 'jose'
import type { JWTUser } from './types'

// Demo mode runs without external infra, so JWT_SECRET falls back to a fixed
// string when unset. The cookie still authenticates the visitor's chosen
// demo role for the session — there's no real account to protect.
const DEMO_JWT_FALLBACK = 'nexus-demo-jwt-secret-not-for-production-use'

function getJwtSecret() {
  const jwtSecret = process.env.JWT_SECRET || DEMO_JWT_FALLBACK
  return new TextEncoder().encode(jwtSecret)
}

export async function getUser(): Promise<JWTUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    return payload as unknown as JWTUser
  } catch {
    return null
  }
}

export async function signToken(payload: JWTUser): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(getJwtSecret())
}
