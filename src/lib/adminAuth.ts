import { createHmac } from 'crypto'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'bemellou_admin'

function getSecret(): string {
  return process.env.ADMIN_PASSWORD ?? ''
}

function sign(value: string): string {
  return createHmac('sha256', getSecret()).update(value).digest('hex')
}

export function verifyPassword(password: string): boolean {
  const secret = getSecret()
  if (!secret) return false
  // Constant-time-ish comparison via HMAC of both sides
  return sign(password) === sign(secret)
}

export async function createAdminSession() {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, sign('admin-session'), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  })
}

export async function isAdmin(): Promise<boolean> {
  if (!getSecret()) return false
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  return token === sign('admin-session')
}

export async function destroyAdminSession() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}
