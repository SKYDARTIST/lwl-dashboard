import { cookies } from 'next/headers'
import { jwtVerify, SignJWT } from 'jose'
import type { JWTUser } from './types'

function getJwtSecret() {
  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) throw new Error('JWT_SECRET environment variable is not set')
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
