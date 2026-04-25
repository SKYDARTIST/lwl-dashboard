import { cookies } from 'next/headers'
import { jwtVerify, SignJWT } from 'jose'
import type { JWTUser } from './types'

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

export async function getUser(): Promise<JWTUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as JWTUser
  } catch {
    return null
  }
}

export async function signToken(payload: JWTUser): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}
