import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
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
